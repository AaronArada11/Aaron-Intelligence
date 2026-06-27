import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parent / ".env")

_client = None

EMBEDDING_MODEL = "gemini-embedding-001"
RETRIEVAL_MATCH_COUNT = 3


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
