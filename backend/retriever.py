from sentence_transformers import SentenceTransformer
from supabase_client import supabase

model = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve(question):
    query_embedding = model.encode(question).tolist()

    result = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": 3
        }
    ).execute()

    return result.data

