# Production Rollout and Rollback

This runbook preserves the legacy `documents` and `match_documents` path while v2 is staged, measured, and activated.

## Release Order

1. Merge the service/retry/test changes with `RAG_RETRIEVAL_V2=false`.
2. Apply `supabase/migrations/202607150001_production_rag_v2.sql` to the target Supabase project. This migration is additive and does not modify `documents`.
3. Run `python -m backend.ingest --dry-run` and resolve every chunk, uniqueness, or sensitive-data validation error.
4. Run `python -m backend.ingest`. Record the printed staging version and corpus hash; this does not activate it.
5. Deploy a preview with `RAG_RETRIEVAL_V2=true`, `RAG_INDEX_VERSION=<staging-uuid>`, `RAG_RETRIEVAL_CACHE=false`, and the evaluation token configured.
6. Run `python evaluate.py --smoke --chat-url <preview-chat-url>`.
7. Confirm the run's `summary.json` has `release_gates.passed: true` and `calibration.v2_eligible: true`. Use its calibrated threshold for `RAG_V2_MIN_VECTOR_SIMILARITY`.
8. Activate atomically with `python -m backend.ingest --activate <staging-uuid> --activation-report <summary.json>`.
9. Enable `RAG_RETRIEVAL_V2=true` in production without setting a staging version.
10. Run `python evaluate.py --runs 3 --chat-url <production-chat-url>` and require the full release gates.
11. Keep v1 storage and the prior v2 index for seven days. After stable monitoring, explicitly clean older retired v2 versions and remove v1 in a separate reviewed change.

Do not enable production caching before the new baseline passes. Evaluation-token requests always bypass the retrieval cache.

## Smoke and Full Gates

The evaluator calculates these gates deterministically:

- Request availability at least 98%.
- Partial-credit answer score at least 90%.
- In-scope source recall at least 90%.
- All 10 out-of-scope cases correct with no sources.
- All 7 unknown cases correct with no sources.
- Median end-to-end latency under 3.5 seconds.
- P95 end-to-end latency under 8 seconds.
- No request over 20 seconds.
- No raw provider errors or invalid public citation IDs.
- For the 195-attempt run, every case passes in at least two of three attempts.
- Calibrated v2 evidence threshold rejects all ten out-of-scope cases while retaining at least 90% in-scope source recall.

## Rollback

Fast rollback does not require schema changes:

1. Set `RAG_RETRIEVAL_V2=false` to return all traffic to legacy `match_documents`.
2. Or reactivate the prior retired v2 version with the activation command and a passing report.
3. Keep `RAG_RETRIEVAL_CACHE=false` during rollback and verification.
4. Run the 65-case smoke evaluation against the rolled-back deployment.

Never delete the legacy table or prior active index during the seven-day observation window.
