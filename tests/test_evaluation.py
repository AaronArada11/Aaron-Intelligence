import json
from pathlib import Path

from evaluate import (
    EvaluationConfig,
    ask_with_retries,
    build_fingerprint,
    fingerprint_id,
    load_cases,
    run_evaluation,
)
from evaluations.scoring import score_case


def answered_response(answer, sources=None):
    return {
        "answer": answer,
        "outcome": "answered",
        "sources": sources or [{"id": "S1", "title": "Education", "section": "FEU"}],
    }


def test_canonical_case_ids_are_unique():
    cases = load_cases(Path("evaluations/cases.json").resolve())
    assert len(cases) == 65
    assert len({case["id"] for case in cases}) == 65


def test_deterministic_correct_partial_wrong_scoring():
    case = {
        "expected_outcome": "answered",
        "required_source_alternatives": ["education"],
        "required_fact_groups": [["FEU"], ["software engineering"]],
        "forbidden_patterns": ["invented"],
    }
    assert score_case(
        case,
        answered_response("FEU software engineering"),
        status_code=200,
    ).label == "correct"
    assert score_case(
        case,
        answered_response("FEU"),
        status_code=200,
    ).label == "partial"
    assert score_case(
        case,
        answered_response("invented FEU software engineering"),
        status_code=200,
    ).label == "wrong"
    assert score_case(case, {}, status_code=503).label == "wrong"


def test_unknown_requires_exact_outcome_and_no_sources():
    case = {
        "expected_outcome": "unknown",
        "required_source_alternatives": [],
        "required_fact_groups": [],
        "forbidden_patterns": [],
    }
    passed = score_case(
        case,
        {"answer": "Not available", "outcome": "unknown", "sources": []},
        status_code=200,
    )
    failed = score_case(
        case,
        {"answer": "Not available", "outcome": "unknown", "sources": [{"id": "S1"}]},
        status_code=200,
    )
    assert passed.label == "correct"
    assert failed.label == "wrong"


def test_fingerprint_changes_with_retry_configuration(tmp_path):
    cases = tmp_path / "cases.json"
    cases.write_text(json.dumps([{"id": "Q"}]), encoding="utf-8")
    base = EvaluationConfig(cases, tmp_path, None, 1, 20, 0, 2, "", None, True)
    changed = EvaluationConfig(cases, tmp_path, None, 1, 20, 0, 1, "", None, True)
    assert fingerprint_id(build_fingerprint(base)) != fingerprint_id(build_fingerprint(changed))


def test_retry_sleep_is_separate_from_request_and_provider_time(monkeypatch, tmp_path):
    class Client:
        calls = 0

        def ask(self, question):
            self.calls += 1
            if self.calls == 1:
                return 503, {"detail": "temporary"}, {}, 12.0
            return 200, {
                "answer": "Not available",
                "outcome": "unknown",
                "sources": [],
                "diagnostics": {
                    "provider_time_ms": {"embedding": 10.0, "generation": 20.0},
                    "timings_ms": {"total_service": 35.0},
                },
            }, {}, 40.0

    monkeypatch.setattr("evaluate.time.sleep", lambda _: None)
    config = EvaluationConfig(tmp_path, tmp_path, None, 1, 20, 0, 2, "", None, False)
    result = ask_with_retries(
        Client(),
        {
            "id": "Q",
            "group": "Unknown",
            "category": "unknown",
            "question": "Unknown?",
            "expected_outcome": "unknown",
            "required_source_alternatives": [],
            "required_fact_groups": [],
            "forbidden_patterns": [],
        },
        run_number=1,
        config=config,
    )
    assert result["retry_sleep_ms"] == 2000
    assert result["request_time_ms"] == 52
    assert result["provider_latency_ms"] == 30
    assert result["service_latency_ms"] == 35


def test_evaluation_stops_on_exhausted_rate_limit_and_can_resume_case(
    monkeypatch,
    tmp_path,
):
    class Client:
        calls = 0

        @property
        def mode(self):
            return "test"

        def ask(self, question):
            self.calls += 1
            if self.calls == 1:
                return 200, answered_response("Aaron"), {}, 10.0
            return 429, {"detail": "rate limited"}, {"Retry-After": "60"}, 5.0

    client = Client()
    monkeypatch.setattr("evaluate.choose_client", lambda _: client)
    monkeypatch.setattr("evaluate.time.sleep", lambda _: None)
    config = EvaluationConfig(
        Path("evaluations/cases.json").resolve(),
        tmp_path,
        None,
        1,
        20,
        0,
        2,
        "",
        None,
        False,
    )

    run_dir, summary = run_evaluation(config)
    stored_results = json.loads((run_dir / "results.json").read_text(encoding="utf-8"))
    interruptions = json.loads(
        (run_dir / "interruptions.json").read_text(encoding="utf-8")
    )

    assert summary["stopped_early"] is True
    assert summary["stop_reason"] == "rate_limited"
    assert summary["stopped_at_completion_key"] == "Q002:1"
    assert summary["retry_after"] == "60"
    assert summary["completed_attempts"] == 1
    assert [row["completion_key"] for row in stored_results["results"]] == ["Q001:1"]
    assert interruptions["interruptions"][0]["result"]["completion_key"] == "Q002:1"
    assert client.calls == 4
