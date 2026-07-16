import os

import pytest


pytestmark = pytest.mark.integration


@pytest.fixture()
def test_supabase():
    if not os.getenv("SUPABASE_TEST_URL") or not os.getenv("SUPABASE_TEST_SERVICE_ROLE_KEY"):
        pytest.skip("isolated migrated Supabase test project is not configured")
    from supabase import create_client

    return create_client(
        os.environ["SUPABASE_TEST_URL"],
        os.environ["SUPABASE_TEST_SERVICE_ROLE_KEY"],
    )


def test_staging_chunks_do_not_appear_in_active_retrieval(test_supabase):
    active = test_supabase.table("knowledge_index_versions").select("id").eq(
        "status", "active"
    ).execute().data
    staging = test_supabase.table("knowledge_index_versions").select("id").eq(
        "status", "staging"
    ).execute().data
    if not active or not staging:
        pytest.skip("test project needs active and staging fixtures")
    active_chunk_rows = test_supabase.table("knowledge_chunks").select(
        "id,index_version_id"
    ).eq(
        "index_version_id", active[0]["id"]
    ).execute().data
    active_ids = {
        row["index_version_id"]
        for row in active_chunk_rows
    }
    active_chunk_ids = {row["id"] for row in active_chunk_rows}
    retrieved = test_supabase.rpc(
        "match_knowledge_hybrid",
        {
            "query_text": "Aaron",
            "query_embedding": [0.0] * 3072,
            "target_version": None,
            "candidate_count": 20,
        },
    ).execute().data
    assert all(row["id"] in active_chunk_ids for row in retrieved)
    assert staging[0]["id"] not in active_ids


def test_activation_is_atomic_and_rollback_restores_previous(test_supabase):
    staging_id = os.getenv("SUPABASE_TEST_STAGING_VERSION")
    previous_id = os.getenv("SUPABASE_TEST_ROLLBACK_VERSION")
    if not staging_id or not previous_id:
        pytest.skip("activation fixture versions are not configured")

    activated = test_supabase.rpc(
        "activate_knowledge_index",
        {"target_version": staging_id},
    ).execute().data[0]
    assert activated["activated_version"] == staging_id
    assert activated["previous_version"] == previous_id

    rolled_back = test_supabase.rpc(
        "activate_knowledge_index",
        {"target_version": previous_id},
    ).execute().data[0]
    assert rolled_back["activated_version"] == previous_id
    statuses = test_supabase.table("knowledge_index_versions").select(
        "id,status"
    ).in_("id", [staging_id, previous_id]).execute().data
    by_id = {row["id"]: row["status"] for row in statuses}
    assert by_id[previous_id] == "active"
    assert by_id[staging_id] == "retired"


def test_deleted_source_is_absent_from_new_active_version(test_supabase):
    deleted_source = os.getenv("SUPABASE_TEST_DELETED_SOURCE")
    if not deleted_source:
        pytest.skip("deleted-source fixture is not configured")
    active = test_supabase.table("knowledge_index_versions").select("id").eq(
        "status", "active"
    ).single().execute().data
    rows = test_supabase.table("knowledge_chunks").select("id").eq(
        "index_version_id", active["id"]
    ).eq(
        "source_id", deleted_source
    ).execute().data
    assert rows == []


def test_hybrid_rpc_metadata_and_order_are_stable(test_supabase):
    embedding = [0.0] * 3072
    first = test_supabase.rpc(
        "match_knowledge_hybrid",
        {
            "query_text": "Aaron education",
            "query_embedding": embedding,
            "target_version": None,
            "candidate_count": 20,
        },
    ).execute().data
    second = test_supabase.rpc(
        "match_knowledge_hybrid",
        {
            "query_text": "Aaron education",
            "query_embedding": embedding,
            "target_version": None,
            "candidate_count": 20,
        },
    ).execute().data
    assert [row["id"] for row in first] == [row["id"] for row in second]
    assert all("fused_score" in row and "heading_path" in row for row in first)
