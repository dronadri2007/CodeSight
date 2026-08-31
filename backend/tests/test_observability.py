"""Observability: every response carries a request id."""
import pytest
from fastapi.testclient import TestClient


def test_response_has_request_id_header(client):
    r = client.get("/health")
    rid = r.headers.get("x-request-id")
    assert rid and len(rid) >= 8


def test_client_supplied_request_id_is_echoed(client):
    r = client.get("/health", headers={"X-Request-ID": "abc123def456"})
    assert r.headers["x-request-id"] == "abc123def456"


@pytest.fixture
def noraise_client(client):
    client_transport_kwargs = {"raise_server_exceptions": False}
    with TestClient(client.app, **client_transport_kwargs) as c:
        yield c


def test_unhandled_exception_returns_json_envelope(noraise_client):
    # a route that always raises, registered only for this test
    from app.main import app

    @app.get("/_boom")
    def _boom():
        raise RuntimeError("kaboom")

    try:
        r = noraise_client.get("/_boom")
        assert r.status_code == 500
        body = r.json()
        assert body["detail"] == "internal error"
        assert body["request_id"]
        assert r.headers["x-request-id"] == body["request_id"]
    finally:
        app.router.routes = [
            rt for rt in app.router.routes if getattr(rt, "path", None) != "/_boom"
        ]


def test_500_envelope_carries_cors_headers_cross_origin(noraise_client):
    # Starlette renders the 500 envelope outside CORSMiddleware, so the handler
    # stamps the CORS headers itself when the request has an allowed Origin.
    from app.main import app

    @app.get("/_boom_cors")
    def _boom_cors():
        raise RuntimeError("kaboom")

    try:
        r = noraise_client.get(
            "/_boom_cors", headers={"Origin": "http://localhost:5173"}
        )
        assert r.status_code == 500
        assert r.headers["access-control-allow-origin"] == "http://localhost:5173"
        rid = r.headers.get("x-request-id")
        assert rid
        assert r.json() == {"detail": "internal error", "request_id": rid}
    finally:
        app.router.routes = [
            rt for rt in app.router.routes if getattr(rt, "path", None) != "/_boom_cors"
        ]


def test_200_response_exposes_request_id_header_cross_origin(client):
    r = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert r.status_code == 200
    exposed = r.headers.get("access-control-expose-headers", "")
    assert "X-Request-ID" in exposed


def test_startup_emits_config_summary(capsys):
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app):
        pass
    out = capsys.readouterr().out
    assert "startup" in out
    assert "grader_probe" in out
    assert "firebase_probe" in out
