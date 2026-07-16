from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.chunking import MarkdownChunk, chunk_markdown, corpus_hash, validate_chunks
from backend.gemini_client import get_gemini_client
from backend.resilience import RetryStats, run_with_retry
from backend.supabase_client import get_supabase


load_dotenv(Path(__file__).resolve().parent / ".env")

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 3072
DEFAULT_KNOWLEDGE_DIR = Path(__file__).resolve().parent / "knowledge_v2"
DEFAULT_BATCH_SIZE = 25


def embed_chunk(chunk: MarkdownChunk) -> tuple[list[float], RetryStats]:
    result = run_with_retry(
        lambda: get_gemini_client().models.embed_content(
            model=EMBEDDING_MODEL,
            contents=chunk.embedded_content,
            config={"task_type": "RETRIEVAL_DOCUMENT"},
        ),
        stage="document embedding",
    )
    values = result.value.embeddings[0].values
    if len(values) != EMBEDDING_DIMENSION:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSION}-dimension embedding, received {len(values)}"
        )
    return values, result.stats


def load_corpus(knowledge_dir: Path) -> tuple[list[Path], list[MarkdownChunk], dict]:
    files = sorted(knowledge_dir.rglob("*.md"))
    if not files:
        raise FileNotFoundError(f"No Markdown files found in {knowledge_dir}")

    chunks: list[MarkdownChunk] = []
    for path in files:
        source = path.relative_to(knowledge_dir).as_posix()
        chunks.extend(
            chunk_markdown(
                path.read_text(encoding="utf-8"),
                source=source,
            )
        )
    summary = validate_chunks(chunks)
    summary["corpus_hash"] = corpus_hash(files)
    summary["embedding_model"] = EMBEDDING_MODEL
    return files, chunks, summary


def stage_index(
    knowledge_dir: Path,
    *,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> str:
    _, chunks, summary = load_corpus(knowledge_dir)
    supabase = get_supabase()
    version_response = supabase.table("knowledge_index_versions").insert(
        {
            "status": "staging",
            "embedding_model": EMBEDDING_MODEL,
            "corpus_hash": summary["corpus_hash"],
            "chunk_count": len(chunks),
            "metadata": {
                "source_count": summary["source_count"],
                "min_words": summary["min_words"],
                "max_words": summary["max_words"],
            },
        }
    ).execute()
    version_rows = version_response.data or []
    if not version_rows:
        raise RuntimeError("Supabase did not return the staging index version")
    version_id = str(version_rows[0]["id"])

    rows = []
    retry_count = 0
    retry_sleep_ms = 0.0
    try:
        for index, chunk in enumerate(chunks, start=1):
            embedding, stats = embed_chunk(chunk)
            retry_count += stats.retries
            retry_sleep_ms += stats.retry_sleep_ms
            rows.append(
                chunk.database_row(
                    index_version_id=version_id,
                    embedding=embedding,
                )
            )
            if len(rows) >= batch_size or index == len(chunks):
                supabase.table("knowledge_chunks").insert(rows).execute()
                rows = []
            print(f"Embedded {index}/{len(chunks)}", flush=True)
    except Exception:
        supabase.table("knowledge_index_versions").update(
            {"status": "failed"}
        ).eq("id", version_id).execute()
        raise

    print(
        json.dumps(
            {
                "staging_version": version_id,
                "chunk_count": len(chunks),
                "corpus_hash": summary["corpus_hash"],
                "embedding_model": EMBEDDING_MODEL,
                "embedding_retries": retry_count,
                "retry_sleep_ms": round(retry_sleep_ms, 3),
                "activated": False,
            },
            indent=2,
        ),
        flush=True,
    )
    return version_id


def validate_activation_report(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Activation report not found: {path}")
    report = json.loads(path.read_text(encoding="utf-8"))
    gates = report.get("release_gates") if isinstance(report, dict) else None
    if not isinstance(gates, dict) or gates.get("passed") is not True:
        raise ValueError("Activation report does not show all smoke release gates passing")
    return report


def activate_index(version_id: str, *, activation_report: Path) -> dict[str, Any]:
    validate_activation_report(activation_report)
    supabase = get_supabase()

    version_response = supabase.table("knowledge_index_versions").select(
        "id,status,chunk_count,corpus_hash,embedding_model"
    ).eq("id", version_id).single().execute()
    version = version_response.data or {}
    if version.get("status") not in {"staging", "retired"}:
        raise ValueError("Only a staging or retired index can be activated")

    chunk_response = supabase.table("knowledge_chunks").select(
        "id",
        count="exact",
    ).eq("index_version_id", version_id).execute()
    actual_count = int(chunk_response.count or 0)
    if actual_count != int(version.get("chunk_count") or 0):
        raise ValueError(
            f"Chunk count mismatch: expected {version.get('chunk_count')}, found {actual_count}"
        )

    activation = supabase.rpc(
        "activate_knowledge_index",
        {"target_version": version_id},
    ).execute()
    result = (activation.data or [{}])[0]
    print(json.dumps(result, indent=2), flush=True)
    return result


def cleanup_retired_versions(*, keep: int) -> list[str]:
    supabase = get_supabase()
    response = supabase.table("knowledge_index_versions").select(
        "id,activated_at,retired_at"
    ).eq("status", "retired").order("retired_at", desc=True).execute()
    retired = response.data or []
    deleted = []
    for version in retired[max(0, keep) :]:
        version_id = str(version["id"])
        supabase.table("knowledge_index_versions").delete().eq(
            "id",
            version_id,
        ).execute()
        deleted.append(version_id)
    print(json.dumps({"deleted_versions": deleted}, indent=2), flush=True)
    return deleted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Stage, validate, activate, or clean up the v2 knowledge index."
    )
    parser.add_argument(
        "--knowledge-dir",
        type=Path,
        default=DEFAULT_KNOWLEDGE_DIR,
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--activate", metavar="VERSION_UUID")
    parser.add_argument("--activation-report", type=Path)
    parser.add_argument("--cleanup-retired", action="store_true")
    parser.add_argument("--keep-retired", type=int, default=1)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    selected_actions = sum(
        bool(value)
        for value in (args.dry_run, args.activate, args.cleanup_retired)
    )
    if selected_actions > 1:
        raise SystemExit("Choose only one of --dry-run, --activate, or --cleanup-retired")

    if args.activate:
        if args.activation_report is None:
            raise SystemExit("--activate requires --activation-report from a passing smoke run")
        activate_index(args.activate, activation_report=args.activation_report.resolve())
        return 0
    if args.cleanup_retired:
        cleanup_retired_versions(keep=max(0, args.keep_retired))
        return 0

    knowledge_dir = args.knowledge_dir.expanduser().resolve()
    if args.dry_run:
        _, _, summary = load_corpus(knowledge_dir)
        print(json.dumps({**summary, "database_writes": 0, "api_calls": 0}, indent=2))
        return 0

    stage_index(knowledge_dir, batch_size=max(1, args.batch_size))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
