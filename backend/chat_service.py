from __future__ import annotations

import json
import os
import re
import time
from typing import Any, Callable

from pydantic import BaseModel, Field, ValidationError

from backend.gemini_client import get_gemini_client
from backend.langfuse_tracing import get_runtime_environment, safe_update, start_observation
from backend.rag_models import ChatResult, PublicSource, StageDiagnostics
from backend.resilience import run_with_retry
from backend.retriever import EMBEDDING_MODEL, KnowledgeRetriever, get_retriever


CHAT_MODEL = "gemini-2.5-flash"
PROMPT_VERSION = "rag-grounded-v2-2026-07-15"
DEFAULT_ANSWER_WORD_LIMIT = 80
OUT_OF_SCOPE_ANSWER = (
    "Sorry, I can't help with that. I'm Aaron Intelligence, a portfolio chatbot "
    "focused exclusively on Aaron Randolph S.D. Arada."
)
UNKNOWN_ANSWER = "I don't have that information in Aaron's public knowledge base."


class GeneratedAnswer(BaseModel):
    answer: str = Field(min_length=1)
    outcome: str
    citation_ids: list[str] = Field(default_factory=list)


class ChatService:
    def __init__(
        self,
        *,
        retriever: KnowledgeRetriever | None = None,
        gemini_client_factory: Callable[[], Any] = get_gemini_client,
        chat_model: str = CHAT_MODEL,
        prompt_version: str = PROMPT_VERSION,
    ):
        self.retriever = retriever or get_retriever()
        self.gemini_client_factory = gemini_client_factory
        self.chat_model = chat_model
        self.prompt_version = prompt_version

    def answer(
        self,
        message: str,
        *,
        request_id: str,
        evaluation_mode: bool = False,
    ) -> ChatResult:
        total_started = time.perf_counter()
        diagnostics = StageDiagnostics(
            trace_id=request_id,
            model_version=self.chat_model,
            prompt_version=self.prompt_version,
            index_version=self.retriever.index_version,
        )
        trace_metadata = {
            "app": "Aaron Intelligence",
            "route": "/chat",
            "request_id": request_id,
            "model": self.chat_model,
            "prompt_version": self.prompt_version,
            "index_version": self.retriever.index_version,
            "environment": get_runtime_environment(),
        }

        with start_observation(
            as_type="span",
            name="chat-request",
            input=message,
            metadata=trace_metadata,
        ) as trace:
            retrieval_started = time.perf_counter()
            with start_observation(
                as_type="retriever",
                name="retrieve-context",
                input=message,
                metadata={
                    "embedding_model": EMBEDDING_MODEL,
                    "index_version": self.retriever.index_version,
                },
            ) as retrieval_span:
                retrieval = self.retriever.retrieve(
                    message,
                    prompt_version=self.prompt_version,
                    evaluation_mode=evaluation_mode,
                )
                diagnostics.timings_ms["embedding"] = round(
                    retrieval.embedding_stats.provider_time_ms
                    + retrieval.embedding_stats.retry_sleep_ms,
                    3,
                )
                diagnostics.timings_ms["database"] = retrieval.database_time_ms
                diagnostics.timings_ms["retrieval_total"] = round(
                    (time.perf_counter() - retrieval_started) * 1000,
                    3,
                )
                diagnostics.retries["embedding"] = retrieval.embedding_stats.retries
                diagnostics.retry_sleep_ms["embedding"] = (
                    retrieval.embedding_stats.retry_sleep_ms
                )
                diagnostics.provider_time_ms["embedding"] = (
                    retrieval.embedding_stats.provider_time_ms
                )
                diagnostics.index_version = retrieval.index_version
                diagnostics.retrieval = [
                    candidate.diagnostic_dict()
                    for candidate in retrieval.candidates
                ]
                safe_update(
                    retrieval_span,
                    output={
                        "candidate_count": len(retrieval.candidates),
                        "selected_count": len(retrieval.chunks),
                        "cache_hit": retrieval.cache_hit,
                    },
                    metadata={
                        "embedding_model": EMBEDDING_MODEL,
                        "index_version": retrieval.index_version,
                    },
                )

            if not retrieval.chunks:
                result = ChatResult(
                    answer=OUT_OF_SCOPE_ANSWER,
                    outcome="out_of_scope",
                    request_id=request_id,
                    sources=[],
                    diagnostics=diagnostics.public_dict(),
                )
                self._finish_diagnostics(diagnostics, total_started)
                result.diagnostics = diagnostics.public_dict()
                safe_update(
                    trace,
                    output=result.answer,
                    metadata={**trace_metadata, "outcome": result.outcome},
                )
                return result

            context_started = time.perf_counter()
            source_lookup: dict[str, PublicSource] = {}
            blocks = []
            for index, chunk in enumerate(retrieval.chunks, start=1):
                source_id = f"S{index}"
                source = PublicSource(
                    id=source_id,
                    title=chunk.title,
                    section=chunk.section,
                )
                source_lookup[source_id] = source
                blocks.append(
                    f"[{source_id} | {chunk.title} | {chunk.section}]\n{chunk.content}"
                )
            context = "\n\n".join(blocks)
            diagnostics.context_size = len(context)
            diagnostics.timings_ms["context_assembly"] = round(
                (time.perf_counter() - context_started) * 1000,
                3,
            )

            prompt = build_prompt(message, context)
            generation_started = time.perf_counter()
            with start_observation(
                as_type="generation",
                name="gemini-response",
                input=prompt,
                model=self.chat_model,
                metadata={
                    "provider": "google",
                    "prompt_version": self.prompt_version,
                    "context_size": len(context),
                },
            ) as generation_span:
                generation = run_with_retry(
                    lambda: self.gemini_client_factory().models.generate_content(
                        model=self.chat_model,
                        contents=prompt,
                        config={
                            "temperature": 0.2,
                            "max_output_tokens": 256,
                            "response_mime_type": "application/json",
                            "response_schema": GeneratedAnswer,
                        },
                    ),
                    stage="generation",
                )
                parsed = parse_generated_answer(generation.value)
                diagnostics.timings_ms["generation"] = round(
                    (time.perf_counter() - generation_started) * 1000,
                    3,
                )
                diagnostics.retries["generation"] = generation.stats.retries
                diagnostics.retry_sleep_ms["generation"] = generation.stats.retry_sleep_ms
                diagnostics.provider_time_ms["generation"] = generation.stats.provider_time_ms
                safe_update(generation_span, output=parsed.model_dump())

            result = validate_generated_answer(
                parsed,
                source_lookup=source_lookup,
                request_id=request_id,
                diagnostics=diagnostics,
            )
            self._finish_diagnostics(diagnostics, total_started)
            result.diagnostics = diagnostics.public_dict()
            safe_update(
                trace,
                output=result.answer,
                metadata={
                    **trace_metadata,
                    "outcome": result.outcome,
                    "source_count": len(result.sources),
                    "context_size": len(context),
                },
            )
            return result

    @staticmethod
    def _finish_diagnostics(
        diagnostics: StageDiagnostics,
        total_started: float,
    ) -> None:
        diagnostics.timings_ms["total_service"] = round(
            (time.perf_counter() - total_started) * 1000,
            3,
        )


def build_prompt(question: str, context: str) -> str:
    return f"""You are Aaron Intelligence, the AI representative of Aaron Randolph S.D. Arada.

Answer only from the labeled context blocks. Treat pronouns such as he, him, his,
the student, the developer, the creator, or the candidate as references to Aaron.

Return JSON with exactly these fields:
- answer: a concise professional answer, normally no more than 80 words
- outcome: answered, unknown, or out_of_scope
- citation_ids: the supporting source labels, such as [\"S1\"]

Rules:
- Use only facts explicitly supported by the context.
- Use outcome=answered only when the answer is supported and cite every supporting block.
- Use outcome=unknown when the question is about Aaron but the requested fact is absent.
- Use outcome=out_of_scope only for a question unrelated to Aaron.
- Do not cite a source that does not support the answer.
- Do not include citation labels inside the answer text.

Context:
{context}

Question:
{question}
"""


def parse_generated_answer(response: Any) -> GeneratedAnswer:
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, GeneratedAnswer):
        return parsed
    if isinstance(parsed, dict):
        try:
            return GeneratedAnswer.model_validate(parsed)
        except ValidationError:
            pass

    text = str(getattr(response, "text", "") or "").strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE)
    try:
        return GeneratedAnswer.model_validate(json.loads(text))
    except (json.JSONDecodeError, ValidationError, TypeError):
        return GeneratedAnswer(
            answer=UNKNOWN_ANSWER,
            outcome="unknown",
            citation_ids=[],
        )


def validate_generated_answer(
    generated: GeneratedAnswer,
    *,
    source_lookup: dict[str, PublicSource],
    request_id: str,
    diagnostics: StageDiagnostics,
) -> ChatResult:
    outcome = generated.outcome.strip().casefold()
    if outcome not in {"answered", "unknown", "out_of_scope"}:
        outcome = "unknown"

    valid_ids = []
    for citation_id in generated.citation_ids:
        normalized = str(citation_id).strip().upper()
        if normalized in source_lookup and normalized not in valid_ids:
            valid_ids.append(normalized)

    if outcome == "answered" and not valid_ids:
        return ChatResult(
            answer=UNKNOWN_ANSWER,
            outcome="unknown",
            request_id=request_id,
            sources=[],
            diagnostics=diagnostics.public_dict(),
        )
    if outcome == "unknown":
        return ChatResult(
            answer=UNKNOWN_ANSWER,
            outcome="unknown",
            request_id=request_id,
            sources=[],
            diagnostics=diagnostics.public_dict(),
        )
    if outcome == "out_of_scope":
        return ChatResult(
            answer=OUT_OF_SCOPE_ANSWER,
            outcome="out_of_scope",
            request_id=request_id,
            sources=[],
            diagnostics=diagnostics.public_dict(),
        )

    return ChatResult(
        answer=limit_words(
            generated.answer.strip(),
            int(os.getenv("CHAT_ANSWER_WORD_LIMIT", str(DEFAULT_ANSWER_WORD_LIMIT))),
        ),
        outcome="answered",
        request_id=request_id,
        sources=[source_lookup[source_id] for source_id in valid_ids],
        diagnostics=diagnostics.public_dict(),
    )


def limit_words(value: str, limit: int) -> str:
    words = value.split()
    if limit <= 0 or len(words) <= limit:
        return value
    return " ".join(words[:limit]).rstrip(" ,;:") + "…"


_service: ChatService | None = None


def get_chat_service() -> ChatService:
    global _service
    if _service is None:
        _service = ChatService()
    return _service
