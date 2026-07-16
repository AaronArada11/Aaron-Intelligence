from pathlib import Path


MIGRATION = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "migrations"
    / "202607150001_production_rag_v2.sql"
)


def test_generated_search_vector_uses_immutable_expression() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    generated_expression = sql.split(
        "search_vector tsvector generated always as (", 1
    )[1].split(") stored", 1)[0]

    assert "array_to_string" not in generated_expression
    assert "'english'::regconfig" in generated_expression
    assert "source_title || ' ' || section || ' ' || content" in generated_expression


def test_3072_dimension_hnsw_uses_half_precision_expression_index() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    assert "embedding vector(3072) not null" in sql
    assert "(embedding::halfvec(3072)) halfvec_cosine_ops" in sql
    assert "query_embedding::halfvec(3072)" in sql
    assert "pgvector 0.7.0 or newer is required" in sql
