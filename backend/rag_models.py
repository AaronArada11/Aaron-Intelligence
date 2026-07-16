from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

from pydantic import BaseModel, Field


Outcome = Literal["answered", "unknown", "out_of_scope"]


@dataclass(frozen=True, slots=True)
class RetrievedChunk:
    source: str
    chunk_id: str
    content: str
    title: str
    section: str
    heading_path: tuple[str, ...] = ()
    content_hash: str = ""
    vector_similarity: float | None = None
    vector_rank: int | None = None
    lexical_rank: int | None = None
    lexical_score: float | None = None
    fused_score: float | None = None

    def diagnostic_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data.pop("content", None)
        return data


class PublicSource(BaseModel):
    id: str
    title: str
    section: str


@dataclass(slots=True)
class StageDiagnostics:
    trace_id: str
    model_version: str
    prompt_version: str
    index_version: str
    timings_ms: dict[str, float] = field(default_factory=dict)
    retries: dict[str, int] = field(default_factory=dict)
    retry_sleep_ms: dict[str, float] = field(default_factory=dict)
    provider_time_ms: dict[str, float] = field(default_factory=dict)
    context_size: int = 0
    retrieval: list[dict[str, Any]] = field(default_factory=list)

    def public_dict(self) -> dict[str, Any]:
        return asdict(self)


class ChatResult(BaseModel):
    answer: str
    outcome: Outcome
    request_id: str
    sources: list[PublicSource] = Field(default_factory=list)
    diagnostics: dict[str, Any] | None = None

