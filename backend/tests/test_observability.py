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
