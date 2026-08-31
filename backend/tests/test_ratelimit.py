def test_admin_login_is_rate_limited(client):
    from app.ratelimit import limiter

    limiter.enabled = True
    limiter.reset()
    try:
        codes = [
            client.post("/admin/login", json={"password": "wrong"}).status_code
            for _ in range(7)
        ]
    finally:
        limiter.enabled = False
        limiter.reset()

    assert codes.count(429) >= 1, codes
    assert codes[0] == 401  # first few are normal auth failures


def test_health_is_exempt_from_rate_limit(client):
    from app.ratelimit import limiter

    limiter.enabled = True
    limiter.reset()
    try:
        codes = [client.get("/health").status_code for _ in range(10)]
    finally:
        limiter.enabled = False
        limiter.reset()
    assert set(codes) == {200}
