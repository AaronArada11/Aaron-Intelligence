import google.generativeai as genai
import os
from pathlib import Path
import re

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from supabase_client import get_supabase

supabase = get_supabase()

knowledge_dir = Path(__file__).parent / "knowledge"

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

        result = genai.embed_content(
            model="models/embedding-001",
            content=chunk,
            task_type="retrieval_document"
        )
        embedding = result["embedding"]

        supabase.table("documents").insert({
            "source": file.name,
            "chunk_id": index,
            "content": chunk,
            "embedding": embedding
        }).execute()

        print(f"Inserted {file.name} | Chunk {index}")
