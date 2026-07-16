from backend.calibration import calibrate_evidence_threshold


def test_threshold_rejects_all_scope_cases_and_maximizes_recall():
    records = []
    for _ in range(10):
        records.append(
            {
                "expected_outcome": "out_of_scope",
                "required_source_alternatives": [],
                "candidates": [{"source": "noise", "vector_similarity": 0.2}],
            }
        )
    for index in range(10):
        records.append(
            {
                "expected_outcome": "answered",
                "required_source_alternatives": ["education"],
                "candidates": [
                    {
                        "source": "education",
                        "vector_similarity": 0.8 if index < 9 else 0.1,
                    }
                ],
            }
        )
    result = calibrate_evidence_threshold(records)
    assert result.out_of_scope_rejected == 10
    assert result.in_scope_source_recall == 0.9
    assert result.v2_eligible

