import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def retrieve(question):
    result = genai.embed_content(
        model="models/embedding-001",
        content=question
    )
    query_embedding = result["embedding"]

    from supabase_client import get_supabase

    results = get_supabase().rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": 3
        }
    ).execute()

    return results.data
