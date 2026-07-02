import re
from pathlib import Path

from dotenv import load_dotenv
from backend.gemini_client import get_gemini_client

load_dotenv(Path(__file__).resolve().parent / ".env")

try:
    from backend.supabase_client import get_supabase
except ImportError:
    from supabase_client import get_supabase


def ingest_knowledge():
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

            result = get_gemini_client().models.embed_content(
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


def main():
    ingest_knowledge()


if __name__ == "__main__":
    main()
