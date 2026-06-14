from pathlib import Path
from sentence_transformers import SentenceTransformer
from supabase_client import supabase
import re

model = SentenceTransformer("all-MiniLM-L6-v2")

knowledge_dir = Path("knowledge")

for file in knowledge_dir.glob("*.md"):

    text = file.read_text(encoding="utf-8")

    supabase.table("documents") \
        .delete() \
        .eq("source", file.name) \
        .execute()

    chunks = re.split(r"\n(?=#+ )", text)

    for index, chunk in enumerate(chunks):

        chunk = chunk.strip()

        if len(chunk) < 20:
            continue

        embedding = model.encode(chunk).tolist()

        supabase.table("documents").insert({
            "source": file.name,
            "chunk_id": index,
            "content": chunk,
            "embedding": embedding
        }).execute()

        print(f"Inserted {file.name} | Chunk {index}")