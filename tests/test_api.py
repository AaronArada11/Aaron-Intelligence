from fastapi.testclient import TestClient

from backend.chat_service import get_chat_service
from backend.main import app
from backend.rag_models import ChatResult, PublicSource
from backend.resilience import ProviderQuotaError, ProviderUnavailableError


class FakeService:
    def answer(self, message, *, request_id, evaluation_mode=False):
        return ChatResult(
            answer=f"Answer: {message}",
            outcome="answered",
            request_id=request_id,
            sources=[PublicSource(id="S1", title="Education", section="FEU Tech")],
            diagnostics={"trace_id": request_id},
        )


def test_chat_contract_and_validation(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CHAT_RATE_LIMIT_ENABLED", "false")
    app.dependency_overrides[get_chat_service] = lambda: FakeService()
    client = TestClient(app)
    response = client.post("/chat", json={"message": "  Where does Aaron study?  "})
    assert response.status_code == 200
    body = response.json()
    assert body["answer"]
    assert body["outcome"] == "answered"
    assert body["request_id"]
    assert body["sources"] == [{"id": "S1", "title": "Education", "section": "FEU Tech"}]
    assert "diagnostics" not in body
    assert client.post("/chat", json={"message": "   "}).status_code == 422
    assert client.post("/chat", json={"message": "x" * 1001}).status_code == 422
    app.dependency_overrides.clear()


def test_evaluation_token_enables_diagnostics(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CHAT_RATE_LIMIT_ENABLED", "true")
    monkeypatch.setenv("EVAL_DIAGNOSTICS_TOKEN", "secret")
    app.dependency_overrides[get_chat_service] = lambda: FakeService()
    response = TestClient(app).post(
        "/chat",
        json={"message": "Question"},
        headers={"X-Evaluation-Token": "secret"},
    )
    assert response.status_code == 200
    assert response.json()["diagnostics"]["trace_id"]
    app.dependency_overrides.clear()


def test_provider_failures_are_sanitized(monkeypatch):
    monkeypatch.setenv("CHAT_RATE_LIMIT_ENABLED", "false")

    class FailingService:
        def __init__(self, error):
            self.error = error

        def answer(self, *args, **kwargs):
            raise self.error

    client = TestClient(app)
    app.dependency_overrides[get_chat_service] = lambda: FailingService(
        ProviderQuotaError("raw secret")
    )
    quota = client.post("/chat", json={"message": "Question"})
    assert quota.status_code == 429
    assert quota.headers["retry-after"] == "2"
    assert "raw secret" not in quota.text

    app.dependency_overrides[get_chat_service] = lambda: FailingService(
        ProviderUnavailableError("raw secret")
    )
    unavailable = client.post("/chat", json={"message": "Question"})
    assert unavailable.status_code == 503
    assert unavailable.headers["retry-after"] == "2"
    assert "raw secret" not in unavailable.text
    app.dependency_overrides.clear()

