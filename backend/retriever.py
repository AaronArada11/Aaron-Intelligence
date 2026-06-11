from sentence_transformers import SentenceTransformer
from supabase_client import supabase

print("Starting retriever...")

model = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve(question):
    print("Generating embedding...")
    query_embedding = model.encode(question).tolist()

    print("Calling Supabase...")
    result = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": 3
        }
    ).execute()

    print("Got response")
    return result.data

results = retrieve(
    "What projects has Aaron built?"
)

print(results)