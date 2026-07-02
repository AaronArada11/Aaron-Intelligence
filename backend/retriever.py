from backend.gemini_client import get_gemini_client

EMBEDDING_MODEL = "gemini-embedding-001"
RETRIEVAL_MATCH_COUNT = 3


def retrieve(question):
    result = get_gemini_client().models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
    )

    query_embedding = result.embeddings[0].values

    from backend.supabase_client import get_supabase

    results = get_supabase().rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": RETRIEVAL_MATCH_COUNT,
        },
    ).execute()

    return results.data
