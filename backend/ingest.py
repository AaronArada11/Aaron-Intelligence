import os
import re
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


try:
    from backend.supabase_client import get_supabase
except ImportError:
    from supabase_client import get_supabase

supabase = get_supabase()
knowledge_dir = Path(__file__).parent / "knowledge"

for file in sorted(knowledge_dir.glob("*.md")):
    text = file.read_text(encoding="utf-8")

    supabase.table("documents").delete().eq("source", file.name).execute()

    chunks = re.split(r"\n(?=#+ )", text)

    for index, chunk in enumerate(chunks):
        chunk = chunk.strip()

        if len(chunk) < 20:
            continue

        result = _get_client().models.embed_content(
            model="gemini-embedding-001",
            contents=chunk,
            config={"task_type": "RETRIEVAL_DOCUMENT"},
        )
        embedding = result.embeddings[0].values

        supabase.table("documents").insert(
            {
                "source": file.name,
                "chunk_id": index,
                "content": chunk,
                "embedding": embedding,
            }
        ).execute()

        print(f"Inserted {file.name} | Chunk {index}")
