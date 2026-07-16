from __future__ import annotations

import hashlib
import os
import re
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from backend.gemini_client import get_gemini_client
from backend.rag_models import RetrievedChunk
from backend.resilience import RetryStats, run_with_retry


EMBEDDING_MODEL = "gemini-embedding-001"
RETRIEVAL_MATCH_COUNT = 3
V2_CANDIDATE_COUNT = 20
V2_RESULT_COUNT = 10
MAX_CONTEXT_CHUNKS = 5
MAX_CHUNKS_PER_SOURCE = 2
DEFAULT_V1_SIMILARITY_THRESHOLD = 0.25
DEFAULT_V2_SIMILARITY_THRESHOLD = 0.35
DEFAULT_OVERLAP_THRESHOLD = 0.85
CACHE_TTL_SECONDS = 24 * 60 * 60


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().casefold() in {"1", "true", "yes", "on"}


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


def _friendly_title(source: str) -> str:
    return Path(source).stem.replace("_", " ").replace("-", " ").title()


def _first_heading(content: str, fallback: str) -> str:
    for line in content.splitlines():
        heading = re.match(r"^#{1,6}\s+(.+?)\s*$", line)
        if heading:
            return heading.group(1).strip()
    return fallback


def _normalized_tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.casefold()))


def _text_overlap(left: str, right: str) -> float:
    left_tokens = _normalized_tokens(left)
    right_tokens = _normalized_tokens(right)
    if not left_tokens or not right_tokens:
        return 0.0
    return len(left_tokens & right_tokens) / len(left_tokens | right_tokens)


def _content_hash(content: str) -> str:
    normalized = " ".join(content.split()).casefold()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


@dataclass(frozen=True, slots=True)
class RetrievalResult:
    chunks: list[RetrievedChunk]
    candidates: list[RetrievedChunk]
    embedding_stats: RetryStats
    index_version: str
    database_time_ms: float
    cache_hit: bool = False


class RetrievalCache:
    def __init__(self, ttl_seconds: int = CACHE_TTL_SECONDS):
        self.ttl_seconds = ttl_seconds
        self._values: dict[str, tuple[float, RetrievalResult]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> RetrievalResult | None:
        now = time.time()
        with self._lock:
            stored = self._values.get(key)
            if stored is None:
                return None
            expires_at, result = stored
            if expires_at <= now:
                self._values.pop(key, None)
                return None
            return RetrievalResult(
                chunks=result.chunks,
                candidates=result.candidates,
                embedding_stats=result.embedding_stats,
                index_version=result.index_version,
                database_time_ms=result.database_time_ms,
                cache_hit=True,
            )

    def put(self, key: str, value: RetrievalResult) -> None:
        with self._lock:
            self._values[key] = (time.time() + self.ttl_seconds, value)


class KnowledgeRetriever:
    def __init__(
        self,
        *,
        gemini_client_factory: Callable[[], Any] = get_gemini_client,
        supabase_factory: Callable[[], Any] | None = None,
        use_v2: bool | None = None,
        target_version: str | None = None,
        cache: RetrievalCache | None = None,
    ):
        if supabase_factory is None:
            from backend.supabase_client import get_supabase

            supabase_factory = get_supabase
        self.gemini_client_factory = gemini_client_factory
        self.supabase_factory = supabase_factory
        self.use_v2 = _env_bool("RAG_RETRIEVAL_V2", False) if use_v2 is None else use_v2
        self.target_version = target_version or os.getenv("RAG_INDEX_VERSION") or None
        self.cache = cache or RetrievalCache()

    @property
    def index_version(self) -> str:
        if not self.use_v2:
            return "legacy-v1"
        return self.target_version or "active-v2"

    def retrieve(
        self,
        question: str,
        *,
        prompt_version: str,
        evaluation_mode: bool = False,
    ) -> RetrievalResult:
        normalized_query = " ".join(question.casefold().split())
        cache_enabled = _env_bool("RAG_RETRIEVAL_CACHE", False) and not evaluation_mode
        cache_key = hashlib.sha256(
            f"{normalized_query}|{self.index_version}|{prompt_version}".encode("utf-8")
        ).hexdigest()
        if cache_enabled:
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached

        embedding_call = run_with_retry(
            lambda: self.gemini_client_factory().models.embed_content(
                model=EMBEDDING_MODEL,
                contents=question,
                config={"task_type": "RETRIEVAL_QUERY"},
            ),
            stage="embedding",
        )
        query_embedding = embedding_call.value.embeddings[0].values

        database_started = time.perf_counter()
        if self.use_v2:
            rows = self._retrieve_v2(question, query_embedding)
            chunks = select_context_chunks(
                rows,
                similarity_threshold=_env_float(
                    "RAG_V2_MIN_VECTOR_SIMILARITY",
                    DEFAULT_V2_SIMILARITY_THRESHOLD,
                ),
                overlap_threshold=_env_float(
                    "RAG_MAX_TEXT_OVERLAP",
                    DEFAULT_OVERLAP_THRESHOLD,
                ),
                allow_lexical=True,
            )
        else:
            rows = self._retrieve_v1(query_embedding)
            chunks = select_context_chunks(
                rows,
                similarity_threshold=_env_float(
                    "RAG_V1_MIN_VECTOR_SIMILARITY",
                    DEFAULT_V1_SIMILARITY_THRESHOLD,
                ),
                overlap_threshold=_env_float(
                    "RAG_MAX_TEXT_OVERLAP",
                    DEFAULT_OVERLAP_THRESHOLD,
                ),
                allow_lexical=False,
            )
        database_time_ms = round((time.perf_counter() - database_started) * 1000, 3)

        result = RetrievalResult(
            chunks=chunks,
            candidates=rows,
            embedding_stats=embedding_call.stats,
            index_version=self.index_version,
            database_time_ms=database_time_ms,
        )
        if cache_enabled:
            self.cache.put(cache_key, result)
        return result

    def _retrieve_v1(self, query_embedding: list[float]) -> list[RetrievedChunk]:
        response = self.supabase_factory().rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_count": RETRIEVAL_MATCH_COUNT,
            },
        ).execute()
        chunks = []
        for index, row in enumerate(response.data or []):
            content = str(row.get("content") or "")
            source = str(row.get("source") or "unknown.md")
            title = _friendly_title(source)
            chunks.append(
                RetrievedChunk(
                    source=source,
                    chunk_id=str(row.get("chunk_id") or row.get("id") or index),
                    content=content,
                    title=title,
                    section=_first_heading(content, title),
                    content_hash=_content_hash(content),
                    vector_similarity=_optional_float(row.get("similarity")),
                    vector_rank=index + 1,
                    fused_score=_optional_float(row.get("similarity")),
                )
            )
        return chunks

    def _retrieve_v2(
        self,
        question: str,
        query_embedding: list[float],
    ) -> list[RetrievedChunk]:
        response = self.supabase_factory().rpc(
            "match_knowledge_hybrid",
            {
                "query_text": question,
                "query_embedding": query_embedding,
                "target_version": self.target_version,
                "candidate_count": V2_CANDIDATE_COUNT,
            },
        ).execute()
        chunks = []
        for index, row in enumerate(response.data or []):
            heading_path = tuple(row.get("heading_path") or ())
            source = str(row.get("source") or row.get("source_id") or "unknown")
            title = str(row.get("title") or row.get("source_title") or _friendly_title(source))
            section = str(
                row.get("section")
                or (heading_path[-1] if heading_path else title)
            )
            content = str(row.get("content") or "")
            chunks.append(
                RetrievedChunk(
                    source=source,
                    chunk_id=str(row.get("chunk_id") or row.get("id") or index),
                    content=content,
                    title=title,
                    section=section,
                    heading_path=heading_path,
                    content_hash=str(row.get("content_hash") or _content_hash(content)),
                    vector_similarity=_optional_float(row.get("vector_similarity")),
                    vector_rank=_optional_int(row.get("vector_rank")),
                    lexical_rank=_optional_int(row.get("lexical_rank")),
                    lexical_score=_optional_float(row.get("lexical_score")),
                    fused_score=_optional_float(row.get("fused_score")),
                )
            )
        return chunks[:V2_RESULT_COUNT]


def _optional_float(value: Any) -> float | None:
    try:
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None


def _optional_int(value: Any) -> int | None:
    try:
        return None if value is None else int(value)
    except (TypeError, ValueError):
        return None


def candidate_passes_evidence(
    chunk: RetrievedChunk,
    *,
    similarity_threshold: float,
    allow_lexical: bool,
) -> bool:
    if (
        chunk.vector_similarity is not None
        and chunk.vector_similarity >= similarity_threshold
    ):
        return True
    return bool(
        allow_lexical
        and chunk.lexical_rank is not None
        and chunk.lexical_rank <= 5
        and (chunk.lexical_score or 0) > 0
    )


def select_context_chunks(
    candidates: list[RetrievedChunk],
    *,
    similarity_threshold: float,
    overlap_threshold: float = DEFAULT_OVERLAP_THRESHOLD,
    max_chunks: int = MAX_CONTEXT_CHUNKS,
    max_per_source: int = MAX_CHUNKS_PER_SOURCE,
    allow_lexical: bool = True,
) -> list[RetrievedChunk]:
    selected: list[RetrievedChunk] = []
    seen_hashes: set[str] = set()
    source_counts: dict[str, int] = {}

    for candidate in candidates:
        if not candidate_passes_evidence(
            candidate,
            similarity_threshold=similarity_threshold,
            allow_lexical=allow_lexical,
        ):
            continue
        if candidate.content_hash and candidate.content_hash in seen_hashes:
            continue
        if source_counts.get(candidate.source, 0) >= max_per_source:
            continue
        if any(
            _text_overlap(candidate.content, existing.content) >= overlap_threshold
            for existing in selected
        ):
            continue

        selected.append(candidate)
        if candidate.content_hash:
            seen_hashes.add(candidate.content_hash)
        source_counts[candidate.source] = source_counts.get(candidate.source, 0) + 1
        if len(selected) >= max_chunks:
            break

    return selected


_default_retriever: KnowledgeRetriever | None = None


def get_retriever() -> KnowledgeRetriever:
    global _default_retriever
    if _default_retriever is None:
        _default_retriever = KnowledgeRetriever()
    return _default_retriever


def retrieve(question: str) -> list[dict[str, Any]]:
    """Compatibility wrapper for older callers during the rollback window."""
    result = get_retriever().retrieve(question, prompt_version="legacy-v1")
    return [
        {
            "source": chunk.source,
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "similarity": chunk.vector_similarity,
        }
        for chunk in result.chunks
    ]
