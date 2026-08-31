def test_admin_login_is_rate_limited(client):
    from app.ratelimit import limiter

    limiter.enabled = True
    limiter.reset()
    try:
        resps = [
            client.post("/admin/login", json={"password": "wrong"})
            for _ in range(7)
        ]
    finally:
        limiter.enabled = False
        limiter.reset()

    codes = [r.status_code for r in resps]
    assert codes.count(429) >= 1, codes
    assert codes[0] == 401  # first few are normal auth failures

    first_429 = next(r for r in resps if r.status_code == 429)
    assert first_429.json() == {"detail": "rate limit exceeded"}


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


def test_global_default_limit_body(client):
    """A route with neither @limiter.exempt nor an explicit @limiter.limit is
    covered by the 200/minute default enforced by SlowAPIMiddleware. That path
    runs through sync_check_limits, which only uses our handler if it is sync —
    this proves the 429 body is {"detail": "rate limit exceeded"} there too."""
    from app.ratelimit import limiter

    limiter.enabled = True
    limiter.reset()
    try:
        resp_429 = None
        for _ in range(210):
            r = client.get("/concepts")
            if r.status_code == 429:
                resp_429 = r
                break
    finally:
        limiter.enabled = False
        limiter.reset()

    assert resp_429 is not None, "global default limit never tripped"
    assert resp_429.json() == {"detail": "rate limit exceeded"}
