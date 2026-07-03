#!/usr/bin/env python3
"""Automated evaluation runner for Aaron Intelligence.

The runner sends questions to the existing chatbot API contract:
POST /chat with {"message": "..."} and reads the "answer" field.
It does not call Gemini, the retriever, or Langfuse directly.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import shutil
import sys
import time
import zipfile
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

import requests


ROOT = Path(__file__).resolve().parent
DEFAULT_WORKBOOK = ROOT / "evaluations" / "aaron_intelligence_chatbot_eval.xlsx"
DEFAULT_OUTPUT_DIR = ROOT
DEFAULT_RUNS = 3
DEFAULT_DELAY_SECONDS = 65.0
DEFAULT_RUN_DELAY_SECONDS = 900.0
DEFAULT_BACKOFF_INITIAL_SECONDS = 60.0
DEFAULT_BACKOFF_MAX_SECONDS = 900.0

CSV_COLUMNS = [
    "Run Number",
    "Question",
    "Response",
    "Response Time (ms)",
    "Success",
    "Retry Count",
    "Trace ID",
    "Timestamp",
]

TRACE_ID_BODY_KEYS = (
    "trace_id",
    "traceId",
    "langfuse_trace_id",
    "langfuseTraceId",
)

TRACE_ID_HEADER_KEYS = (
    "x-langfuse-trace-id",
    "x-trace-id",
    "trace-id",
)

LANGFUSE_METRIC_TERMS = (
    "token",
    "usage",
    "cost",
    "latency",
    "input",
    "output",
)

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


@dataclass
class Config:
    workbook: Path
    output_dir: Path
    chat_url: str | None
    runs: int
    delay_seconds: float
    run_delay_seconds: float
    max_retries: int
    backoff_initial_seconds: float
    backoff_max_seconds: float
    timeout_seconds: float
    schedule: bool
    schedule_time: str
    fresh_when_complete: bool
    dry_run: bool


class ChatClient:
    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str]]:
        raise NotImplementedError

    @property
    def mode(self) -> str:
        return self.__class__.__name__


class HttpChatClient(ChatClient):
    def __init__(self, url: str, timeout_seconds: float):
        self.url = url
        self.timeout_seconds = timeout_seconds
        self.session = requests.Session()

    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str]]:
        response = self.session.post(
            self.url,
            json={"message": question},
            timeout=self.timeout_seconds,
        )
        data = _response_json(response)
        return response.status_code, data, dict(response.headers)

    @property
    def mode(self) -> str:
        return f"HTTP {self.url}"


class InProcessChatClient(ChatClient):
    def __init__(self):
        from fastapi.testclient import TestClient

        from backend.main import app

        self.client = TestClient(app)

    def ask(self, question: str) -> tuple[int, dict[str, Any], dict[str, str]]:
        response = self.client.post("/chat", json={"message": question})
        data = _response_json(response)
        return response.status_code, data, dict(response.headers)

    @property
    def mode(self) -> str:
        return "in-process FastAPI /chat"


def _response_json(response: Any) -> dict[str, Any]:
    try:
        data = response.json()
    except Exception:
        data = {"detail": getattr(response, "text", "")}
    return data if isinstance(data, dict) else {"response": data}


def env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value in (None, ""):
        return default
    return float(value)


def env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value in (None, ""):
        return default
    return int(value)


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value in (None, ""):
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def parse_args() -> Config:
    parser = argparse.ArgumentParser(
        description="Run the Aaron Intelligence chatbot evaluation."
    )
    parser.add_argument(
        "--workbook",
        default=os.getenv("EVAL_WORKBOOK", str(DEFAULT_WORKBOOK)),
        help="Excel workbook containing evaluation questions.",
    )
    parser.add_argument(
        "--output-dir",
        default=os.getenv("EVAL_OUTPUT_DIR", str(DEFAULT_OUTPUT_DIR)),
        help="Directory for results.csv, results.json, and summary.json.",
    )
    parser.add_argument(
        "--chat-url",
        default=os.getenv("EVAL_CHAT_URL"),
        help="Chat endpoint URL. Defaults to local server if reachable, otherwise in-process FastAPI.",
    )
    parser.add_argument("--runs", type=int, default=env_int("EVAL_RUNS", DEFAULT_RUNS))
    parser.add_argument(
        "--delay-seconds",
        type=float,
        default=env_float("EVAL_DELAY_SECONDS", DEFAULT_DELAY_SECONDS),
        help="Delay between questions.",
    )
    parser.add_argument(
        "--run-delay-seconds",
        type=float,
        default=env_float("EVAL_RUN_DELAY_SECONDS", DEFAULT_RUN_DELAY_SECONDS),
        help="Delay between complete runs.",
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=env_int("EVAL_MAX_RETRIES", 4),
        help="Maximum retries after HTTP 429.",
    )
    parser.add_argument(
        "--backoff-initial-seconds",
        type=float,
        default=env_float(
            "EVAL_BACKOFF_INITIAL_SECONDS",
            DEFAULT_BACKOFF_INITIAL_SECONDS,
        ),
        help="Initial exponential backoff delay for HTTP 429.",
    )
    parser.add_argument(
        "--backoff-max-seconds",
        type=float,
        default=env_float("EVAL_BACKOFF_MAX_SECONDS", DEFAULT_BACKOFF_MAX_SECONDS),
        help="Maximum exponential backoff delay for HTTP 429.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=float,
        default=env_float("EVAL_TIMEOUT_SECONDS", 120.0),
        help="HTTP request timeout.",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        default=env_bool("EVAL_SCHEDULE", False),
        help="Run once per day until stopped.",
    )
    parser.add_argument(
        "--schedule-time",
        default=os.getenv("EVAL_SCHEDULE_TIME", "02:00"),
        help="Daily scheduler start time in HH:MM local time.",
    )
    parser.add_argument(
        "--fresh-when-complete",
        action="store_true",
        default=env_bool("EVAL_FRESH_WHEN_COMPLETE", False),
        help="Archive complete outputs and start a fresh evaluation.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Read questions and write no output without calling the chatbot.",
    )

    args = parser.parse_args()
    return Config(
        workbook=Path(args.workbook).expanduser().resolve(),
        output_dir=Path(args.output_dir).expanduser().resolve(),
        chat_url=args.chat_url,
        runs=max(1, args.runs),
        delay_seconds=max(0.0, args.delay_seconds),
        run_delay_seconds=max(0.0, args.run_delay_seconds),
        max_retries=max(0, args.max_retries),
        backoff_initial_seconds=max(0.0, args.backoff_initial_seconds),
        backoff_max_seconds=max(0.0, args.backoff_max_seconds),
        timeout_seconds=max(1.0, args.timeout_seconds),
        schedule=args.schedule,
        schedule_time=args.schedule_time,
        fresh_when_complete=args.fresh_when_complete,
        dry_run=args.dry_run,
    )


def load_questions(workbook: Path) -> list[str]:
    if not workbook.exists():
        raise FileNotFoundError(f"Workbook not found: {workbook}")

    sheets = read_xlsx_sheets(workbook)
    for sheet_name, rows in sheets:
        questions = questions_from_rows(rows)
        if questions:
            print(f"Loaded {len(questions)} questions from sheet '{sheet_name}'.")
            return questions

    raise ValueError("No question column found in workbook.")


def read_xlsx_sheets(path: Path) -> list[tuple[str, list[list[str]]]]:
    with zipfile.ZipFile(path) as archive:
        shared_strings = read_shared_strings(archive)
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_lookup = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in rels.findall(f"{{{PKG_REL_NS}}}Relationship")
        }

        sheets = []
        for sheet in workbook.findall(f".//{{{MAIN_NS}}}sheet"):
            sheet_name = sheet.attrib.get("name", "Sheet")
            rel_id = sheet.attrib[f"{{{REL_NS}}}id"]
            target = rel_lookup[rel_id]
            sheet_path = "xl/" + target.lstrip("/")
            rows = read_sheet_rows(archive, sheet_path, shared_strings)
            sheets.append((sheet_name, rows))

    return sheets


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values = []
    for item in root.findall(f"{{{MAIN_NS}}}si"):
        values.append("".join(text.text or "" for text in item.findall(f".//{{{MAIN_NS}}}t")))
    return values


def read_sheet_rows(
    archive: zipfile.ZipFile,
    sheet_path: str,
    shared_strings: list[str],
) -> list[list[str]]:
    root = ET.fromstring(archive.read(sheet_path))
    rows = []
    for row in root.findall(f".//{{{MAIN_NS}}}sheetData/{{{MAIN_NS}}}row"):
        values_by_index: dict[int, str] = {}
        for cell in row.findall(f"{{{MAIN_NS}}}c"):
            cell_ref = cell.attrib.get("r", "")
            values_by_index[column_index(cell_ref)] = read_cell_value(cell, shared_strings)
        if values_by_index:
            max_index = max(values_by_index)
            rows.append([values_by_index.get(index, "") for index in range(max_index + 1)])
    return rows


def read_cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value = cell.find(f"{{{MAIN_NS}}}v")

    if cell_type == "s" and value is not None:
        try:
            return shared_strings[int(value.text or "0")]
        except (IndexError, ValueError):
            return ""

    if cell_type == "inlineStr":
        inline = cell.find(f"{{{MAIN_NS}}}is")
        if inline is None:
            return ""
        return "".join(text.text or "" for text in inline.findall(f".//{{{MAIN_NS}}}t"))

    return "" if value is None else str(value.text or "")


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        return 0

    index = 0
    for char in match.group(1):
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def questions_from_rows(rows: list[list[str]]) -> list[str]:
    for row_index, row in enumerate(rows):
        header_index = find_question_header(row)
        if header_index is None:
            continue

        questions = []
        for data_row in rows[row_index + 1 :]:
            if header_index >= len(data_row):
                continue
            question = normalize_question(data_row[header_index])
            if question:
                questions.append(question)

        if questions:
            return questions

    return []


def find_question_header(row: list[str]) -> int | None:
    for index, value in enumerate(row):
        normalized = str(value).strip().lower()
        if normalized == "question" or normalized.endswith(" question"):
            return index
    return None


def normalize_question(value: Any) -> str:
    return str(value or "").strip()


def choose_client(config: Config) -> ChatClient:
    if config.chat_url:
        return HttpChatClient(config.chat_url, config.timeout_seconds)

    local_url = "http://127.0.0.1:8000/chat"
    if is_chat_url_reachable(local_url, config.timeout_seconds):
        return HttpChatClient(local_url, config.timeout_seconds)

    return InProcessChatClient()


def is_chat_url_reachable(url: str, timeout_seconds: float) -> bool:
    try:
        response = requests.options(url, timeout=min(timeout_seconds, 2.0))
        return response.status_code < 500
    except Exception:
        return False


def load_existing_results(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("results"), list):
        return data["results"]
    return []


def write_outputs(
    output_dir: Path,
    results: list[dict[str, Any]],
    summary: dict[str, Any],
    config: Config,
    question_count: int,
    client_mode: str,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(output_dir / "results.csv", results)
    write_json(
        output_dir / "results.json",
        {
            "metadata": {
                "generated_at": utc_now(),
                "workbook": str(config.workbook),
                "question_count": question_count,
                "runs": config.runs,
                "client_mode": client_mode,
            },
            "results": results,
        },
    )
    write_json(output_dir / "summary.json", summary)


def write_csv(path: Path, results: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for result in sorted_results(results):
            writer.writerow(
                {
                    "Run Number": result.get("run_number"),
                    "Question": result.get("question"),
                    "Response": result.get("response"),
                    "Response Time (ms)": result.get("response_time_ms"),
                    "Success": result.get("success"),
                    "Retry Count": result.get("retry_count"),
                    "Trace ID": result.get("trace_id"),
                    "Timestamp": result.get("timestamp"),
                }
            )


def write_json(path: Path, data: Any) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        file.write("\n")
    tmp_path.replace(path)


def sorted_results(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        results,
        key=lambda item: (
            int(item.get("run_number") or 0),
            int(item.get("question_number") or 0),
        ),
    )


def completed_keys(results: list[dict[str, Any]]) -> set[tuple[int, int]]:
    keys = set()
    for result in results:
        run_number = result.get("run_number")
        question_number = result.get("question_number")
        if run_number is None or question_number is None:
            continue
        keys.add((int(run_number), int(question_number)))
    return keys


def run_evaluation(config: Config) -> dict[str, Any]:
    questions = load_questions(config.workbook)
    expected_count = config.runs * len(questions)
    results_path = config.output_dir / "results.json"

    if config.fresh_when_complete and outputs_are_complete(results_path, expected_count):
        archive_outputs(config.output_dir)

    results = load_existing_results(results_path)
    done = completed_keys(results)

    if config.dry_run:
        summary = build_summary(results, questions, config, "dry-run", time.time())
        print(f"Dry run loaded {len(questions)} questions; no chatbot calls were made.")
        return summary

    client = choose_client(config)
    print(f"Using chatbot client: {client.mode}")
    evaluation_start = time.time()

    for run_number in range(1, config.runs + 1):
        if run_number > 1 and has_remaining_questions(done, run_number, len(questions)):
            print(
                f"Waiting {config.run_delay_seconds:.1f}s before run {run_number} "
                "to reduce rate limiting."
            )
            sleep(config.run_delay_seconds)

        for index, question in enumerate(questions, start=1):
            key = (run_number, index)
            if key in done:
                continue

            print(f"Run {run_number}/{config.runs}, question {index}/{len(questions)}")
            result = ask_with_retries(client, question, run_number, index, config)
            results.append(result)
            done.add(key)

            summary = build_summary(
                results,
                questions,
                config,
                client.mode,
                evaluation_start,
            )
            write_outputs(
                config.output_dir,
                results,
                summary,
                config,
                len(questions),
                client.mode,
            )

            if index < len(questions) and has_remaining_questions(
                done,
                run_number,
                len(questions),
            ):
                sleep(config.delay_seconds)

    summary = build_summary(results, questions, config, client.mode, evaluation_start)
    write_outputs(
        config.output_dir,
        results,
        summary,
        config,
        len(questions),
        client.mode,
    )
    return summary


def outputs_are_complete(results_path: Path, expected_count: int) -> bool:
    return len(load_existing_results(results_path)) >= expected_count


def archive_outputs(output_dir: Path) -> None:
    candidates = ["results.csv", "results.json", "summary.json"]
    existing = [output_dir / name for name in candidates if (output_dir / name).exists()]
    if not existing:
        return

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    archive_dir = output_dir / "evaluation_history" / stamp
    archive_dir.mkdir(parents=True, exist_ok=True)
    for path in existing:
        shutil.move(str(path), str(archive_dir / path.name))
    print(f"Archived previous complete outputs to {archive_dir}")


def has_remaining_questions(
    done: set[tuple[int, int]],
    run_number: int,
    question_count: int,
) -> bool:
    return any((run_number, index) not in done for index in range(1, question_count + 1))


def ask_with_retries(
    client: ChatClient,
    question: str,
    run_number: int,
    question_number: int,
    config: Config,
) -> dict[str, Any]:
    started = time.perf_counter()
    retry_count = 0
    last_status = None
    last_data: dict[str, Any] = {}
    last_headers: dict[str, str] = {}
    error_message = ""

    for attempt in range(config.max_retries + 1):
        try:
            status, data, headers = client.ask(question)
            last_status = status
            last_data = data
            last_headers = headers

            if status == 429 and attempt < config.max_retries:
                retry_count += 1
                wait_seconds = retry_wait_seconds(
                    config,
                    retry_count,
                    last_data,
                    last_headers,
                )
                print(f"HTTP 429 received; retrying in {wait_seconds:.1f}s.")
                sleep(wait_seconds)
                continue

            break
        except Exception as exc:
            error_message = str(exc)
            last_status = None
            if attempt < config.max_retries and is_retryable_exception(exc):
                retry_count += 1
                wait_seconds = backoff_seconds(config, retry_count)
                print(f"Request failed; retrying in {wait_seconds:.1f}s: {error_message}")
                sleep(wait_seconds)
                continue
            break

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    success = bool(last_status is not None and 200 <= last_status < 300)
    response_text = response_text_from_data(last_data, error_message)

    return {
        "run_number": run_number,
        "question_number": question_number,
        "question": question,
        "response": response_text,
        "response_time_ms": elapsed_ms,
        "success": success,
        "retry_count": retry_count,
        "trace_id": extract_trace_id(last_data, last_headers),
        "timestamp": utc_now(),
        "status_code": last_status,
        "error": "" if success else response_text,
        "langfuse_metrics": extract_langfuse_metrics(last_data),
    }


def is_retryable_exception(exc: Exception) -> bool:
    return isinstance(exc, (requests.Timeout, requests.ConnectionError))


def backoff_seconds(config: Config, retry_count: int) -> float:
    if retry_count <= 0:
        return 0.0
    delay = config.backoff_initial_seconds * (2 ** (retry_count - 1))
    return min(delay, config.backoff_max_seconds)


def retry_wait_seconds(
    config: Config,
    retry_count: int,
    data: dict[str, Any],
    headers: dict[str, str],
) -> float:
    retry_after = extract_retry_after_seconds(data, headers)
    backoff = backoff_seconds(config, retry_count)
    if retry_after is None:
        return backoff
    return min(max(backoff, retry_after), config.backoff_max_seconds)


def extract_retry_after_seconds(
    data: dict[str, Any],
    headers: dict[str, str],
) -> float | None:
    lower_headers = {str(key).lower(): value for key, value in headers.items()}
    header_value = lower_headers.get("retry-after")
    parsed_header = parse_retry_after_value(header_value)
    if parsed_header is not None:
        return parsed_header

    for value in flatten_strings(data):
        parsed_text = parse_retry_after_value(value)
        if parsed_text is not None:
            return parsed_text

    return None


def parse_retry_after_value(value: Any) -> float | None:
    if value in (None, ""):
        return None

    text = str(value)
    if text.strip().isdigit():
        return float(text.strip())

    retry_patterns = (
        r"retryDelay['\"]?\s*:\s*['\"]?(\d+(?:\.\d+)?)s",
        r"retry\s+in\s+(\d+(?:\.\d+)?)\s*s",
        r"retry\s+after\s+(\d+(?:\.\d+)?)\s*s",
    )
    for pattern in retry_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return float(match.group(1))

    return None


def flatten_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        strings = []
        for child in value.values():
            strings.extend(flatten_strings(child))
        return strings
    if isinstance(value, list):
        strings = []
        for child in value:
            strings.extend(flatten_strings(child))
        return strings
    return []


def sleep(seconds: float) -> None:
    if seconds > 0:
        time.sleep(seconds)


def response_text_from_data(data: dict[str, Any], fallback_error: str) -> str:
    for key in ("answer", "response", "message", "detail", "error"):
        value = data.get(key)
        if value not in (None, ""):
            return str(value)
    return fallback_error


def extract_trace_id(data: dict[str, Any], headers: dict[str, str]) -> str:
    for key in TRACE_ID_BODY_KEYS:
        value = data.get(key)
        if value:
            return str(value)

    lower_headers = {str(key).lower(): value for key, value in headers.items()}
    for key in TRACE_ID_HEADER_KEYS:
        value = lower_headers.get(key)
        if value:
            return str(value)

    return ""


def extract_langfuse_metrics(data: dict[str, Any]) -> dict[str, Any]:
    metrics = {}
    for key, value in data.items():
        lower_key = str(key).lower()
        if any(term in lower_key for term in LANGFUSE_METRIC_TERMS):
            metrics[key] = value
    return metrics


def build_summary(
    results: list[dict[str, Any]],
    questions: list[str],
    config: Config,
    client_mode: str,
    evaluation_start: float,
) -> dict[str, Any]:
    completed = len(results)
    successes = [row for row in results if row.get("success")]
    failures = completed - len(successes)
    response_times = [
        float(row["response_time_ms"])
        for row in results
        if row.get("response_time_ms") is not None
    ]
    answer_lengths = [
        len(str(row.get("response") or ""))
        for row in successes
    ]

    total_runtime_ms = round((time.time() - evaluation_start) * 1000)
    expected = config.runs * len(questions)

    summary = {
        "generated_at": utc_now(),
        "workbook": str(config.workbook),
        "client_mode": client_mode,
        "configured_runs": config.runs,
        "questions_per_run": len(questions),
        "expected_questions": expected,
        "completed_questions": completed,
        "remaining_questions": max(0, expected - completed),
        "success_count": len(successes),
        "failure_count": failures,
        "success_rate": rate(len(successes), completed),
        "failure_rate": rate(failures, completed),
        "retry_count": sum(int(row.get("retry_count") or 0) for row in results),
        "average_response_time_ms": average(response_times),
        "median_response_time_ms": percentile(response_times, 50),
        "p95_response_time_ms": percentile(response_times, 95),
        "average_answer_length": average(answer_lengths),
        "total_runtime_ms": total_runtime_ms,
        "total_runtime_seconds": round(total_runtime_ms / 1000, 3),
        "langfuse_metrics": summarize_langfuse_metrics(results),
        "configuration": {
            "delay_seconds": config.delay_seconds,
            "run_delay_seconds": config.run_delay_seconds,
            "max_retries": config.max_retries,
            "backoff_initial_seconds": config.backoff_initial_seconds,
            "backoff_max_seconds": config.backoff_max_seconds,
            "timeout_seconds": config.timeout_seconds,
        },
    }
    return summary


def average(values: list[float]) -> float | None:
    if not values:
        return None
    return round(sum(values) / len(values), 3)


def rate(part: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round(part / total, 6)


def percentile(values: list[float], p: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return round(ordered[0], 3)

    rank = (len(ordered) - 1) * (p / 100.0)
    lower = math.floor(rank)
    upper = math.ceil(rank)
    if lower == upper:
        return round(ordered[int(rank)], 3)

    weight = rank - lower
    value = ordered[lower] * (1 - weight) + ordered[upper] * weight
    return round(value, 3)


def summarize_langfuse_metrics(results: list[dict[str, Any]]) -> dict[str, Any]:
    totals: dict[str, float] = {}
    counts: dict[str, int] = {}

    for row in results:
        metrics = row.get("langfuse_metrics") or {}
        if not isinstance(metrics, dict):
            continue
        for key, value in flatten_metrics(metrics).items():
            if isinstance(value, (int, float)):
                totals[key] = totals.get(key, 0.0) + float(value)
                counts[key] = counts.get(key, 0) + 1

    summary = {}
    for key in sorted(totals):
        summary[key] = {
            "total": round(totals[key], 6),
            "average": round(totals[key] / counts[key], 6),
            "count": counts[key],
        }
    return summary


def flatten_metrics(data: dict[str, Any], prefix: str = "") -> dict[str, Any]:
    flattened = {}
    for key, value in data.items():
        name = f"{prefix}.{key}" if prefix else str(key)
        if isinstance(value, dict):
            flattened.update(flatten_metrics(value, name))
        else:
            flattened[name] = value
    return flattened


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def scheduler_loop(config: Config) -> None:
    print(
        "Scheduler enabled. Daily evaluations will run at "
        f"{config.schedule_time} local time."
    )
    while True:
        wait_until_next_schedule(config.schedule_time)
        daily_config = Config(**{**config.__dict__, "fresh_when_complete": True})
        summary = run_evaluation(daily_config)
        print_summary(summary)
        sleep(60)


def wait_until_next_schedule(schedule_time: str) -> None:
    hour, minute = parse_schedule_time(schedule_time)
    now = datetime.now()
    next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if next_run <= now:
        next_run = next_run + timedelta(days=1)
    seconds = (next_run - now).total_seconds()
    print(f"Next scheduled evaluation: {next_run.isoformat(timespec='seconds')}")
    sleep(seconds)


def parse_schedule_time(value: str) -> tuple[int, int]:
    match = re.match(r"^(\d{1,2}):(\d{2})$", value.strip())
    if not match:
        raise ValueError("Schedule time must use HH:MM format.")
    hour = int(match.group(1))
    minute = int(match.group(2))
    if hour > 23 or minute > 59:
        raise ValueError("Schedule time must use HH:MM format.")
    return hour, minute


def print_summary(summary: dict[str, Any]) -> None:
    print("Evaluation summary")
    print(f"Completed: {summary['completed_questions']}/{summary['expected_questions']}")
    print(f"Success rate: {summary['success_rate']:.2%}")
    print(f"Failure rate: {summary['failure_rate']:.2%}")
    print(f"Average response time: {summary['average_response_time_ms']} ms")
    print(f"Median response time: {summary['median_response_time_ms']} ms")
    print(f"P95 response time: {summary['p95_response_time_ms']} ms")
    print(f"Retry count: {summary['retry_count']}")
    print(f"Total runtime: {summary['total_runtime_seconds']} s")


def main() -> int:
    config = parse_args()
    try:
        if config.schedule:
            scheduler_loop(config)
            return 0

        summary = run_evaluation(config)
        print_summary(summary)
        print(f"Saved results to {config.output_dir}")
        return 0
    except KeyboardInterrupt:
        print("Interrupted. Progress already saved after the last completed question.")
        return 130
    except Exception as exc:
        print(f"Evaluation failed before a question could be completed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
