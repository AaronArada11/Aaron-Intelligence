from types import SimpleNamespace
from unittest import TestCase

from backend.main import _gemini_usage_details
from evaluate import (
    build_observability_summary,
    completed_keys,
    extract_langfuse_metrics,
    replace_result,
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
