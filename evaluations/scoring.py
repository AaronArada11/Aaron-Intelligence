from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Literal


ScoreLabel = Literal["correct", "partial", "wrong"]


@dataclass(frozen=True, slots=True)
class ScoreResult:
    label: ScoreLabel
    value: float
    outcome_pass: bool
    source_pass: bool
    fact_groups_passed: int
    fact_groups_total: int
    forbidden_match: str | None = None


def score_case(
    case: dict[str, Any],
    response: dict[str, Any],
    *,
    status_code: int | None,
) -> ScoreResult:
    if status_code is None or not 200 <= status_code < 300:
        return _wrong()

    expected_outcome = str(case.get("expected_outcome") or "")
    actual_outcome = str(response.get("outcome") or "")
    outcome_pass = actual_outcome == expected_outcome
    answer = str(response.get("answer") or "")

    for pattern in case.get("forbidden_patterns", []):
        if re.search(str(pattern), answer, flags=re.IGNORECASE):
            return ScoreResult(
                label="wrong",
                value=0.0,
                outcome_pass=outcome_pass,
                source_pass=False,
                fact_groups_passed=0,
                fact_groups_total=len(case.get("required_fact_groups", [])),
                forbidden_match=str(pattern),
            )

    sources = response.get("sources") or []
    if expected_outcome in {"out_of_scope", "unknown"}:
        passed = outcome_pass and not sources
        return ScoreResult(
            label="correct" if passed else "wrong",
            value=1.0 if passed else 0.0,
            outcome_pass=outcome_pass,
            source_pass=not sources,
            fact_groups_passed=0,
            fact_groups_total=0,
        )

    alternatives = [
        str(value).casefold()
        for value in case.get("required_source_alternatives", [])
    ]
    source_text = " ".join(
        f"{source.get('title', '')} {source.get('section', '')}".casefold()
        for source in sources
        if isinstance(source, dict)
    )
    source_pass = not alternatives or any(
        alternative in source_text for alternative in alternatives
    )
    fact_groups = case.get("required_fact_groups", [])
    groups_passed = sum(
        any(re.search(str(pattern), answer, flags=re.IGNORECASE) for pattern in group)
        for group in fact_groups
    )
    fact_ratio = groups_passed / len(fact_groups) if fact_groups else 1.0

    if outcome_pass and source_pass and fact_ratio == 1.0:
        label: ScoreLabel = "correct"
        value = 1.0
    elif outcome_pass and fact_ratio >= 0.5:
        label = "partial"
        value = 0.5
    else:
        label = "wrong"
        value = 0.0

    return ScoreResult(
        label=label,
        value=value,
        outcome_pass=outcome_pass,
        source_pass=source_pass,
        fact_groups_passed=groups_passed,
        fact_groups_total=len(fact_groups),
    )


def _wrong() -> ScoreResult:
    return ScoreResult(
        label="wrong",
        value=0.0,
        outcome_pass=False,
        source_pass=False,
        fact_groups_passed=0,
        fact_groups_total=0,
    )
