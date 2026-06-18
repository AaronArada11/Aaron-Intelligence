import os
import google.generativeai as genai

_CONFIGURED = False


def configure_genai():
    global _CONFIGURED

    if _CONFIGURED:
        return

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "Missing GEMINI_API_KEY environment variable"
        )

    genai.configure(api_key=api_key)
    _CONFIGURED = True


def retrieve(question):
    configure_genai()

    result = genai.embed_content(
    model="models/embedding-001",
    content=question,
    task_type="retrieval_query"

)

    print(len(result["embedding"]))

    query_embedding = result["embedding"]

    print("Embedding length:", len(query_embedding))

    from backend.supabase_client import get_supabase

    results = get_supabase().rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": 3,
        },
    ).execute()

    return results.data