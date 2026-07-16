import time

import pytest

from backend.resilience import (
    ProviderDeadlineError,
    ProviderQuotaError,
    ProviderUnavailableError,
    full_jitter_delay,
    is_quota_error,
    is_transient_provider_error,
    run_with_retry,
)


class ProviderFailure(Exception):
    def __init__(self, status_code, message="provider failure"):
        super().__init__(message)
        self.status_code = status_code


@pytest.mark.parametrize("status", [429, 500, 502, 503, 504])
def test_transient_statuses_are_recognized(status):
    assert is_transient_provider_error(ProviderFailure(status))


def test_quota_classification():
    assert is_quota_error(ProviderFailure(429, "RESOURCE_EXHAUSTED"))


def test_full_jitter_is_bounded():
    assert full_jitter_delay(3, random_fn=lambda low, high: high) == 2.0


def test_retry_is_bounded_and_records_sleep():
    calls = []

    def operation():
        calls.append(1)
        if len(calls) < 3:
            raise ProviderFailure(503)
        return "ok"

    result = run_with_retry(
        operation,
        stage="test",
        sleep_fn=lambda _: None,
        random_fn=lambda _low, high: high,
    )
    assert result.value == "ok"
    assert result.stats.attempts == 3
    assert result.stats.retries == 2
    assert result.stats.retry_sleep_ms == 1500


def test_exhausted_quota_is_sanitized():
    with pytest.raises(ProviderQuotaError, match="quota exhausted"):
        run_with_retry(
            lambda: (_ for _ in ()).throw(ProviderFailure(429, "secret quota detail")),
            stage="embedding",
            sleep_fn=lambda _: None,
            random_fn=lambda *_: 0,
        )


def test_exhausted_temporary_failure_is_sanitized():
    with pytest.raises(ProviderUnavailableError, match="temporarily unavailable"):
        run_with_retry(
            lambda: (_ for _ in ()).throw(ProviderFailure(503, "raw provider detail")),
            stage="generation",
            sleep_fn=lambda _: None,
            random_fn=lambda *_: 0,
        )


def test_stage_deadline_is_enforced():
    with pytest.raises(ProviderDeadlineError):
        run_with_retry(
            lambda: time.sleep(0.05),
            stage="slow",
            deadline_seconds=0.01,
        )

