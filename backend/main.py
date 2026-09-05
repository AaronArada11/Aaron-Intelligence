from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.langfuse_tracing import (
    flush_langfuse,
    get_current_trace_id,
    get_runtime_environment,
    safe_end,
    safe_update,
    start_observation,
)
from backend.retriever import (
    EMBEDDING_MODEL,
    RETRIEVAL_MATCH_COUNT,
    retrieve,
)
from backend.gemini_client import get_gemini_client
from pathlib import Path
import os
import requests
import time
import traceback

load_dotenv(Path(__file__).resolve().parent / ".env")

fastapi_app = FastAPI()

FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"
GITHUB_API_URL = "https://api.github.com"
COMMITS_CACHE_SECONDS = 300
CHAT_MODEL = "gemini-2.5-flash"
RETRIEVAL_MIN_SIMILARITY = 0.25
commits_cache = {
    "key": None,
    "expires_at": 0,
    "data": None,
}

LANGUAGE_BY_EXTENSION = {
    ".astro": "Astro",
    ".c": "C",
    ".cc": "C++",
    ".cpp": "C++",
    ".cs": "C#",
    ".css": "CSS",
    ".dart": "Dart",
    ".go": "Go",
    ".html": "HTML",
    ".java": "Java",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".json": "JSON",
    ".kt": "Kotlin",
    ".md": "Markdown",
    ".php": "PHP",
    ".py": "Python",
    ".rb": "Ruby",
    ".rs": "Rust",
    ".scss": "SCSS",
    ".sh": "Shell",
    ".sql": "SQL",
    ".swift": "Swift",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".vue": "Vue",
    ".yaml": "YAML",
    ".yml": "YAML",
}

LANGUAGE_BY_FILENAME = {
    "dockerfile": "Dockerfile",
    "makefile": "Makefile",
}


@fastapi_app.get("/favicon.ico")
@fastapi_app.get("/favicon.png")
def favicon():
    return Response(status_code=204)


class ChatRequest(BaseModel):
    message: str
    include_metrics: bool = False
    evaluation_run: int | None = None
    evaluation_question: int | None = None


def _is_rate_limit_error(exc):
    status_code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    if status_code == 429:
        return True

    message = str(exc).lower()
    rate_limit_terms = (
        "429",
        "rate limit",
        "rate_limit",
        "quota",
        "resource_exhausted",
        "too many requests",
    )
    return any(term in message for term in rate_limit_terms)


def _elapsed_ms(started):
    return round((time.perf_counter() - started) * 1000, 3)


def _usage_value(usage_metadata, field):
    if usage_metadata is None:
        return None
    value = getattr(usage_metadata, field, None)
    if value is None and isinstance(usage_metadata, dict):
        value = usage_metadata.get(field)
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _gemini_usage_details(response):
    usage_metadata = getattr(response, "usage_metadata", None)
    provider_usage = {
        "input_tokens": _usage_value(usage_metadata, "prompt_token_count"),
        "output_tokens": _usage_value(usage_metadata, "candidates_token_count"),
        "thoughts_tokens": _usage_value(usage_metadata, "thoughts_token_count"),
        "cached_tokens": _usage_value(
            usage_metadata,
            "cached_content_token_count",
        ),
        "total_tokens": _usage_value(usage_metadata, "total_token_count"),
    }
    provider_usage = {
        key: value
        for key, value in provider_usage.items()
        if value is not None
    }

    langfuse_usage = {}
    usage_mapping = {
        "input_tokens": "input",
        "output_tokens": "output",
        "thoughts_tokens": "reasoning",
        "cached_tokens": "cache_read_input_tokens",
        "total_tokens": "total",
    }
    for provider_key, langfuse_key in usage_mapping.items():
        if provider_key in provider_usage:
            langfuse_usage[langfuse_key] = provider_usage[provider_key]

    return provider_usage, langfuse_usage


def _retrieval_observation_output(retrieved_docs, latency_ms):
    documents = []
    for doc in retrieved_docs or []:
        similarity = doc.get("similarity")
        if isinstance(similarity, (int, float)):
            similarity = round(float(similarity), 6)
        documents.append({
            "source": doc.get("source"),
            "chunk_id": doc.get("chunk_id"),
            "similarity": similarity,
        })

    return {
        "document_count": len(documents),
        "latency_ms": latency_ms,
        "documents": documents,
    }


def _chat_payload(answer, request, metrics, trace_id):
    payload = {"answer": answer}
    if request.include_metrics:
        payload["metrics"] = metrics
        if trace_id:
            payload["trace_id"] = trace_id
    return payload


def _github_headers():
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _get_commit_detail(repo_name, sha):
    response = requests.get(
        f"{GITHUB_API_URL}/repos/{repo_name}/commits/{sha}",
        headers=_github_headers(),
        timeout=10,
    )
    if not response.ok:
        return None
    return response.json()


def _language_for_file(filename):
    name = filename.rsplit("/", 1)[-1].lower()
    if name in LANGUAGE_BY_FILENAME:
        return LANGUAGE_BY_FILENAME[name]

    extension = os.path.splitext(name)[1]
    return LANGUAGE_BY_EXTENSION.get(extension)


def _build_language_segments(commits):
    totals = {}
    for commit in commits:
        for file in commit.get("files", []):
            language = file.get("language")
            if not language:
                continue

            changes = file.get("changes") or 0
            if changes <= 0:
                changes = 1

            totals[language] = totals.get(language, 0) + changes

    total_changes = sum(totals.values())
    if not total_changes:
        return []

    ranked = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    if len(ranked) > 8:
        visible = ranked[:7]
        other_total = sum(changes for _, changes in ranked[7:])
        ranked = visible + [("Other", other_total)]

    segments = []
    for language, changes in ranked:
        segments.append({
            "language": language,
            "percentage": round((changes / total_changes) * 100, 1),
        })

    displayed_total = sum(segment["percentage"] for segment in segments)
    if segments and displayed_total != 100:
        segments[0]["percentage"] = round(
            segments[0]["percentage"] + (100 - displayed_total),
            1,
        )

    return segments


def _normalize_commit(repo_name, commit, fallback_date, fallback_author):
    sha = commit.get("sha")
    commit_data = commit.get("commit", {})
    stats = commit.get("stats") or {}
    message = commit_data.get("message", "").splitlines()[0]
    if not sha or not message:
        return None

    repository_url = f"https://github.com/{repo_name}"
    author = commit_data.get("author") or {}
    files = []

    for file in commit.get("files", []):
        language = _language_for_file(file.get("filename", ""))
        if not language:
            continue

        additions = file.get("additions") or 0
        deletions = file.get("deletions") or 0
        files.append({
            "filename": file.get("filename"),
            "language": language,
            "changes": additions + deletions,
        })

    return {
        "oid": sha,
        "abbreviatedOid": sha[:7],
        "messageHeadline": message,
        "committedDate": author.get("date") or fallback_date,
        "url": commit.get("html_url") or f"{repository_url}/commit/{sha}",
        "repository": repo_name,
        "repositoryUrl": repository_url,
        "additions": stats.get("additions"),
        "deletions": stats.get("deletions"),
        "files": files,
        "author": {
            "name": author.get("name") or fallback_author.get("name"),
            "avatarUrl": fallback_author.get("avatarUrl"),
        },
    }


def _get_push_commits(event, limit):
    if limit <= 0:
        return []

    repo_name = event.get("repo", {}).get("name")
    payload = event.get("payload", {})
    before = payload.get("before")
    head = payload.get("head")
    if not repo_name or not head:
        return []

    fallback_author = {
        "name": event.get("actor", {}).get("display_login"),
        "avatarUrl": event.get("actor", {}).get("avatar_url"),
    }

    if before and set(before) != {"0"}:
        response = requests.get(
            f"{GITHUB_API_URL}/repos/{repo_name}/compare/{before}...{head}",
            headers=_github_headers(),
            timeout=10,
        )
        if response.ok:
            commits = response.json().get("commits", [])
            normalized = []
            for commit in reversed(commits):
                detail = _get_commit_detail(repo_name, commit.get("sha"))
                normalized_commit = _normalize_commit(
                    repo_name,
                    detail or commit,
                    event.get("created_at"),
                    fallback_author,
                )
                if normalized_commit:
                    normalized.append(normalized_commit)
                if len(normalized) >= limit:
                    break
            return normalized

    commit_detail = _get_commit_detail(repo_name, head)
    if not commit_detail:
        return []

    commit = _normalize_commit(
        repo_name,
        commit_detail,
        event.get("created_at"),
        fallback_author,
    )
    return [commit] if commit else []


def _configured_repositories(username):
    configured = os.getenv("GITHUB_REPOS", "").strip()
    if configured:
        return [
            repo.strip()
            for repo in configured.split(",")
            if "/" in repo.strip()
        ]

    repo = os.getenv("GITHUB_REPO", "").strip()
    owner = os.getenv("GITHUB_OWNER", username).strip()
    if repo:
        return [f"{owner}/{repo}"]

    if os.getenv("GITHUB_TOKEN"):
        return [f"{username}/Aaron-Intelligence"]

    return []


def _get_repository_commits(repo_name, limit):
    response = requests.get(
        f"{GITHUB_API_URL}/repos/{repo_name}/commits",
        params={"per_page": limit},
        headers=_github_headers(),
        timeout=10,
    )
    if not response.ok:
        return []

    commits = []
    for commit in response.json():
        detail = _get_commit_detail(repo_name, commit.get("sha"))
        normalized_commit = _normalize_commit(
            repo_name,
            detail or commit,
            commit.get("commit", {}).get("author", {}).get("date"),
            {
                "name": commit.get("commit", {}).get("author", {}).get("name"),
                "avatarUrl": None,
            },
        )
        if normalized_commit:
            commits.append(normalized_commit)
        if len(commits) >= limit:
            break

    return commits


def _dedupe_and_sort_commits(commits, limit):
    by_sha = {}
    for commit in commits:
        by_sha[commit["oid"]] = commit

    return sorted(
        by_sha.values(),
        key=lambda commit: commit.get("committedDate") or "",
        reverse=True,
    )[:limit]


def _get_recent_commits(username: str, limit: int):
    configured_repositories = _configured_repositories(username)
    commits = []

    for repo_name in configured_repositories:
        commits.extend(_get_repository_commits(repo_name, limit))

    events_path = "events" if os.getenv("GITHUB_TOKEN") else "events/public"
    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/{events_path}",
        params={"per_page": 100},
        headers=_github_headers(),
        timeout=10,
    )

    if response.status_code == 404 and not commits:
        raise HTTPException(status_code=404, detail="GitHub user not found.")
    if response.status_code >= 400 and not commits:
        raise HTTPException(
            status_code=response.status_code,
            detail="GitHub events request failed."
        )

    events = response.json() if response.ok else []
    event_commits = 0
    for event in events:
        if event_commits >= limit:
            break

        if event.get("type") != "PushEvent":
            continue

        for commit in _get_push_commits(event, limit - event_commits):
            commits.append(commit)
            event_commits += 1
            if event_commits >= limit:
                break

    commits = _dedupe_and_sort_commits(commits, limit)
    return {
        "username": username,
        "source": "authenticated" if os.getenv("GITHUB_TOKEN") else "public",
        "repositories": configured_repositories,
        "commits": commits,
        "languageSegments": _build_language_segments(commits),
    }


@fastapi_app.get("/github-commits")
@fastapi_app.get("/api/github-commits")
@fastapi_app.get("/api/github_commits")
def github_commits():
    username = os.getenv("GITHUB_USERNAME", os.getenv("GITHUB_OWNER", "AaronArada11"))
    try:
        limit = int(os.getenv("GITHUB_COMMITS_LIMIT", "5"))
    except ValueError:
        limit = 5
    limit = max(1, min(limit, 20))
    repo_key = ",".join(_configured_repositories(username))
    cache_key = f"{username}:{limit}:{repo_key}:{bool(os.getenv('GITHUB_TOKEN'))}"
    now = time.time()

    if (
        commits_cache["key"] == cache_key
        and commits_cache["data"]
        and commits_cache["expires_at"] > now
    ):
        return commits_cache["data"]

    data = _get_recent_commits(username, limit)
    commits_cache.update({
        "key": cache_key,
        "expires_at": now + COMMITS_CACHE_SECONDS,
        "data": data,
    })
    return data


@fastapi_app.post("/chat")
@fastapi_app.post("/api/chat")
def chat(request: ChatRequest, http_response: Response):
    request_started = time.perf_counter()
    trace_metadata = {
        "app": "Aaron Intelligence",
        "route": "/chat",
        "model": CHAT_MODEL,
        "environment": get_runtime_environment(),
        "evaluation": request.include_metrics,
        "evaluation_run": request.evaluation_run,
        "evaluation_question": request.evaluation_question,
    }

    with start_observation(
        as_type="span",
        name="chat-request",
        input=request.message,
        metadata=trace_metadata,
        end_on_exit=False,
    ) as trace:
        trace_id = get_current_trace_id()
        if trace_id:
            http_response.headers["X-Langfuse-Trace-Id"] = trace_id

        try:
            retrieval_span = None
            try:
                with start_observation(
                    as_type="retriever",
                    name="retrieve-context",
                    input=request.message,
                    metadata={
                        "embedding_model": EMBEDDING_MODEL,
                        "match_count": RETRIEVAL_MATCH_COUNT,
                        "similarity_threshold": RETRIEVAL_MIN_SIMILARITY,
                    },
                ) as retrieval_span:
                    retrieval_started = time.perf_counter()
                    retrieved_docs = retrieve(request.message)
                    retrieval_latency_ms = _elapsed_ms(retrieval_started)
                    top_similarity = (
                        retrieved_docs[0].get("similarity")
                        if retrieved_docs
                        else None
                    )
                    passed_threshold = (
                        isinstance(top_similarity, (int, float))
                        and top_similarity >= RETRIEVAL_MIN_SIMILARITY
                    )

                    safe_update(
                        retrieval_span,
                        output={
                            **_retrieval_observation_output(
                                retrieved_docs,
                                retrieval_latency_ms,
                            ),
                            "top_similarity": top_similarity,
                            "passed_threshold": passed_threshold,
                        },
                        metadata={
                            "embedding_model": EMBEDDING_MODEL,
                            "match_count": RETRIEVAL_MATCH_COUNT,
                            "similarity_threshold": RETRIEVAL_MIN_SIMILARITY,
                        },
                    )
            except Exception as exc:
                safe_update(
                    retrieval_span,
                    level="ERROR",
                    status_message=str(exc),
                )
                safe_update(
                    trace,
                    level="ERROR",
                    status_message=f"Retriever error: {str(exc)}",
                )
                traceback.print_exc()

                if _is_rate_limit_error(exc):
                    raise HTTPException(
                        status_code=429,
                        detail=(
                            "Aaron Intelligence is temporarily rate limited. "
                            "Please wait a moment and try again."
                        ),
                    )

                raise HTTPException(
                    status_code=500,
                    detail=f"Retriever error: {str(exc)}"
                )

            if (
                not retrieved_docs
                or top_similarity is None
                or top_similarity < RETRIEVAL_MIN_SIMILARITY
            ):
                answer = (
                    "Sorry, I can't help with that. "
                    "I'm Aaron Intelligence, a portfolio chatbot focused "
                    "exclusively on Aaron Randolph S.D. Arada."
                )
                safe_update(
                    trace,
                    output=answer,
                    metadata={
                        **trace_metadata,
                        "refused": True,
                        "reason": "low_similarity",
                        "document_count": len(retrieved_docs or []),
                        "top_similarity": top_similarity,
                    },
                )
                metrics = {
                    "pipeline_latency_ms": _elapsed_ms(request_started),
                    "retrieval_latency_ms": retrieval_latency_ms,
                    "generation_latency_ms": 0.0,
                    "document_count": len(retrieved_docs or []),
                    "top_similarity": top_similarity,
                    "refused": True,
                }
                return _chat_payload(answer, request, metrics, trace_id)

            context_span = None
            try:
                with start_observation(
                    as_type="span",
                    name="build-context",
                    metadata={
                        "document_count": len(retrieved_docs),
                    },
                ) as context_span:
                    context = "\n\n".join(
                        doc["content"]
                        for doc in retrieved_docs
                    )
                    safe_update(
                        context_span,
                        output={
                            "document_count": len(retrieved_docs),
                            "context_length": len(context),
                        },
                    )

            except Exception as exc:
                safe_update(
                    context_span,
                    level="ERROR",
                    status_message=str(exc),
                )
                safe_update(
                    trace,
                    level="ERROR",
                    status_message=f"Context error: {str(exc)}",
                )
                traceback.print_exc()

                raise HTTPException(
                    status_code=500,
                    detail=f"Context error: {str(exc)}"
                )

            generation = None
            try:
                client = get_gemini_client()

                prompt = f"""
You are Aaron Intelligence.

You are the AI representative of Aaron Randolph S.D. Arada.

Your purpose is to help visitors, recruiters, and collaborators
learn about Aaron through conversation.

You may only answer questions related to:

- Aaron's projects
- Aaron's skills
- Aaron's education
- Aaron's experience
- Aaron's achievements
- Aaron's interests
- Aaron's leadership experience
- Aaron's career goals

If a user refers to Aaron using pronouns such as he, him, his,
the student, the developer, the creator, or the candidate,
treat those references as Aaron Randolph S.D. Arada.

Rules:
- Use ONLY the provided context.
- Do not invent facts.
- Do not make assumptions.
- If the answer cannot be found in the context, say that you do not have that information.
- Keep responses professional, concise, and accurate.
- Do not answer general knowledge questions.
- Do not answer questions unrelated to Aaron.

Context:
{context}

Question:
{request.message}
"""

                with start_observation(
                    as_type="generation",
                    name="gemini-response",
                    input=prompt,
                    model=CHAT_MODEL,
                    metadata={
                        "provider": "google",
                        "document_count": len(retrieved_docs),
                        "context_length": len(context),
                    },
                ) as generation:
                    generation_started = time.perf_counter()
                    response = client.models.generate_content(
                        model=CHAT_MODEL,
                        contents=prompt,
                    )
                    generation_latency_ms = _elapsed_ms(generation_started)
                    answer = response.text
                    provider_usage, langfuse_usage = _gemini_usage_details(response)
                    safe_update(
                        generation,
                        output=answer,
                        usage_details=langfuse_usage or None,
                        metadata={
                            "provider": "google",
                            "latency_ms": generation_latency_ms,
                            **provider_usage,
                        },
                    )

                metrics = {
                    "pipeline_latency_ms": _elapsed_ms(request_started),
                    "retrieval_latency_ms": retrieval_latency_ms,
                    "generation_latency_ms": generation_latency_ms,
                    "document_count": len(retrieved_docs),
                    "top_similarity": retrieved_docs[0].get("similarity"),
                    "context_characters": len(context),
                    "refused": False,
                    **provider_usage,
                }

                safe_update(
                    trace,
                    output=answer,
                    metadata={
                        **trace_metadata,
                        "refused": False,
                        "document_count": len(retrieved_docs),
                        "top_similarity": retrieved_docs[0].get("similarity"),
                        "context_length": len(context),
                        "pipeline_latency_ms": metrics["pipeline_latency_ms"],
                        "retrieval_latency_ms": retrieval_latency_ms,
                        "generation_latency_ms": generation_latency_ms,
                        **provider_usage,
                    },
                )

                return _chat_payload(answer, request, metrics, trace_id)

            except Exception as exc:
                safe_update(
                    generation,
                    level="ERROR",
                    status_message=str(exc),
                )
                safe_update(
                    trace,
                    level="ERROR",
                    status_message=f"Gemini error: {str(exc)}",
                )
                traceback.print_exc()

                if _is_rate_limit_error(exc):
                    raise HTTPException(
                        status_code=429,
                        detail=(
                            "Aaron Intelligence is temporarily rate limited. "
                            "Please wait a moment and try again."
                        ),
                    )

                raise HTTPException(
                    status_code=500,
                    detail=f"Gemini error: {str(exc)}"
                )
        finally:
            safe_end(trace)
            flush_langfuse()


# Explicit assets mount
if FRONTEND_ASSETS.exists():
    fastapi_app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_ASSETS),
        name="frontend-assets",
    )


@fastapi_app.get("/{full_path:path}")
def frontend_fallback(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")

    if not FRONTEND_DIST.exists():
        raise HTTPException(status_code=404, detail="Not Found")

    requested_path = (FRONTEND_DIST / full_path).resolve()
    dist_root = FRONTEND_DIST.resolve()

    try:
        requested_path.relative_to(dist_root)
    except ValueError:
        requested_path = dist_root / "index.html"

    if requested_path.is_file():
        return FileResponse(requested_path)

    return FileResponse(dist_root / "index.html")


# Vercel entrypoint
app = fastapi_app
