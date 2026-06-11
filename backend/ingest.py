from pathlib import Path
from sentence_transformers import SentenceTransformer
from supabase_client import supabase

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

knowledge_dir = Path("knowledge")

for file in knowledge_dir.glob("*.md"):
    text = file.read_text(encoding="utf-8")

    embedding = model.encode(text).tolist()

    supabase.table("documents").insert({
    "source": file.name,
    "content": text,
    "embedding": embedding
    }).execute()

    print(f"Inserted {file.name}")