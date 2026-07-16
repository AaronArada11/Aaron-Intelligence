#!/usr/bin/env python3
"""Immutable, deterministic evaluation runner for Aaron Intelligence."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import re
import subprocess
import time
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

from backend.calibration import calibrate_evidence_threshold
from backend.chat_service import CHAT_MODEL, PROMPT_VERSION
from backend.chunking import corpus_hash
from backend.ingest import DEFAULT_KNOWLEDGE_DIR, EMBEDDING_MODEL
from evaluations.scoring import score_case


ROOT = Path(__file__).resolve().parent
DEFAULT_CASES = ROOT / "evaluations" / "cases.json"
DEFAULT_RUNS_DIR = ROOT / "evaluations" / "runs"
RETRY_WAITS_SECONDS = (2.0, 5.0)
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
RAW_ERROR_PATTERNS = (
    r"resource_exhausted",
    r"google\.api",
    r"traceback",
    r"gemini error",
    r"retriever error",
    r"api[_ -]?key",
)


@dataclass(frozen=True, slots=True)
class EvaluationConfig:
    cases_path: Path
    output_root: Path
    chat_url: str | None
    runs: int
    timeout_seconds: float
    delay_seconds: float
    max_retries: int
    evaluation_token: str
    resume_run: Path | None
    dry_run: bool
    stop_on_rate_limit: bool = True


class ChatClient:
    @property
    def mode(self) -> str:
        raise NotImplementedError

    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str], float]:
        raise NotImplementedError


class HttpChatClient(ChatClient):
    def __init__(self, url: str, timeout_seconds: float, token: str):
        self.url = url
        self.timeout_seconds = timeout_seconds
        self.session = requests.Session()
        self.headers = {"X-Evaluation-Token": token} if token else {}

    @property
    def mode(self) -> str:
        return f"HTTP {self.url}"

    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str], float]:
        started = time.perf_counter()
        response = self.session.post(
            self.url,
            json={"message": question},
            headers=self.headers,
            timeout=self.timeout_seconds,
        )
        elapsed_ms = round((time.perf_counter() - started) * 1000, 3)
        return response.status_code, response_json(response), dict(response.headers), elapsed_ms


class InProcessChatClient(ChatClient):
    def __init__(self, token: str):
        from fastapi.testclient import TestClient

        if not token:
            token = f"local-eval-{uuid.uuid4()}"
            os.environ["EVAL_DIAGNOSTICS_TOKEN"] = token
        self.token = token
        from backend.main import app

        self.client = TestClient(app)

    @property
    def mode(self) -> str:
        return "in-process FastAPI /chat"

    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str], float]:
        started = time.perf_counter()
        response = self.client.post(
            "/chat",
            json={"message": question},
            headers={"X-Evaluation-Token": self.token},
        )
        elapsed_ms = round((time.perf_counter() - started) * 1000, 3)
        return response.status_code, response_json(response), dict(response.headers), elapsed_ms


def parse_args() -> EvaluationConfig:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_RUNS_DIR)
    parser.add_argument("--chat-url", default=os.getenv("EVAL_CHAT_URL"))
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--smoke", action="store_true", help="Run one attempt per case")
    parser.add_argument("--timeout-seconds", type=float, default=20.0)
    parser.add_argument("--delay-seconds", type=float, default=0.0)
    parser.add_argument("--max-retries", type=int, default=2)
    parser.add_argument("--resume-run", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--continue-on-rate-limit",
        action="store_true",
        help="Continue to later cases after an exhausted HTTP 429 instead of stopping.",
    )
    args = parser.parse_args()
    return EvaluationConfig(
        cases_path=args.cases.expanduser().resolve(),
        output_root=args.output_root.expanduser().resolve(),
        chat_url=args.chat_url,
        runs=1 if args.smoke else max(1, args.runs),
        timeout_seconds=max(1.0, args.timeout_seconds),
        delay_seconds=max(0.0, args.delay_seconds),
        max_retries=min(2, max(0, args.max_retries)),
        evaluation_token=os.getenv("EVAL_DIAGNOSTICS_TOKEN", ""),
        resume_run=args.resume_run.expanduser().resolve() if args.resume_run else None,
        dry_run=args.dry_run,
        stop_on_rate_limit=not args.continue_on_rate_limit,
    )


def response_json(response: Any) -> dict[str, Any]:
    try:
        data = response.json()
    except Exception:
        data = {"detail": getattr(response, "text", "")}
    return data if isinstance(data, dict) else {"response": data}


def load_cases(path: Path) -> list[dict[str, Any]]:
    cases = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or len(cases) != 65:
        raise ValueError("Canonical evaluation corpus must contain exactly 65 cases")
    ids = [str(case.get("id")) for case in cases]
    if len(set(ids)) != len(ids):
        raise ValueError("Evaluation case IDs must be unique")
    return cases


def git_sha() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip() or "unknown"


def build_fingerprint(config: EvaluationConfig) -> dict[str, Any]:
    knowledge_files = sorted(DEFAULT_KNOWLEDGE_DIR.rglob("*.md"))
    return {
        "git_sha": git_sha(),
        "corpus_hash": corpus_hash(knowledge_files),
        "index_version": os.getenv("RAG_INDEX_VERSION")
        or ("active-v2" if env_bool("RAG_RETRIEVAL_V2", False) else "legacy-v1"),
        "chat_model": CHAT_MODEL,
        "embedding_model": EMBEDDING_MODEL,
        "prompt_version": PROMPT_VERSION,
        "retry_configuration": {
            "max_retries": config.max_retries,
            "waits_seconds": list(RETRY_WAITS_SECONDS[: config.max_retries]),
            "timeout_seconds": config.timeout_seconds,
            "stop_on_rate_limit": config.stop_on_rate_limit,
        },
        "runs": config.runs,
        "cases_hash": hashlib.sha256(config.cases_path.read_bytes()).hexdigest(),
    }


def fingerprint_id(fingerprint: dict[str, Any]) -> str:
    encoded = json.dumps(fingerprint, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()[:16]


def prepare_run_directory(
    config: EvaluationConfig,
    fingerprint: dict[str, Any],
) -> Path:
    if config.resume_run:
        stored_path = config.resume_run / "fingerprint.json"
        if not stored_path.exists():
            raise ValueError("Resume directory has no fingerprint.json")
        stored = json.loads(stored_path.read_text(encoding="utf-8"))
        if stored != fingerprint:
            raise ValueError("Resume fingerprint does not exactly match this evaluation")
        return config.resume_run

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    run_dir = config.output_root / f"{stamp}-{fingerprint_id(fingerprint)}"
    run_dir.mkdir(parents=True, exist_ok=False)
    write_json(run_dir / "fingerprint.json", fingerprint)
    return run_dir


def choose_client(config: EvaluationConfig) -> ChatClient:
    if config.chat_url:
        return HttpChatClient(
            config.chat_url,
            config.timeout_seconds,
            config.evaluation_token,
        )
    return InProcessChatClient(config.evaluation_token)


def ask_with_retries(
    client: ChatClient,
    case: dict[str, Any],
    *,
    run_number: int,
    config: EvaluationConfig,
) -> dict[str, Any]:
    e2e_started = time.perf_counter()
    retry_sleep_ms = 0.0
    request_time_ms = 0.0
    retries = 0
    status_code: int | None = None
    data: dict[str, Any] = {}
    headers: dict[str, str] = {}
    error = ""

    for attempt in range(config.max_retries + 1):
        try:
            status_code, data, headers, attempt_request_ms = client.ask(case["question"])
            request_time_ms += attempt_request_ms
            should_retry = status_code in RETRYABLE_STATUS_CODES
        except (requests.Timeout, requests.ConnectionError) as exc:
            error = str(exc)
            should_retry = True
            status_code = None
            data = {}
            headers = {}

        if should_retry and attempt < config.max_retries:
            wait_seconds = RETRY_WAITS_SECONDS[attempt]
            time.sleep(wait_seconds)
            retry_sleep_ms += wait_seconds * 1000
            retries += 1
            continue
        break

    response = data if 200 <= (status_code or 0) < 300 else {
        "answer": str(data.get("detail") or error),
        "outcome": "",
        "sources": [],
    }
    scored = score_case(case, response, status_code=status_code)
    diagnostics = data.get("diagnostics") if isinstance(data.get("diagnostics"), dict) else {}
    provider_time = diagnostics.get("provider_time_ms") or {}
    timings = diagnostics.get("timings_ms") or {}
    provider_latency_ms = sum(
        float(value)
        for value in provider_time.values()
        if isinstance(value, (int, float))
    )
    e2e_latency_ms = round((time.perf_counter() - e2e_started) * 1000, 3)

    raw_error = contains_raw_provider_error(data)
    invalid_citation = any(
        not re.fullmatch(r"S[1-9]\d*", str(source.get("id") or ""))
        for source in (data.get("sources") or [])
        if isinstance(source, dict)
    )

    return {
        "completion_key": f"{case['id']}:{run_number}",
        "case_id": case["id"],
        "run_number": run_number,
        "group": case["group"],
        "category": case["category"],
        "question": case["question"],
        "expected_outcome": case["expected_outcome"],
        "status_code": status_code,
        "available": bool(status_code and 200 <= status_code < 300),
        "answer": str(data.get("answer") or data.get("detail") or error),
        "outcome": str(data.get("outcome") or ""),
        "sources": data.get("sources") or [],
        "score": scored.label,
        "score_value": scored.value,
        "outcome_pass": scored.outcome_pass,
        "source_pass": scored.source_pass,
        "fact_groups_passed": scored.fact_groups_passed,
        "fact_groups_total": scored.fact_groups_total,
        "forbidden_match": scored.forbidden_match,
        "request_id": str(data.get("request_id") or ""),
        "trace_id": str(diagnostics.get("trace_id") or data.get("trace_id") or ""),
        "retry_count": retries,
        "retry_sleep_ms": round(retry_sleep_ms, 3),
        "request_time_ms": round(request_time_ms, 3),
        "provider_latency_ms": round(provider_latency_ms, 3),
        "service_latency_ms": optional_float(timings.get("total_service")),
        "e2e_latency_ms": e2e_latency_ms,
        "raw_provider_error": raw_error,
        "invalid_citation": invalid_citation,
        "diagnostics": diagnostics,
        "timestamp": utc_now(),
        "retry_after": header_value(headers, "retry-after"),
    }


def contains_raw_provider_error(data: dict[str, Any]) -> bool:
    serialized = json.dumps(data, ensure_ascii=False)
    return any(re.search(pattern, serialized, flags=re.IGNORECASE) for pattern in RAW_ERROR_PATTERNS)


def header_value(headers: dict[str, str], key: str) -> str:
    lower = {str(name).casefold(): str(value) for name, value in headers.items()}
    return lower.get(key.casefold(), "")


def optional_float(value: Any) -> float | None:
    try:
        return None if value is None else round(float(value), 3)
    except (TypeError, ValueError):
        return None


def run_evaluation(config: EvaluationConfig) -> tuple[Path | None, dict[str, Any]]:
    cases = load_cases(config.cases_path)
    fingerprint = build_fingerprint(config)
    if config.dry_run:
        summary = {
            "case_count": len(cases),
            "attempt_count": len(cases) * config.runs,
            "fingerprint": fingerprint,
            "database_writes": 0,
            "chat_requests": 0,
        }
        return None, summary

    run_dir = prepare_run_directory(config, fingerprint)
    results_path = run_dir / "results.json"
    results = load_results(results_path)
    completed = {str(row.get("completion_key")) for row in results}
    client = choose_client(config)

    for run_number in range(1, config.runs + 1):
        for case in cases:
            completion_key = f"{case['id']}:{run_number}"
            if completion_key in completed:
                continue
            result = ask_with_retries(
                client,
                case,
                run_number=run_number,
                config=config,
            )
            if result["status_code"] == 429 and config.stop_on_rate_limit:
                record_interruption(run_dir, result, fingerprint)
                summary = build_summary(results, cases, config, fingerprint, client.mode)
                summary.update(
                    {
                        "stopped_early": True,
                        "stop_reason": "rate_limited",
                        "stopped_at_completion_key": completion_key,
                        "retry_after": result.get("retry_after") or "",
                    }
                )
                write_outputs(run_dir, results, summary, fingerprint)
                print(
                    f"{completion_key} rate_limited after "
                    f"{result['retry_count']} retries; evaluation stopped",
                    flush=True,
                )
                return run_dir, summary
            results.append(result)
            completed.add(completion_key)
            summary = build_summary(results, cases, config, fingerprint, client.mode)
            write_outputs(run_dir, results, summary, fingerprint)
            print(
                f"{completion_key} {result['score']} "
                f"{result['e2e_latency_ms']:.0f}ms",
                flush=True,
            )
            if config.delay_seconds:
                time.sleep(config.delay_seconds)

    summary = build_summary(results, cases, config, fingerprint, client.mode)
    write_outputs(run_dir, results, summary, fingerprint)
    return run_dir, summary


def load_results(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("results", []) if isinstance(data, dict) else []


def record_interruption(
    run_dir: Path,
    result: dict[str, Any],
    fingerprint: dict[str, Any],
) -> None:
    path = run_dir / "interruptions.json"
    if path.exists():
        stored = json.loads(path.read_text(encoding="utf-8"))
        interruptions = stored.get("interruptions", []) if isinstance(stored, dict) else []
    else:
        interruptions = []
    interruptions.append(
        {
            "interruption_id": str(uuid.uuid4()),
            "recorded_at": utc_now(),
            "reason": "rate_limited",
            "result": result,
        }
    )
    write_json(
        path,
        {
            "fingerprint": fingerprint,
            "interruptions": interruptions,
        },
    )


def build_summary(
    results: list[dict[str, Any]],
    cases: list[dict[str, Any]],
    config: EvaluationConfig,
    fingerprint: dict[str, Any],
    client_mode: str,
) -> dict[str, Any]:
    completed = len(results)
    available = sum(bool(row.get("available")) for row in results)
    answered_rows = [row for row in results if row.get("expected_outcome") == "answered"]
    scope_rows = [row for row in results if row.get("expected_outcome") == "out_of_scope"]
    unknown_rows = [row for row in results if row.get("expected_outcome") == "unknown"]
    latencies = [float(row["e2e_latency_ms"]) for row in results if row.get("available")]
    request_latencies = [float(row["request_time_ms"]) for row in results if row.get("available")]
    provider_latencies = [float(row["provider_latency_ms"]) for row in results if row.get("available")]
    retry_sleeps = [float(row["retry_sleep_ms"]) for row in results]

    availability = ratio(available, completed)
    answer_score = ratio(sum(float(row.get("score_value") or 0) for row in results), completed)
    source_recall = ratio(sum(bool(row.get("source_pass")) for row in answered_rows), len(answered_rows))
    scope_accuracy = ratio(
        sum(row.get("outcome_pass") and not row.get("sources") for row in scope_rows),
        len(scope_rows),
    )
    unknown_accuracy = ratio(
        sum(row.get("outcome_pass") and not row.get("sources") for row in unknown_rows),
        len(unknown_rows),
    )
    per_case_passes = {
        case["id"]: sum(
            row.get("case_id") == case["id"] and row.get("score") != "wrong"
            for row in results
        )
        for case in cases
    }
    every_question_two_of_three = (
        all(value >= 2 for value in per_case_passes.values())
        if config.runs >= 3 and completed == len(cases) * config.runs
        else True
    )

    calibration = build_calibration(results, cases)
    is_v2 = fingerprint["index_version"] != "legacy-v1"
    gates = {
        "request_availability": availability >= 0.98,
        "partial_credit_answer_score": answer_score >= 0.90,
        "in_scope_source_recall": source_recall >= 0.90,
        "out_of_scope_accuracy": scope_accuracy == 1.0,
        "unknown_accuracy": unknown_accuracy == 1.0,
        "median_latency": bool(latencies) and percentile(latencies, 50) < 3500,
        "p95_latency": bool(latencies) and percentile(latencies, 95) < 8000,
        "maximum_latency": bool(latencies) and max(latencies) <= 20000,
        "sanitized_errors": not any(row.get("raw_provider_error") for row in results),
        "valid_citations": not any(row.get("invalid_citation") for row in results),
        "every_question_two_of_three": every_question_two_of_three,
        "v2_calibration": (not is_v2) or bool(calibration and calibration.get("v2_eligible")),
    }
    expected_attempts = len(cases) * config.runs
    gates["complete"] = completed == expected_attempts
    gates["passed"] = all(value for key, value in gates.items() if key != "passed")

    return {
        "generated_at": utc_now(),
        "client_mode": client_mode,
        "fingerprint": fingerprint,
        "configured_runs": config.runs,
        "case_count": len(cases),
        "expected_attempts": expected_attempts,
        "completed_attempts": completed,
        "request_availability": availability,
        "partial_credit_answer_score": answer_score,
        "retrieval_source_recall": source_recall,
        "scope_accuracy": scope_accuracy,
        "unknown_accuracy": unknown_accuracy,
        "score_counts": {
            label: sum(row.get("score") == label for row in results)
            for label in ("correct", "partial", "wrong")
        },
        "latency_ms": {
            "request_average": average(request_latencies),
            "provider_average": average(provider_latencies),
            "retry_sleep_total": round(sum(retry_sleeps), 3),
            "end_to_end_median": percentile(latencies, 50),
            "end_to_end_p95": percentile(latencies, 95),
            "end_to_end_max": max(latencies) if latencies else None,
        },
        "calibration": calibration,
        "per_case_passes": per_case_passes,
        "release_gates": gates,
    }


def build_calibration(
    results: list[dict[str, Any]],
    cases: list[dict[str, Any]],
) -> dict[str, Any] | None:
    first_by_case = {}
    for row in results:
        first_by_case.setdefault(row.get("case_id"), row)
    records = []
    for case in cases:
        if case["expected_outcome"] not in {"answered", "out_of_scope"}:
            continue
        result = first_by_case.get(case["id"])
        if result is None:
            return None
        diagnostics = result.get("diagnostics") or {}
        candidates = diagnostics.get("retrieval")
        if not isinstance(candidates, list):
            return None
        records.append(
            {
                "expected_outcome": case["expected_outcome"],
                "required_source_alternatives": case["required_source_alternatives"],
                "candidates": candidates,
            }
        )
    try:
        return asdict(calibrate_evidence_threshold(records))
    except ValueError:
        return None


def write_outputs(
    run_dir: Path,
    results: list[dict[str, Any]],
    summary: dict[str, Any],
    fingerprint: dict[str, Any],
) -> None:
    ordered = sorted(results, key=lambda row: (row["run_number"], row["case_id"]))
    write_json(
        run_dir / "results.json",
        {"fingerprint": fingerprint, "results": ordered},
    )
    write_json(run_dir / "summary.json", summary)
    write_csv(run_dir / "results.csv", ordered)


def write_json(path: Path, data: Any) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    columns = [
        "completion_key",
        "case_id",
        "run_number",
        "group",
        "category",
        "question",
        "expected_outcome",
        "outcome",
        "score",
        "score_value",
        "source_pass",
        "status_code",
        "retry_count",
        "retry_sleep_ms",
        "request_time_ms",
        "provider_latency_ms",
        "service_latency_ms",
        "e2e_latency_ms",
        "request_id",
        "trace_id",
        "answer",
        "timestamp",
    ]
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    temporary.replace(path)


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().casefold() in {"1", "true", "yes", "on"}


def ratio(part: float, total: int) -> float:
    return round(part / total, 6) if total else 0.0


def average(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 3) if values else None


def percentile(values: list[float], value: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return round(ordered[0], 3)
    rank = (len(ordered) - 1) * value / 100
    lower = math.floor(rank)
    upper = math.ceil(rank)
    if lower == upper:
        return round(ordered[lower], 3)
    weight = rank - lower
    return round(ordered[lower] * (1 - weight) + ordered[upper] * weight, 3)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def main() -> int:
    config = parse_args()
    try:
        run_dir, summary = run_evaluation(config)
    except KeyboardInterrupt:
        print("Interrupted; the last completed immutable result is saved.")
        return 130
    except Exception as exc:
        print(f"Evaluation failed: {exc}")
        return 1

    if run_dir:
        print(f"Evaluation run: {run_dir}")
        print(f"Release gates passed: {summary['release_gates']['passed']}")
        if summary.get("stopped_early"):
            print(
                "Evaluation stopped because the chat remained rate limited after retries. "
                "Resume the same run after the limit resets."
            )
            return 75
    else:
        print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
