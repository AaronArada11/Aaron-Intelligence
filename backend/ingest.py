import re
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.gemini_client import get_gemini_client

load_dotenv(Path(__file__).resolve().parent / ".env")

try:
    from backend.supabase_client import get_supabase
except ImportError:
    from supabase_client import get_supabase


EMBEDDING_MODEL = "gemini-embedding-001"
MAX_EMBED_RETRIES = 4
BASE_RETRY_SECONDS = 8


def embed_chunk(chunk):
    for attempt in range(MAX_EMBED_RETRIES):
        try:
            result = get_gemini_client().models.embed_content(
                model=EMBEDDING_MODEL,
                contents=chunk,
                config={"task_type": "RETRIEVAL_DOCUMENT"},
            )
            return result.embeddings[0].values
        except Exception as exc:
            is_rate_limit = (
                getattr(exc, "status_code", None) == 429
                or "RESOURCE_EXHAUSTED" in str(exc)
            )
            is_final_attempt = attempt == MAX_EMBED_RETRIES - 1

            if not is_rate_limit or is_final_attempt:
                raise

            sleep_seconds = BASE_RETRY_SECONDS * (2**attempt)
            print(
                f"Rate limited by embedding API. Retrying in {sleep_seconds}s...",
                flush=True,
            )
            time.sleep(sleep_seconds)


def ingest_knowledge():
    supabase = get_supabase()
    knowledge_dir = Path(__file__).parent / "knowledge"

    for file in sorted(knowledge_dir.glob("*.md")):
        text = file.read_text(encoding="utf-8")

        chunks = re.split(r"\n(?=#+ )", text)
        rows = []

        for index, chunk in enumerate(chunks):
            chunk = chunk.strip()

            if len(chunk) < 20:
                continue

            rows.append(
                {
                    "source": file.name,
                    "chunk_id": index,
                    "content": chunk,
                    "embedding": embed_chunk(chunk),
                }
            )

        supabase.table("documents").delete().eq("source", file.name).execute()
        if rows:
            supabase.table("documents").insert(rows).execute()

        print(f"Inserted {file.name} | {len(rows)} chunks", flush=True)


def main():
    ingest_knowledge()


if __name__ == "__main__":
    main()
