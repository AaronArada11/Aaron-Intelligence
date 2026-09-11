import json
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest import TestCase

from backend.main import _gemini_usage_details
from evaluate import (
    build_observability_summary,
    completed_keys,
    extract_langfuse_metrics,
    replace_result,
    resolve_output_dir,
)


class ObservabilityMetricsTests(TestCase):
    def test_gemini_usage_is_mapped_for_response_and_langfuse(self):
        response = SimpleNamespace(
            usage_metadata=SimpleNamespace(
                prompt_token_count=120,
                candidates_token_count=30,
                thoughts_token_count=10,
                cached_content_token_count=5,
                total_token_count=160,
            )
        )

        provider, langfuse = _gemini_usage_details(response)

        self.assertEqual(provider["input_tokens"], 120)
        self.assertEqual(provider["output_tokens"], 30)
        self.assertEqual(provider["thoughts_tokens"], 10)
        self.assertEqual(provider["cached_tokens"], 5)
        self.assertEqual(provider["total_tokens"], 160)
        self.assertEqual(langfuse["input"], 120)
        self.assertEqual(langfuse["output"], 30)
        self.assertEqual(langfuse["reasoning"], 10)
        self.assertEqual(langfuse["cache_read_input_tokens"], 5)
        self.assertEqual(langfuse["total"], 160)

    def test_response_metrics_are_preferred(self):
        metrics = extract_langfuse_metrics({
            "answer": "Hello",
            "metrics": {
                "pipeline_latency_ms": 1500,
                "input_tokens": 100,
            },
        })

        self.assertEqual(metrics["pipeline_latency_ms"], 1500)
        self.assertEqual(metrics["input_tokens"], 100)

    def test_observability_summary_uses_instrumented_results(self):
        results = [
            {
                "langfuse_metrics": {
                    "pipeline_latency_ms": 1000,
                    "retrieval_latency_ms": 200,
                    "generation_latency_ms": 800,
                    "input_tokens": 100,
                    "output_tokens": 20,
                    "total_tokens": 120,
                }
            },
            {
                "langfuse_metrics": {
                    "pipeline_latency_ms": 2000,
                    "retrieval_latency_ms": 400,
                    "generation_latency_ms": 1600,
                    "input_tokens": 200,
                    "output_tokens": 40,
                    "total_tokens": 240,
                }
            },
        ]

        summary = build_observability_summary(results)

        self.assertEqual(summary["instrumented_response_count"], 2)
        self.assertEqual(summary["median_pipeline_latency_ms"], 1500)
        self.assertEqual(summary["average_input_tokens"], 150)
        self.assertEqual(summary["total_tokens"], 360)

    def test_failed_quota_result_is_not_considered_complete(self):
        results = [
            {
                "run_number": 1,
                "question_number": 1,
                "success": True,
            },
            {
                "run_number": 1,
                "question_number": 2,
                "success": False,
                "status_code": 429,
            },
        ]

        self.assertEqual(completed_keys(results), {(1, 1)})

    def test_retry_replaces_failed_result_instead_of_duplicating_it(self):
        failed = {
            "run_number": 1,
            "question_number": 2,
            "success": False,
            "status_code": 429,
        }
        successful_retry = {
            "run_number": 1,
            "question_number": 2,
            "success": True,
            "status_code": 200,
        }

        results = replace_result([failed], successful_retry)

        self.assertEqual(results, [successful_retry])
        self.assertEqual(completed_keys(results), {(1, 2)})

    def test_date_template_resumes_most_advanced_compatible_evaluation(self):
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            workbook = root / "questions.xlsx"
            config = SimpleNamespace(
                output_dir=root / "production-YYYY-MM-DD",
                workbook=workbook.resolve(),
                runs=3,
                chat_url="https://example.com/chat",
            )
            older = root / "production-2026-09-05"
            literal = root / "production-YYYY-MM-DD"
            incompatible = root / "production-2026-09-08"
            self.write_evaluation_results(older, workbook, runs=3, completed=18)
            self.write_evaluation_results(literal, workbook, runs=3, completed=3)
            self.write_evaluation_results(incompatible, workbook, runs=2, completed=30)

            resolved = resolve_output_dir(
                config,
                65,
                today=date(2026, 9, 9),
            )

            self.assertEqual(resolved, older)

    def test_date_template_uses_today_when_no_unfinished_evaluation_exists(self):
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            config = SimpleNamespace(
                output_dir=root / "production-YYYY-MM-DD",
                workbook=(root / "questions.xlsx").resolve(),
                runs=3,
                chat_url="https://example.com/chat",
            )

            resolved = resolve_output_dir(
                config,
                65,
                today=date(2026, 9, 9),
            )

            self.assertEqual(resolved, root / "production-2026-09-09")

    def test_date_template_reuses_complete_evaluation_when_it_is_the_only_match(self):
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            workbook = root / "questions.xlsx"
            config = SimpleNamespace(
                output_dir=root / "production-YYYY-MM-DD",
                workbook=workbook.resolve(),
                runs=3,
                chat_url="https://example.com/chat",
            )
            complete = root / "production-2026-09-05"
            self.write_evaluation_results(complete, workbook, runs=3, completed=195)

            resolved = resolve_output_dir(
                config,
                65,
                today=date(2026, 9, 9),
            )

            self.assertEqual(resolved, complete)

    def test_dated_evaluation_wins_over_accidental_literal_placeholder(self):
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            workbook = root / "questions.xlsx"
            config = SimpleNamespace(
                output_dir=root / "production-YYYY-MM-DD",
                workbook=workbook.resolve(),
                runs=3,
                chat_url="https://example.com/chat",
            )
            complete = root / "production-2026-09-05"
            literal = root / "production-YYYY-MM-DD"
            self.write_evaluation_results(complete, workbook, runs=3, completed=195)
            self.write_evaluation_results(literal, workbook, runs=3, completed=3)

            resolved = resolve_output_dir(
                config,
                65,
                today=date(2026, 9, 9),
            )

            self.assertEqual(resolved, complete)

    def test_concrete_output_directory_is_unchanged(self):
        config = SimpleNamespace(output_dir=Path("production-2026-09-05"))

        resolved = resolve_output_dir(config, 65, today=date(2026, 9, 9))

        self.assertEqual(resolved, config.output_dir)

    @staticmethod
    def write_evaluation_results(
        output_dir: Path,
        workbook: Path,
        *,
        runs: int,
        completed: int,
    ) -> None:
        output_dir.mkdir()
        results = [
            {
                "run_number": (index // 65) + 1,
                "question_number": (index % 65) + 1,
                "success": True,
            }
            for index in range(completed)
        ]
        (output_dir / "results.json").write_text(
            json.dumps(
                {
                    "metadata": {
                        "workbook": str(workbook.resolve()),
                        "question_count": 65,
                        "runs": runs,
                        "client_mode": "HTTP https://example.com/chat",
                    },
                    "results": results,
                }
            ),
            encoding="utf-8",
        )
