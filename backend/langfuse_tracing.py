import os
from contextlib import nullcontext

try:
    from langfuse import Langfuse
except ImportError:
    Langfuse = None


DEFAULT_LANGFUSE_BASE_URL = "https://jp.cloud.langfuse.com"

_client = None


def get_runtime_environment():
    return (
        os.getenv("VERCEL_ENV")
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

    if Langfuse is None or not _has_langfuse_credentials():
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
        )

    return _client


def start_observation(**kwargs):
    client = get_langfuse_client()
    if client is None:
        return nullcontext(None)

    try:
        return client.start_as_current_observation(**kwargs)
    except Exception:
        return nullcontext(None)


def safe_update(observation, **kwargs):
    if observation is None:
        return

    try:
        observation.update(**kwargs)
    except Exception:
        pass


def flush_langfuse():
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.flush()
    except Exception:
        pass
