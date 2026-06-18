import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parent / ".env")

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY environment variable")
        _client = genai.Client(api_key=api_key)
    return _client


def retrieve(question):
    result = _get_client().models.embed_content(
        model="gemini-embedding-001",
        contents=question,
    )

    print(len(result.embeddings[0].values))

    query_embedding = result.embeddings[0].values

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