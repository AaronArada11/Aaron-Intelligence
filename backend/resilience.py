from __future__ import annotations

import random
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from dataclasses import dataclass
from typing import Callable, Generic, TypeVar


T = TypeVar("T")

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
TRANSIENT_ERROR_TERMS = (
    "resource_exhausted",
    "service unavailable",
    "temporarily unavailable",
    "deadline exceeded",
    "internal server error",
    "connection reset",
    "connection aborted",
    "rate limit",
    "too many requests",
    "quota",
)

_PROVIDER_EXECUTOR = ThreadPoolExecutor(
    max_workers=8,
    thread_name_prefix="provider-stage",
)


class ProviderError(RuntimeError):
    """Base class for sanitized provider failures."""


class ProviderQuotaError(ProviderError):
    pass


class ProviderUnavailableError(ProviderError):
    pass


class ProviderDeadlineError(ProviderUnavailableError):
    pass


@dataclass(frozen=True, slots=True)
class RetryStats:
    attempts: int
    retries: int
    provider_time_ms: float
    retry_sleep_ms: float


@dataclass(frozen=True, slots=True)
class RetryResult(Generic[T]):
    value: T
    stats: RetryStats


def status_code_from_error(exc: BaseException) -> int | None:
    for attribute in ("status_code", "code"):
        value = getattr(exc, attribute, None)
        if isinstance(value, int):
            return value
        try:
            if value is not None and str(value).isdigit():
                return int(value)
        except (TypeError, ValueError):
            pass
    return None


def is_quota_error(exc: BaseException) -> bool:
    status_code = status_code_from_error(exc)
    message = str(exc).casefold()
    return status_code == 429 or any(
        term in message
        for term in ("resource_exhausted", "quota", "rate limit", "too many requests")
    )


def is_transient_provider_error(exc: BaseException) -> bool:
    status_code = status_code_from_error(exc)
    if status_code in RETRYABLE_STATUS_CODES:
        return True
    message = str(exc).casefold()
    return any(term in message for term in TRANSIENT_ERROR_TERMS)


def full_jitter_delay(
    retry_number: int,
    *,
    base_seconds: float = 0.5,
    cap_seconds: float = 2.0,
    random_fn: Callable[[float, float], float] = random.uniform,
) -> float:
    ceiling = min(cap_seconds, base_seconds * (2 ** max(0, retry_number - 1)))
    return random_fn(0.0, ceiling)


def run_with_retry(
    operation: Callable[[], T],
    *,
    stage: str,
    max_attempts: int = 3,
    deadline_seconds: float = 10.0,
    base_seconds: float = 0.5,
    cap_seconds: float = 2.0,
    sleep_fn: Callable[[float], None] = time.sleep,
    monotonic_fn: Callable[[], float] = time.monotonic,
    random_fn: Callable[[float, float], float] = random.uniform,
) -> RetryResult[T]:
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least one")
    if deadline_seconds <= 0:
        raise ValueError("deadline_seconds must be positive")

    started = monotonic_fn()
    provider_seconds = 0.0
    sleep_seconds = 0.0
    last_error: BaseException | None = None

    for attempt in range(1, max_attempts + 1):
        remaining = deadline_seconds - (monotonic_fn() - started)
        if remaining <= 0:
            raise ProviderDeadlineError(f"{stage} deadline exhausted") from last_error

        call_started = monotonic_fn()
        future = _PROVIDER_EXECUTOR.submit(operation)
        try:
            value = future.result(timeout=remaining)
            provider_seconds += monotonic_fn() - call_started
            return RetryResult(
                value=value,
                stats=RetryStats(
                    attempts=attempt,
                    retries=attempt - 1,
                    provider_time_ms=round(provider_seconds * 1000, 3),
                    retry_sleep_ms=round(sleep_seconds * 1000, 3),
                ),
            )
        except FutureTimeoutError as exc:
            future.cancel()
            provider_seconds += monotonic_fn() - call_started
            raise ProviderDeadlineError(f"{stage} deadline exhausted") from exc
        except BaseException as exc:  # provider SDKs do not share one exception base
            provider_seconds += monotonic_fn() - call_started
            last_error = exc
            if not is_transient_provider_error(exc) or attempt >= max_attempts:
                if is_quota_error(exc):
                    raise ProviderQuotaError(f"{stage} quota exhausted") from exc
                if is_transient_provider_error(exc):
                    raise ProviderUnavailableError(f"{stage} temporarily unavailable") from exc
                raise

            delay = full_jitter_delay(
                attempt,
                base_seconds=base_seconds,
                cap_seconds=cap_seconds,
                random_fn=random_fn,
            )
            remaining = deadline_seconds - (monotonic_fn() - started)
            if delay >= remaining:
                raise ProviderDeadlineError(f"{stage} deadline exhausted") from exc
            sleep_fn(delay)
            sleep_seconds += delay

    raise ProviderUnavailableError(f"{stage} temporarily unavailable") from last_error
