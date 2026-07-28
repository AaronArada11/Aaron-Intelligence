import os

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from backend.gemini_client import get_gemini_client

EMBEDDING_MODEL = "gemini-embedding-001"
RETRIEVAL_MATCH_COUNT = 3
SUPABASE_TIMEOUT_SECONDS = 10


def _build_http_session():
    retry_policy = Retry(
        total=2,
        connect=2,
        read=1,
        status=2,
        backoff_factor=0.2,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"POST"}),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry_policy)
    session = requests.Session()
    session.mount("https://", adapter)
    return session


_http_session = _build_http_session()


def _supabase_rpc(function_name, payload):
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
        )

    response = _http_session.post(
        f"{supabase_url.rstrip('/')}/rest/v1/rpc/{function_name}",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=SUPABASE_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def retrieve(question):
    result = get_gemini_client().models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
    )

    query_embedding = result.embeddings[0].values

    return _supabase_rpc(
        function_name="match_documents",
        payload={
            "query_embedding": query_embedding,
            "match_count": RETRIEVAL_MATCH_COUNT,
        },
    )
