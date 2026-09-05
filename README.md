# Aaron Intelligence (AI)

Aaron Intelligence is a personal portfolio and chatbot for Aaron Randolph S.D. Arada. Visitors can browse projects, contact links, live dashboard widgets, and ask an AI assistant questions about Aaron's background.

## Architecture

```text
React/Vite frontend
  -> /chat and /github-commits
FastAPI backend
  -> Gemini + Supabase-backed retrieval
  -> GitHub REST API commit feed
Markdown knowledge base
  -> backend/ingest.py embeds content into Supabase
```

Main entry points:

- Frontend app: `frontend/src/main.jsx`
- FastAPI app: `backend/main.py`
- Vercel route shims: `api/chat.py`, `api/github_commits.py`
- Knowledge ingestion: `python3 -m backend.ingest`

## Project Structure

```text
api/
  chat.py
  github_commits.py
backend/
  gemini_client.py
  ingest.py
  langfuse_tracing.py
  main.py
  retriever.py
  supabase_client.py
  knowledge/*.md
frontend/
  public/
  src/
    components/
    profileLinks.js
    themeTokens.js
    App.jsx
    main.jsx
```

## Setup

Install backend dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Install frontend dependencies:

```bash
npm --prefix frontend install
```

Create `backend/.env`:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Optional tracing:

```env
LANGFUSE_PUBLIC_KEY=YOUR_LANGFUSE_PUBLIC_KEY
LANGFUSE_SECRET_KEY=YOUR_LANGFUSE_SECRET_KEY
LANGFUSE_BASE_URL=https://jp.cloud.langfuse.com
LANGFUSE_TRACING_ENABLED=true
LANGFUSE_TRACING_ENVIRONMENT=local
LANGFUSE_SAMPLE_RATE=1.0
```

Create a Langfuse project, copy its public and secret keys into `backend/.env`,
and use the base URL for the region where that project was created. Each `/chat`
request produces a parent `chat-request` span with nested retrieval and Gemini
generation observations. The generation records exact Gemini input, output,
thinking, cached, and total token counts when the API returns them. Langfuse uses
the generation model name and token usage to calculate cost when it has a matching
model definition.

Verify credentials without printing them:

```bash
uv run python -c "from backend.langfuse_tracing import get_langfuse_client; print(get_langfuse_client().auth_check())"
```

The evaluation runner requests an additional `metrics` object containing pipeline,
retrieval, and generation latency; token counts; retrieved-document count; top
similarity; and refusal status. Normal frontend requests continue to receive only
the chatbot answer. The response also includes `X-Langfuse-Trace-Id`, allowing an
evaluation result to be opened and investigated in Langfuse.

Langfuse measures traces, latency, tokens, and cost. It does not determine factual
correctness automatically. Continue scoring the evaluation workbook as Correct,
Partial, or Wrong to measure answer quality.

Optional GitHub dashboard configuration:

```env
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
GITHUB_USERNAME=AaronArada11
GITHUB_REPOS=owner/repo,owner/another-repo
GITHUB_COMMITS_LIMIT=5
```

## Run

Backend:

```bash
uvicorn backend.main:app --reload
```

Frontend:

```bash
npm --prefix frontend run dev
```

Production frontend build:

```bash
npm --prefix frontend run build
```

## Knowledge Updates

Edit Markdown files in `backend/knowledge`, then run:

```bash
python3 -m backend.ingest
```

The ingestion script deletes and recreates Supabase `documents` rows for each source file.

## Evaluation

Run a production evaluation in its own output directory:

```bash
uv run python evaluate.py \
  --chat-url https://www.aaronarada.tech/chat \
  --runs 3 \
  --output-dir evaluations/production-YYYY-MM-DD \
  --delay-seconds 65 \
  --run-delay-seconds 900
```

The runner saves after every question. If Gemini returns HTTP 429 after all
retries, the runner stops and leaves that question incomplete. Run the same
command again after the quota resets; successful question/run pairs are skipped,
and the interrupted question is retried. Use a new output directory when changing
the deployment or benchmark configuration so results from different environments
are not mixed.
