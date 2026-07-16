# Aaron Intelligence (AI)

Aaron Intelligence is Aaron Randolph S.D. Arada's personal portfolio and grounded RAG chatbot. The production path keeps the original `answer` response field while adding explicit outcomes, request IDs, validated citations, optional evaluation diagnostics, bounded provider retries, and a feature-flagged hybrid retrieval index.

## Architecture

```text
React/Vite frontend
  -> POST /chat
FastAPI route
  -> hashed-IP rate-limit RPC
  -> injectable ChatService
     -> Gemini RETRIEVAL_QUERY embedding (bounded retry/deadline)
     -> legacy vector RPC or versioned hybrid RRF RPC
     -> per-candidate evidence filtering and deduplication
     -> structured Gemini answer/outcome/citation generation
     -> server-side citation validation
Supabase
  -> legacy documents/match_documents rollback path
  -> knowledge_index_versions + knowledge_chunks v2 path
Markdown knowledge_v2 corpus
  -> dry-run -> stage -> evaluate -> atomic activation
```

Main entry points:

- FastAPI app: `backend/main.py`
- RAG service: `backend/chat_service.py`
- Retrieval and context selection: `backend/retriever.py`
- Markdown chunker: `backend/chunking.py`
- Staged ingestion: `backend/ingest.py`
- Supabase migration: `supabase/migrations/202607150001_production_rag_v2.sql`
- Canonical evaluation corpus: `evaluations/cases.json`
- Immutable evaluation runner: `evaluate.py`
- Chat UI: `frontend/src/components/Chat.jsx`

## Chat API

Request validation rejects blank messages and messages over 1,000 characters.

```http
POST /chat
Content-Type: application/json

{"message":"Where does Aaron study?"}
```

```json
{
  "answer": "Aaron studies at FEU Institute of Technology.",
  "outcome": "answered",
  "request_id": "uuid",
  "sources": [
    {"id": "S1", "title": "Education", "section": "FEU Institute of Technology"}
  ]
}
```

`diagnostics` is included only in local/development/test environments or when `X-Evaluation-Token` matches `EVAL_DIAGNOSTICS_TOKEN`. It contains complete retrieval scores, stage timing, provider timing, retry sleep, trace ID, context size, and model/prompt/index versions. Provider details and database scores are never exposed to normal production callers.

HTTP 429 and 503 responses are sanitized and include `Retry-After`.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npm --prefix frontend install
```

Copy `backend/.env.example` to `backend/.env` and fill in secrets. The Supabase service role is backend-only and must never be exposed through Vite environment variables.

```bash
uvicorn backend.main:app --reload
npm --prefix frontend run dev
```

## Feature Flags

- `RAG_RETRIEVAL_V2=false`: leaves legacy `documents` retrieval active.
- `RAG_INDEX_VERSION=<uuid>`: previews a staging v2 index without changing the globally active index.
- `RAG_V2_MIN_VECTOR_SIMILARITY=0.35`: calibrated v2 evidence threshold.
- `RAG_RETRIEVAL_CACHE=false`: optional 24-hour exact-query cache; keep disabled until baseline gates pass. Evaluation-token requests always bypass it.
- `CHAT_RATE_LIMIT_ENABLED=true`: uses the Supabase hashed-IP limiter (20 requests per ten minutes).

## Knowledge Index Workflow

The v2 corpus lives under `backend/knowledge_v2`; the legacy corpus and database table remain available during the rollback window.

```bash
# Local validation only: no Gemini or Supabase calls
python -m backend.ingest --dry-run

# Create and populate a staging version; does not activate it
python -m backend.ingest

# Activate only with a passing smoke summary
python -m backend.ingest \
  --activate <version-uuid> \
  --activation-report evaluations/runs/<run>/summary.json

# Explicit cleanup after the retention period
python -m backend.ingest --cleanup-retired --keep-retired 1
```

Activation verifies the staged row count and is atomic. The same command can reactivate a retired previous version for one-click rollback.

## Evaluation

The root-level `results.json`, `results.csv`, and `summary.json` are legacy audit artifacts and are never read or appended by the new runner.

```bash
# Validate cases/fingerprint without requests or writes
python evaluate.py --dry-run --smoke

# One 65-question smoke run
python evaluate.py --smoke --chat-url https://preview.example/chat

# Full 195-attempt run
python evaluate.py --runs 3 --chat-url https://production.example/chat

# Resume only when the fingerprint matches exactly
python evaluate.py --resume-run evaluations/runs/<timestamp>-<fingerprint>
```

The evaluator stops by default when an HTTP 429 remains after its two retries. It
records the event in `interruptions.json` without completing that case, so the same
run can be resumed after the provider limit resets. Use
`--continue-on-rate-limit` only when deliberately measuring rate-limit behavior.

Every run is stored under `evaluations/runs/<timestamp>-<fingerprint>/` with `fingerprint.json`, `results.json`, `results.csv`, and `summary.json`. See `docs/production-rollout.md` for activation gates and rollback steps.

## Verification

```bash
pytest
npm --prefix frontend run lint
npm --prefix frontend test -- --run
npm --prefix frontend run build
python -m backend.ingest --dry-run
python evaluate.py --dry-run --smoke
```

Database integration tests are marked `integration` and run when an isolated migrated test project provides `SUPABASE_TEST_URL` and `SUPABASE_TEST_SERVICE_ROLE_KEY`.
