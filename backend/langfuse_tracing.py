import logging
import os
from contextlib import nullcontext

try:
    from langfuse import Langfuse
except ImportError:
    Langfuse = None


DEFAULT_LANGFUSE_BASE_URL = "https://jp.cloud.langfuse.com"

_client = None
logger = logging.getLogger(__name__)


def _env_bool(name, default):
    value = os.getenv(name)
    if value in (None, ""):
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_float(name, default):
    value = os.getenv(name)
    if value in (None, ""):
        return default
    try:
        return float(value)
    except ValueError:
        logger.warning("Ignoring invalid %s value.", name)
        return default


def get_runtime_environment():
    return (
        os.getenv("LANGFUSE_TRACING_ENVIRONMENT")
        or os.getenv("VERCEL_ENV")
        or os.getenv("APP_ENV")
        or os.getenv("ENVIRONMENT")
        or "local"
    )


def _has_langfuse_credentials():
    return bool(
        os.getenv("LANGFUSE_PUBLIC_KEY")
        and os.getenv("LANGFUSE_SECRET_KEY")
    )


def get_langfuse_client():
    global _client

    if (
        Langfuse is None
        or not _env_bool("LANGFUSE_TRACING_ENABLED", True)
        or not _has_langfuse_credentials()
    ):
        return None

    if _client is None:
        _client = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            base_url=os.getenv(
                "LANGFUSE_BASE_URL",
                DEFAULT_LANGFUSE_BASE_URL,
            ),
            environment=get_runtime_environment(),
            release=(
                os.getenv("LANGFUSE_RELEASE")
                or os.getenv("VERCEL_GIT_COMMIT_SHA")
            ),
            sample_rate=_env_float("LANGFUSE_SAMPLE_RATE", 1.0),
            debug=_env_bool("LANGFUSE_DEBUG", False),
        )

    return _client


def start_observation(**kwargs):
    client = get_langfuse_client()
    if client is None:
        return nullcontext(None)

    try:
        return client.start_as_current_observation(**kwargs)
    except Exception:
        logger.exception("Unable to start Langfuse observation.")
        return nullcontext(None)


def get_current_trace_id():
    client = get_langfuse_client()
    if client is None:
        return None

    try:
        return client.get_current_trace_id()
    except Exception:
        logger.exception("Unable to read the current Langfuse trace ID.")
        return None


def safe_update(observation, **kwargs):
    if observation is None:
        return

    try:
        observation.update(**kwargs)
    except Exception:
        logger.exception("Unable to update Langfuse observation.")


def safe_end(observation):
    if observation is None:
        return

    try:
        observation.end()
    except Exception:
        logger.exception("Unable to end Langfuse observation.")


def flush_langfuse():
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.flush()
    except Exception:
        logger.exception("Unable to flush Langfuse events.")
