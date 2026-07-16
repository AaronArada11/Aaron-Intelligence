from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class CalibrationResult:
    threshold: float
    in_scope_source_recall: float
    out_of_scope_rejected: int
    out_of_scope_total: int
    v2_eligible: bool


def calibrate_evidence_threshold(
    records: list[dict[str, Any]],
    *,
    minimum_source_recall: float = 0.90,
    required_out_of_scope: int = 10,
) -> CalibrationResult:
    out_of_scope = [row for row in records if row.get("expected_outcome") == "out_of_scope"]
    in_scope = [row for row in records if row.get("expected_outcome") == "answered"]
    if len(out_of_scope) != required_out_of_scope:
        raise ValueError(
            f"Calibration requires {required_out_of_scope} out-of-scope cases; "
            f"received {len(out_of_scope)}"
        )
    if not in_scope:
        raise ValueError("Calibration requires at least one in-scope case")

    scores = {
        float(candidate.get("vector_similarity") or 0.0)
        for row in records
        for candidate in row.get("candidates", [])
    }
    thresholds = sorted({0.0, 1.0, *scores, *(min(1.0, score + 1e-9) for score in scores)})

    best: CalibrationResult | None = None
    for threshold in thresholds:
        rejected = sum(
            all(
                float(candidate.get("vector_similarity") or 0.0) < threshold
                for candidate in row.get("candidates", [])
            )
            for row in out_of_scope
        )
        if rejected != len(out_of_scope):
            continue

        recalled = 0
        for row in in_scope:
            alternatives = {
                str(value).casefold()
                for value in row.get("required_source_alternatives", [])
            }
            if any(
                float(candidate.get("vector_similarity") or 0.0) >= threshold
                and (
                    not alternatives
                    or str(candidate.get("source") or "").casefold() in alternatives
                    or str(candidate.get("title") or "").casefold() in alternatives
                )
                for candidate in row.get("candidates", [])
            ):
                recalled += 1
        recall = recalled / len(in_scope)
        result = CalibrationResult(
            threshold=threshold,
            in_scope_source_recall=recall,
            out_of_scope_rejected=rejected,
            out_of_scope_total=len(out_of_scope),
            v2_eligible=recall >= minimum_source_recall,
        )
        if best is None or (result.in_scope_source_recall, -result.threshold) > (
            best.in_scope_source_recall,
            -best.threshold,
        ):
            best = result

    if best is None:
        return CalibrationResult(
            threshold=1.0,
            in_scope_source_recall=0.0,
            out_of_scope_rejected=0,
            out_of_scope_total=len(out_of_scope),
            v2_eligible=False,
        )
    return best
