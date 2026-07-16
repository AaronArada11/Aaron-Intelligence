from backend.chat_service import (
    GeneratedAnswer,
    UNKNOWN_ANSWER,
    validate_generated_answer,
)
from backend.rag_models import PublicSource, RetrievedChunk, StageDiagnostics
from backend.retriever import select_context_chunks


def chunk(
    source,
    content,
    content_hash,
    similarity=0.8,
    *,
    lexical_rank=None,
):
    return RetrievedChunk(
        source=source,
        chunk_id=content_hash,
        content=content,
        title=source.title(),
        section="Section",
        content_hash=content_hash,
        vector_similarity=similarity,
        lexical_rank=lexical_rank,
        lexical_score=1.0 if lexical_rank else None,
    )


def diagnostics():
    return StageDiagnostics(
        trace_id="trace",
        model_version="model",
        prompt_version="prompt",
        index_version="index",
    )


def test_candidates_are_filtered_individually_and_deduplicated():
    candidates = [
        chunk("education", "Aaron studies at FEU Tech", "a", 0.9),
        chunk("education", "Aaron studies at FEU Tech", "a", 0.88),
        chunk("skills", "Python FastAPI Supabase", "b", 0.2),
        chunk("projects", "KUMPAS uses MediaPipe", "c", 0.7),
    ]
    selected = select_context_chunks(
        candidates,
        similarity_threshold=0.35,
        allow_lexical=False,
    )
    assert [item.content_hash for item in selected] == ["a", "c"]


def test_source_cap_and_high_overlap_are_enforced():
    candidates = [
        chunk("education", "one two three four", "a"),
        chunk("education", "five six seven eight", "b"),
        chunk("education", "nine ten eleven twelve", "c"),
        chunk("skills", "one two three four extra", "d"),
    ]
    selected = select_context_chunks(
        candidates,
        similarity_threshold=0.35,
        overlap_threshold=0.7,
    )
    assert sum(item.source == "education" for item in selected) == 2
    assert all(item.content_hash != "d" for item in selected)


def test_lexical_evidence_can_pass_v2_gate():
    selected = select_context_chunks(
        [chunk("education", "La Salle STEM", "a", 0.1, lexical_rank=1)],
        similarity_threshold=0.35,
        allow_lexical=True,
    )
    assert len(selected) == 1


def test_answer_without_valid_citation_becomes_unknown():
    result = validate_generated_answer(
        GeneratedAnswer(answer="Unsupported", outcome="answered", citation_ids=["S9"]),
        source_lookup={"S1": PublicSource(id="S1", title="Education", section="FEU")},
        request_id="request",
        diagnostics=diagnostics(),
    )
    assert result.outcome == "unknown"
    assert result.answer == UNKNOWN_ANSWER
    assert result.sources == []


def test_only_valid_citations_are_returned():
    result = validate_generated_answer(
        GeneratedAnswer(
            answer="Aaron studies at FEU Tech.",
            outcome="answered",
            citation_ids=["s1", "S8"],
        ),
        source_lookup={"S1": PublicSource(id="S1", title="Education", section="FEU")},
        request_id="request",
        diagnostics=diagnostics(),
    )
    assert result.outcome == "answered"
    assert [source.id for source in result.sources] == ["S1"]

