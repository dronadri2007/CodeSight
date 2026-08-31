"""Observability: every response carries a request id."""


def test_response_has_request_id_header(client):
    r = client.get("/health")
    rid = r.headers.get("x-request-id")
    assert rid and len(rid) >= 8


def test_client_supplied_request_id_is_echoed(client):
    r = client.get("/health", headers={"X-Request-ID": "abc123def456"})
    assert r.headers["x-request-id"] == "abc123def456"
