# Backend Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the CodeSight FastAPI backend across robustness, performance, security, and observability without changing any grading/domain logic.

**Architecture:** Additive polish on `backend/app/`. Two new deps (`slowapi`, `structlog`) and two new small modules (`app/logging.py`, `app/ratelimit.py`); everything else is edits to `app/main.py`, `app/exercises.py`, `app/config.py`, `app/firebaseauth.py`. `GET /exercises` gains `limit`/`offset` and returns an envelope — the one contract change, which pulls in a matching frontend paging rework in `frontend/src/api/` + the two Pro problem-list pages.

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy 2, Pydantic 2, pytest + `fastapi.testclient`; frontend React 19 + Vite + TypeScript.

**Spec:** `docs/superpowers/specs/2026-08-31-backend-polish-design.md`

## Global Constraints

- **Branch:** `feat/backend-polish`. Tasks 1–10 (backend) run against `main` as it is now. **Before Task 11**, the human merges `feat/onboarding-flow` → `main` and this branch is rebased onto it; Tasks 11–14 (frontend) run against the rebased tree — target the onboarding-branch versions of `ProProblems.tsx` / `ProblemListHome.tsx`, not the versions visible now.
- **Only two new dependencies**, both in `backend/requirements.txt`: `slowapi>=0.1.9`, `structlog>=24.1`. No others.
- **No Alembic / migrations.** Table creation stays `app/db.py:init_db()` / `create_all` + the `_ensure_columns()` shim.
- **Do not touch** grading, localisation, hints, integrity, concepts, topics, tiers, ai_review *logic*. Logging-statement swaps in those files (Task 10) are the only allowed edits there.
- **Backend tests:** from `backend/`, run `.venv/Scripts/python.exe -m pytest -q`. Baseline is **183 passed, 10 skipped**. The passing count may rise; it must never fall.
- **Frontend checks:** from `frontend/`, `npx tsc --noEmit` (clean) and `npx vite build` (`✓ built`).
- **Frontend palette / motion are locked:** do not edit `frontend/src/components/FullscreenPixelHero.tsx`; do not introduce colors outside `#000000 / #1A130D / #3A2F1D / #E5DFC9` (+ gold `#E3A24A`, Pro-tier only). `text-2xs` / `text-3xs` are intentional no-op classes — leave them.
- **Commits:** prefix every git command with `git -c gc.auto=0`. Every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
  ```
- **structlog logger handle:** every backend module that logs uses `log = structlog.get_logger(__name__)` (or `"codesight"` in `main.py`). Call sites use kwargs, not %-formatting: `log.info("event_name", key=value)`.

---

## File Structure

**New files:**
- `backend/app/logging.py` — `configure_logging()`: structlog + stdlib bridge, JSON renderer in prod / console in dev.
- `backend/app/ratelimit.py` — the shared `slowapi` `Limiter` instance.

**Modified — backend:**
- `backend/requirements.txt` — add the two deps.
- `backend/app/main.py` — logging init, request-ID middleware, global exception handler, lifespan startup summary + probe, slowapi wiring, `/admin/login` limit, `/health` exempt, `/debug` gated, `/exercises` pagination handler + envelope, `/grade` background write, `source`/`status` 422s.
- `backend/app/exercises.py` — `source` validation, memoized summary builder, `list_summaries` returns `(list, total)` with `limit`/`offset`.
- `backend/app/schemas.py` — new `ExerciseList` model.
- `backend/app/config.py` — anchor `ALLOWED_ORIGIN_REGEX` default.
- `backend/app/firebaseauth.py` — `status()` helper; logger swap.
- `backend/app/admin.py` — `status` filter validation; logger swap if it logs.
- `backend/app/grader.py`, `app/ai_review.py`, `app/adminstore.py`, `app/db.py` — logger swap only (Task 10).
- `backend/app/config.py` — (see above).
- `backend/CONTRACT.md` — document the `/exercises` envelope + params (Task 8).
- `backend/tests/conftest.py` — autouse fixture disabling the rate limiter.
- `backend/tests/test_api.py` — update `/exercises` bare-list assertions to the envelope; `/debug` test gets admin headers; new tests per task.

**Modified — frontend (Tasks 11–14, post-rebase):**
- `frontend/src/api/types.ts` — `ExerciseListResponse`.
- `frontend/src/api/exercises.ts` — `listExerciseSummaries` returns the envelope; mock path synthesizes it.
- `frontend/src/api/index.ts` — re-export unchanged (verify).
- `frontend/src/pages/pro/ProProblems.tsx` — server paging.
- `frontend/src/pages/ProblemListHome.tsx` — server paging for the AI-engineer half.

---

## Task 1: structlog config + dependencies

**Files:**
- Create: `backend/app/logging.py`
- Modify: `backend/requirements.txt`, `backend/app/main.py`
- Test: `backend/tests/test_logging.py`

**Interfaces:**
- Produces: `app.logging.configure_logging() -> None` (idempotent); after it runs, `structlog.get_logger(name)` yields a stdlib-backed `BoundLogger` that renders one line per call to stdout.

- [ ] **Step 1: Add dependencies**

In `backend/requirements.txt`, add two lines (keep the file's existing ordering style — one requirement per line):
```
slowapi>=0.1.9
structlog>=24.1
```

- [ ] **Step 2: Install into the venv**

Run: `.venv/Scripts/python.exe -m pip install "slowapi>=0.1.9" "structlog>=24.1"`
Expected: both install with no errors.

- [ ] **Step 3: Write the failing test**

Create `backend/tests/test_logging.py`:
```python
import logging
import structlog
from app.logging import configure_logging


def test_configure_logging_is_idempotent_and_binds_stdlib():
    configure_logging()
    configure_logging()  # second call must not raise or double-add handlers
    root = logging.getLogger()
    assert len(root.handlers) == 1

    log = structlog.get_logger("codesight.test")
    # a structlog call with kwargs must not raise
    log.info("smoke", answer=42)


def test_stdlib_logging_flows_through_structlog(capsys):
    configure_logging()
    logging.getLogger("some.legacy.module").warning("legacy line")
    out = capsys.readouterr().out
    assert "legacy line" in out
```

- [ ] **Step 4: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_logging.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'app.logging'`.

- [ ] **Step 5: Implement `app/logging.py`**

Create `backend/app/logging.py`:
```python
"""structlog configuration.

JSON lines in production (Railway / Postgres), coloured console in dev
(SQLite). Standard-library logging (uvicorn, sqlalchemy) is routed through
the same formatter so there is one stream.
"""
import logging
import sys

import structlog

from app.config import DB_IS_SQLITE

_CONFIGURED = False


def configure_logging() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)
    pre_chain = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        timestamper,
        structlog.stdlib.ExtraAdder(),
    ]
    renderer = (
        structlog.dev.ConsoleRenderer(colors=False)
        if DB_IS_SQLITE
        else structlog.processors.JSONRenderer()
    )
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=pre_chain,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)

    structlog.configure(
        processors=[
            *pre_chain,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    _CONFIGURED = True
```

- [ ] **Step 6: Wire it into `main.py` and swap the module logger**

In `backend/app/main.py`:
- add `import structlog` near the top imports;
- replace
  ```python
  logging.basicConfig(level=logging.INFO)
  log = logging.getLogger("codesight")
  ```
  with
  ```python
  from app.logging import configure_logging

  configure_logging()
  log = structlog.get_logger("codesight")
  ```
- leave the `import logging` line (still used for levels elsewhere) — or drop it if nothing else references `logging` in the file after this task.
- In the `lifespan` function, rewrite the two existing calls to kwargs style:
  ```python
  if DB_IS_SQLITE:
      log.warning("sqlite_fallback", detail="DATABASE_URL unset — local SQLite file (dev only)")
  log.info("grader_model", model=GRADER_MODEL)
  ```
  (Task 4 replaces this block wholesale — this keeps it green in between.)

- [ ] **Step 7: Run the new test + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_logging.py -v`
Expected: PASS (both tests).

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: **183 passed, 10 skipped** (or more passed), 0 failed.

- [ ] **Step 8: Commit**

```bash
git -c gc.auto=0 add backend/requirements.txt backend/app/logging.py backend/app/main.py backend/tests/test_logging.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): structlog logging config + stdlib bridge

Adds slowapi + structlog deps. app/logging.py configures a JSON renderer
in prod / console in dev and routes stdlib logging through it. main.py
now uses structlog.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 2: Request-ID middleware + one log line per request

**Files:**
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_observability.py`

**Interfaces:**
- Consumes: `configure_logging()` / `log` from Task 1.
- Produces: every HTTP response carries an `X-Request-ID` header; `request.state.request_id: str` is set for the duration of each request; exactly one `log.info("request", ...)` line per completed response.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_observability.py`:
```python
def test_response_has_request_id_header(client):
    r = client.get("/health")
    rid = r.headers.get("x-request-id")
    assert rid and len(rid) >= 8


def test_client_supplied_request_id_is_echoed(client):
    r = client.get("/health", headers={"X-Request-ID": "abc123def456"})
    assert r.headers["x-request-id"] == "abc123def456"
```

- [ ] **Step 2: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_observability.py -v`
Expected: FAIL — `assert None` / `KeyError: 'x-request-id'`.

- [ ] **Step 3: Add the middleware to `main.py`**

Add these imports near the top of `backend/app/main.py`:
```python
import time
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse
```
Immediately after `app = FastAPI(title="CodeSight API", lifespan=lifespan)` and the `add_middleware(CORSMiddleware, ...)` block, add:
```python
@app.middleware("http")
async def request_context(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    request.state.request_id = rid
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=rid)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        dur_ms = round((time.perf_counter() - start) * 1000, 1)
        log.exception(
            "request_error",
            method=request.method,
            path=request.url.path,
            duration_ms=dur_ms,
        )
        raise
    dur_ms = round((time.perf_counter() - start) * 1000, 1)
    log.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=dur_ms,
    )
    response.headers["X-Request-ID"] = rid
    return response
```

- [ ] **Step 4: Run the new test + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_observability.py -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 185+ passed, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c gc.auto=0 add backend/app/main.py backend/tests/test_observability.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): request-id middleware + per-request log line

Every response carries X-Request-ID (client value echoed if supplied);
one structured "request" line per response with method/path/status/ms.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 3: Global unhandled-exception handler

**Files:**
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_observability.py`

**Interfaces:**
- Consumes: `request.state.request_id` from Task 2; `JSONResponse` import from Task 2.
- Produces: any uncaught non-`HTTPException` error → `500` with body `{"detail": "internal error", "request_id": "<rid>"}` and an `X-Request-ID` header; `HTTPException` / `RequestValidationError` keep FastAPI defaults.

- [ ] **Step 1: Write the failing test**

Append to `backend/tests/test_observability.py`:
```python
def test_unhandled_exception_returns_json_envelope(client):
    # a route that always raises, registered only for this test
    from app.main import app

    @app.get("/_boom")
    def _boom():
        raise RuntimeError("kaboom")

    try:
        r = client.get("/_boom")
        assert r.status_code == 500
        body = r.json()
        assert body["detail"] == "internal error"
        assert body["request_id"]
        assert r.headers["x-request-id"] == body["request_id"]
    finally:
        app.router.routes = [
            rt for rt in app.router.routes if getattr(rt, "path", None) != "/_boom"
        ]
```

Note: `TestClient` re-raises server exceptions by default. Instantiate the client for this test with `raise_server_exceptions=False` — add this fixture to `tests/test_observability.py`:
```python
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def noraise_client(client):
    client_transport_kwargs = {"raise_server_exceptions": False}
    with TestClient(client.app, **client_transport_kwargs) as c:
        yield c
```
and use `noraise_client` instead of `client` in `test_unhandled_exception_returns_json_envelope`.

- [ ] **Step 2: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_observability.py::test_unhandled_exception_returns_json_envelope -v`
Expected: FAIL — response is FastAPI's default HTML/plain 500, `r.json()` raises or `detail` mismatches.

- [ ] **Step 3: Register the handler in `main.py`**

After the `request_context` middleware in `backend/app/main.py`:
```python
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    rid = getattr(request.state, "request_id", None) or request.headers.get("x-request-id", "")
    log.exception("unhandled_error", request_id=rid, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "internal error", "request_id": rid},
        headers={"X-Request-ID": rid},
    )
```
`HTTPException` and `RequestValidationError` are dispatched by their own handlers before this one, so they are unaffected.

- [ ] **Step 4: Run the new test + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_observability.py -v`
Expected: PASS (all).

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 186+ passed, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c gc.auto=0 add backend/app/main.py backend/tests/test_observability.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): JSON envelope for unhandled errors

Uncaught non-HTTPException errors return 500
{"detail":"internal error","request_id":...} + X-Request-ID, logged with
a traceback. HTTPException / validation errors keep FastAPI defaults.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 4: Startup config summary + non-fatal integration probe

**Files:**
- Modify: `backend/app/main.py`, `backend/app/firebaseauth.py`
- Test: `backend/tests/test_firebase_auth.py` (append), `backend/tests/test_observability.py` (append)

**Interfaces:**
- Consumes: `log` (Task 1); `grader.diagnostics(run_probe: bool = False) -> dict` (existing).
- Produces: `app.firebaseauth.status() -> dict` with keys `{"configured": bool, "initialised": bool}`, never raises.

- [ ] **Step 1: Write the failing test for `status()`**

Append to `backend/tests/test_firebase_auth.py`:
```python
def test_firebase_status_shape_when_unconfigured():
    from app import firebaseauth

    s = firebaseauth.status()
    assert set(s) == {"configured", "initialised"}
    assert s["configured"] is False
    assert s["initialised"] is False
```

- [ ] **Step 2: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_firebase_auth.py::test_firebase_status_shape_when_unconfigured -v`
Expected: FAIL — `AttributeError: module 'app.firebaseauth' has no attribute 'status'`.

- [ ] **Step 3: Add `status()` to `firebaseauth.py`**

In `backend/app/firebaseauth.py`, after `firebase_enabled()`:
```python
def status() -> dict:
    """Boot-time visibility. `configured` = env var present; `initialised` =
    the Admin SDK actually came up. Never raises."""
    try:
        initialised = firebase_enabled()
    except Exception:
        initialised = False
    return {"configured": bool(FIREBASE_SERVICE_ACCOUNT_JSON), "initialised": initialised}
```
Also swap this module's logger: replace
```python
import logging
...
log = logging.getLogger("codesight.firebase")
```
with
```python
import structlog
...
log = structlog.get_logger("codesight.firebase")
```
and convert its `log.exception("...%s...", uid)` calls to kwargs form, e.g.
`log.exception("record_graded_submission_failed", uid=uid)`.

- [ ] **Step 4: Replace the lifespan body in `main.py`**

Replace the current `lifespan` function in `backend/app/main.py` with:
```python
@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    from app import firebaseauth

    log.info(
        "startup",
        db="sqlite" if DB_IS_SQLITE else "postgres",
        grader_model=GRADER_MODEL,
        gemini_key=bool(GEMINI_API_KEY),
        firebase=bool(FIREBASE_SERVICE_ACCOUNT_JSON),
        admin_api=adminauth.admin_enabled(),
        cors_origins=ALLOWED_ORIGINS,
        cors_regex=bool(ALLOWED_ORIGIN_REGEX),
    )
    log.info("grader_probe", **diagnostics(run_probe=False))
    log.info("firebase_probe", **firebaseauth.status())
    yield
```
Add `GEMINI_API_KEY` to the existing `from app.config import (...)` block in `main.py`.

- [ ] **Step 5: Write a startup-log test**

Append to `backend/tests/test_observability.py`:
```python
def test_startup_emits_config_summary(capsys):
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app):
        pass
    out = capsys.readouterr().out
    assert "startup" in out
    assert "grader_probe" in out
    assert "firebase_probe" in out
```

- [ ] **Step 6: Run new tests + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_firebase_auth.py tests/test_observability.py -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 188+ passed, 0 failed.

- [ ] **Step 7: Commit**

```bash
git -c gc.auto=0 add backend/app/main.py backend/app/firebaseauth.py backend/tests/test_firebase_auth.py backend/tests/test_observability.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): structured startup summary + integration probes

lifespan logs one "startup" line (db/model/keys/cors) plus non-fatal
grader_probe and firebase_probe lines so a broken integration is visible
at boot. Adds firebaseauth.status().

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 5: slowapi rate limiting

**Files:**
- Create: `backend/app/ratelimit.py`
- Modify: `backend/app/main.py`, `backend/tests/conftest.py`
- Test: `backend/tests/test_ratelimit.py`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `app.ratelimit.limiter` (a `slowapi.Limiter`). `POST /admin/login` is capped at `5/minute` per client IP; all other routes at `200/minute`; `GET /health` and `GET /` are exempt. Over-limit → `429 {"detail": "rate limit exceeded"}`. In tests the limiter is disabled by an autouse fixture.

- [ ] **Step 1: Create `app/ratelimit.py`**

```python
"""Shared slowapi limiter. Keyed by client IP (best-effort behind a proxy —
enough to blunt brute force). Disabled in tests by a conftest fixture."""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
```

- [ ] **Step 2: Disable the limiter in the test fixture**

In `backend/tests/conftest.py`, add an autouse fixture (top level, after imports):
```python
@pytest.fixture(autouse=True)
def _disable_rate_limit():
    from app.ratelimit import limiter

    prev = limiter.enabled
    limiter.enabled = False
    yield
    limiter.enabled = prev
```

- [ ] **Step 3: Write the failing test**

Create `backend/tests/test_ratelimit.py`:
```python
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
```

- [ ] **Step 4: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_ratelimit.py -v`
Expected: FAIL — no 429 ever appears (`codes.count(429) >= 1` fails).

- [ ] **Step 5: Wire slowapi into `main.py`**

Add imports to `backend/app/main.py`:
```python
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.ratelimit import limiter
```
After `app = FastAPI(...)` (and before/after the CORS middleware — order vs CORS does not matter here):
```python
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limited(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "rate limit exceeded"})


app.add_middleware(SlowAPIMiddleware)
```
Decorate the routes. `slowapi` requires the parameter be named exactly `request: Request`:
```python
@app.post("/admin/login", response_model=AdminToken)
@limiter.limit("5/minute")
def admin_login(request: Request, req: AdminLoginRequest):
    ...
```
```python
@app.get("/health")
@limiter.exempt
def health():
    return {"ok": True}


@app.get("/")
@limiter.exempt
def root():
    return {"service": "codesight-api", "docs": "/docs", "health": "/health"}
```

- [ ] **Step 6: Run new tests + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_ratelimit.py -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 190+ passed, 0 failed. (If any pre-existing test now sees a 429, the autouse `_disable_rate_limit` fixture is missing or mis-scoped — fix that, do not raise the limits.)

- [ ] **Step 7: Commit**

```bash
git -c gc.auto=0 add backend/app/ratelimit.py backend/app/main.py backend/tests/conftest.py backend/tests/test_ratelimit.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): slowapi rate limiting

POST /admin/login at 5/min per IP, 200/min global default, /health and /
exempt. Over-limit -> 429 {"detail":"rate limit exceeded"}. Limiter
disabled in tests via an autouse fixture.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 6: Gate `/debug` behind admin auth + anchor CORS regex

**Files:**
- Modify: `backend/app/main.py`, `backend/app/config.py`
- Test: `backend/tests/test_api.py` (update `test_debug_shape`), `backend/tests/test_config.py` (new)

**Interfaces:**
- Consumes: `adminauth.require_admin` (existing dependency).
- Produces: `GET /debug` needs `Authorization: Bearer <admin token>` — `401` without, `503` if `ADMIN_PASSWORD` unset. `ALLOWED_ORIGIN_REGEX` default is anchored with `^...$`.

- [ ] **Step 1: Update the existing `/debug` test**

In `backend/tests/test_api.py`, change `test_debug_shape` to pass admin headers and add an unauth check:
```python
def test_debug_requires_admin(client):
    assert client.get("/debug").status_code == 401


def test_debug_shape(client, admin_headers):
    d = client.get("/debug", headers=admin_headers).json()
    assert d["db"] in {"sqlite", "postgres"}
    assert "gemini_key_present" in d["grader"]
```

- [ ] **Step 2: Write the failing config test**

Create `backend/tests/test_config.py`:
```python
import re

from app.config import ALLOWED_ORIGIN_REGEX


def test_cors_regex_is_anchored_and_matches_expected_origins():
    assert ALLOWED_ORIGIN_REGEX.startswith("^") and ALLOWED_ORIGIN_REGEX.endswith("$")
    pat = re.compile(ALLOWED_ORIGIN_REGEX)
    assert pat.fullmatch("https://codesight-code-review.vercel.app")
    assert pat.fullmatch("http://localhost:5173")
    assert not pat.fullmatch("https://evil.example.com")
```

- [ ] **Step 3: Run both, verify they fail**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py::test_debug_requires_admin tests/test_config.py -v`
Expected: FAIL — `/debug` returns 200 without auth; regex has no `^`/`$`.

- [ ] **Step 4: Gate `/debug` in `main.py`**

```python
@app.get("/debug", dependencies=[Depends(adminauth.require_admin)])
def debug(probe: bool = False):
    ...
```

- [ ] **Step 5: Anchor the regex in `config.py`**

In `backend/app/config.py`, change the default:
```python
ALLOWED_ORIGIN_REGEX: str = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^(https://[a-z0-9-]+\.vercel\.app|http://localhost:\d+)$",
)
```

- [ ] **Step 6: Run tests + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k debug tests/test_config.py -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 192+ passed, 0 failed.

- [ ] **Step 7: Commit**

```bash
git -c gc.auto=0 add backend/app/main.py backend/app/config.py backend/tests/test_api.py backend/tests/test_config.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): gate /debug behind admin auth; anchor CORS regex

/debug exposed CORS config + grader internals publicly — now requires the
admin bearer token. ALLOWED_ORIGIN_REGEX default anchored with ^...$.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 7: `source` / `status` query-param validation (422)

**Files:**
- Modify: `backend/app/exercises.py`, `backend/app/admin.py`
- Test: `backend/tests/test_api.py` (append)

**Interfaces:**
- Consumes: nothing new.
- Produces: `GET /exercises?source=<x>` with `x ∉ {curated, generated}` → `422 {"detail": "unknown source"}`. `GET /admin/exercises?status=<x>` with an unrecognised label → `422 {"detail": "unknown status filter"}`.

- [ ] **Step 1: Write the failing tests**

Append to `backend/tests/test_api.py`:
```python
def test_exercises_unknown_source_is_422(client):
    assert client.get("/exercises?source=bogus").status_code == 422


def test_admin_exercises_unknown_status_is_422(client, admin_headers):
    r = client.get("/admin/exercises?status=bogus", headers=admin_headers)
    assert r.status_code == 422
```

- [ ] **Step 2: Run them, verify they fail**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k "unknown_source or unknown_status" -v`
Expected: FAIL — both currently return 200 with an empty / unfiltered list.

- [ ] **Step 3: Validate `source` in `exercises.py`**

In `backend/app/exercises.py`, inside `list_summaries`, right after the `tier` validation block:
```python
    if source is not None and source not in ("curated", "generated"):
        raise HTTPException(status_code=422, detail="unknown source")
```

- [ ] **Step 4: Validate `status` in `admin.py`**

In `backend/app/admin.py`, in `list_exercises`, before the filtering block:
```python
    _VALID_STATUS = {
        "all",
        *(_STATUS.keys()),        # approved, unreviewed, edited, rejected
        *(v.lower() for v in _STATUS.values()),  # approved, pending, draft, archived
        "deleted",
    }
    if status and status.lower() not in _VALID_STATUS:
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail="unknown status filter")
```
(Prefer a module-level `from fastapi import HTTPException` at the top of `admin.py` instead of the inline import if the file does not already have it.)

- [ ] **Step 5: Run tests + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k "source or status" -v`
Expected: PASS (including the existing `test_exercises_source_filter`, `test_admin_exercises_filters`).

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 194+ passed, 0 failed.

- [ ] **Step 6: Commit**

```bash
git -c gc.auto=0 add backend/app/exercises.py backend/app/admin.py backend/tests/test_api.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): 422 on unknown ?source and ?status filters

GET /exercises?source=x and GET /admin/exercises?status=x now reject
unrecognised values instead of silently returning an empty/unfiltered
list, mirroring the existing ?tier check.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 8: Paginate `GET /exercises` + memoize the summary list

**Files:**
- Modify: `backend/app/schemas.py`, `backend/app/exercises.py`, `backend/app/main.py`, `backend/CONTRACT.md`
- Test: `backend/tests/test_api.py` (update bare-list assertions + add pagination tests)

**Interfaces:**
- Consumes: `source` validation from Task 7.
- Produces:
  - `app.schemas.ExerciseList`: `{ items: list[ExerciseSummary], total: int, limit: int, offset: int }`.
  - `app.exercises.list_summaries(tier=None, source=None, hidden_ids=None, reviewed_only=False, limit=None, offset=0) -> tuple[list[ExerciseSummary], int]` — returns `(page_items, total_after_filters_before_slice)`. `limit=None` means "no slice" (used by any internal caller that wants everything).
  - `GET /exercises?tier=&source=&limit=&offset=` → `ExerciseList`. `limit` default `100`, bounds `1..500`; `offset` default `0`, `ge=0`.

- [ ] **Step 1: Add the `ExerciseList` schema**

In `backend/app/schemas.py`, next to `ExerciseSummary`:
```python
class ExerciseList(BaseModel):
    items: list[ExerciseSummary]
    total: int
    limit: int
    offset: int
```
Add `ExerciseList` to whatever `__all__` / import surface `main.py` pulls from (it imports names explicitly, so just make sure the class is defined).

- [ ] **Step 2: Write the failing tests**

In `backend/tests/test_api.py`, update the bare-list assertions and add pagination coverage. Replace `test_exercise_list_has_no_answer_fields`, `test_exercises_tier_gate_is_cumulative`, `test_exercises_source_filter` bodies to read `.json()["items"]`:
```python
def test_exercise_list_has_no_answer_fields(client):
    body = client.get("/exercises?limit=500").json()
    items = body["items"]
    assert body["total"] >= 3
    assert len(items) >= 3
    for it in items:
        assert set(it) == {
            "id", "language", "title", "defect_class", "line_count",
            "difficulty", "source",
        }
        assert not any(k in it for k in ("real_lines", "fix_diff", "reference", "code"))


def test_exercises_tier_gate_is_cumulative(client):
    def ids(q=""):
        return {e["id"] for e in client.get(f"/exercises?limit=500{q}").json()["items"]}

    beginner = ids("&tier=beginner")
    inter = ids("&tier=intermediate")
    all_ex = ids()
    assert beginner < inter <= all_ex


def test_exercises_source_filter(client):
    body = client.get("/exercises?source=curated&limit=500").json()
    assert body["items"] and all(e["source"] == "curated" for e in body["items"])
    assert body["total"] == len(body["items"])


def test_exercises_pagination_walks_the_set(client):
    full = client.get("/exercises?limit=500").json()
    total = full["total"]
    assert total > 10

    p1 = client.get("/exercises?limit=10&offset=0").json()
    assert p1["limit"] == 10 and p1["offset"] == 0 and p1["total"] == total
    assert len(p1["items"]) == 10

    p2 = client.get("/exercises?limit=10&offset=10").json()
    assert [e["id"] for e in p1["items"]] != [e["id"] for e in p2["items"]]
    assert {e["id"] for e in p1["items"]}.isdisjoint({e["id"] for e in p2["items"]})


def test_exercises_default_limit_is_100(client):
    body = client.get("/exercises").json()
    assert body["limit"] == 100
    assert len(body["items"]) == min(100, body["total"])


def test_exercises_limit_out_of_bounds_is_422(client):
    assert client.get("/exercises?limit=0").status_code == 422
    assert client.get("/exercises?limit=99999").status_code == 422


def test_exercises_summary_cache_busts_on_admin_write(client, admin_headers):
    before = client.get("/exercises?limit=500").json()["total"]
    body = {
        "title": "Cache bust probe", "language": "python",
        "defect_class": "logic", "difficulty": "beginner",
        "filename": "snippet.py", "code": "def f():\n    return 1\n",
        "real_lines": [], "fix_diff": "", "reference": "", "hints": [],
        "review_status": "approved",
    }
    r = client.post("/admin/exercises", headers=admin_headers, json=body)
    assert r.status_code == 201, r.text
    after = client.get("/exercises?limit=500").json()["total"]
    assert after == before + 1
```
Also update the review round-trip assertions further down `test_api.py` (search for `client.get("/exercises").json()` — every remaining one becomes `client.get("/exercises?limit=500").json()["items"]`).

- [ ] **Step 3: Run them, verify they fail**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k exercises -v`
Expected: FAIL — response is still a bare list, `body["items"]` raises `TypeError`.

- [ ] **Step 4: Rework `exercises.py`**

In `backend/app/exercises.py`:

Add the memo cache near the other module globals:
```python
_SUMMARY_CACHE: dict[tuple, list[ExerciseSummary]] = {}
```
Extend `invalidate()`:
```python
def invalidate() -> None:
    """Drop the effective-set + summary caches — call after any admin write."""
    global _EFFECTIVE
    _EFFECTIVE = None
    _SUMMARY_CACHE.clear()
```
Add a memoized builder and rewrite `list_summaries`:
```python
def _summaries_for(
    tier: str | None, source: str | None, reviewed_only: bool
) -> list[ExerciseSummary]:
    key = (tier, source, reviewed_only)
    cached = _SUMMARY_CACHE.get(key)
    if cached is not None:
        return cached

    allowed = None
    if tier is not None:
        if tier not in TIER_ORDER:
            raise HTTPException(status_code=422, detail="unknown tier")
        allowed = set(TIER_ORDER[: TIER_ORDER.index(tier) + 1])
    if source is not None and source not in ("curated", "generated"):
        raise HTTPException(status_code=422, detail="unknown source")

    built = [
        _summary(r)
        for r in _effective().values()
        if r.get("review_status") != "rejected"
        and (not reviewed_only or r.get("review_status") == "approved")
        and (allowed is None or r["difficulty"] in allowed)
        and (source is None or r["source"] == source)
    ]
    _SUMMARY_CACHE[key] = built
    return built


def list_summaries(
    tier: str | None = None,
    source: str | None = None,
    hidden_ids: set[str] | None = None,
    reviewed_only: bool = False,
    limit: int | None = None,
    offset: int = 0,
) -> tuple[list[ExerciseSummary], int]:
    """Returns (page, total). `total` is the count after tier/source/hidden/
    reviewed filters, before the limit/offset slice. `limit=None` -> no slice."""
    built = _summaries_for(tier, source, reviewed_only)
    hidden = hidden_ids or set()
    filtered = [s for s in built if s.id not in hidden] if hidden else built
    total = len(filtered)
    if limit is None:
        return list(filtered), total
    return filtered[offset : offset + limit], total
```
(The old `list_summaries` docstring/return can be removed. Confirm no other module calls `list_summaries` — `grep -rn "list_summaries" app/` should show only `main.py` and `exercises.py` itself.)

- [ ] **Step 5: Update the `/exercises` route in `main.py`**

```python
from app.schemas import ExerciseList  # add to the schemas import block

@app.get("/exercises", response_model=ExerciseList)
def list_exercises(
    tier: str | None = None,
    source: str | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """`tier` gates cumulatively (beginner -> +intermediate -> +pro).
    `source=curated|generated` filters the pool. Exercises reported by 3+
    sessions are omitted. Paginated: `limit` 1..500 (default 100), `offset`>=0."""
    items, total = ex.list_summaries(
        tier=tier,
        source=source,
        hidden_ids=reports.hidden_exercise_ids(db),
        limit=limit,
        offset=offset,
    )
    return ExerciseList(items=items, total=total, limit=limit, offset=offset)
```

- [ ] **Step 6: Update `CONTRACT.md`**

In `backend/CONTRACT.md`, find the `GET /exercises` entry and replace its response description with the envelope:
```
GET /exercises?tier=&source=&limit=&offset=
  tier    : beginner|intermediate|pro (cumulative)   optional
  source  : curated|generated                        optional
  limit   : 1..500, default 100                      optional
  offset  : >=0, default 0                           optional
  -> 200 { "items": [ExerciseSummary], "total": int, "limit": int, "offset": int }
     422 on unknown tier/source or out-of-range limit
```
Keep the `ExerciseSummary` field list wherever it is already documented.

- [ ] **Step 7: Run tests + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k "exercises or admin" -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 199+ passed, 0 failed. If a review-round-trip test still fails, it has an un-migrated `client.get("/exercises").json()` — fix it to `["items"]`.

- [ ] **Step 8: Commit**

```bash
git -c gc.auto=0 add backend/app/schemas.py backend/app/exercises.py backend/app/main.py backend/CONTRACT.md backend/tests/test_api.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): paginate GET /exercises + memoize summaries

Response is now {items,total,limit,offset}; limit 1..500 (default 100),
offset >=0. The ~1018 ExerciseSummary models are built once per
(tier,source,reviewed_only) and cached, busted by exercises.invalidate()
on admin writes. Hidden/reported filtering stays per-request. CONTRACT.md
updated.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 9: Background the `/grade` Firestore write

**Files:**
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_api.py` (append)

**Interfaces:**
- Consumes: `maybe_user`, `record_graded_submission` (existing).
- Produces: the signed-in profile write runs in a `BackgroundTasks` callback wrapped in `try/except` — `/grade` returns its `GradeResponse` without awaiting Firestore, and a raising `record_graded_submission` cannot fail the request.

Context: `record_graded_submission` already has an internal `try/except`, so today it will not 500 `/grade` — but the call (including `ref.get()`, a blocking network round-trip) runs *inline* in the request. This task moves it off the request path and adds a call-site guard so a future un-guarded raise still cannot escape.

- [ ] **Step 1: Write the failing test**

Append to `backend/tests/test_api.py`:
```python
def test_grade_survives_a_raising_profile_write(client, monkeypatch):
    import app.main as main_mod

    def _boom(*a, **k):
        raise RuntimeError("firestore down")

    # force the signed-in branch and make the profile write explode
    monkeypatch.setattr(main_mod, "maybe_user", lambda *a, **k: {"uid": "u1"})
    monkeypatch.setattr(main_mod, "record_graded_submission", _boom)

    r = client.post(
        "/grade",
        json={
            "session_id": "s-grade-resilience",
            "exercise_id": "ex-001",
            "selected_lines": [3],
            "explanation": "SQL string interpolation on the query.",
            "hints_used": 0,
        },
    )
    assert r.status_code == 200, r.text
    assert "localisation" in r.json()
```
Note: `maybe_user` is a FastAPI dependency resolved by reference at request time; monkeypatching `main_mod.maybe_user` only works if the route uses `Depends(maybe_user)` with `maybe_user` looked up on the module. It is imported as `from app.firebaseauth import maybe_user`, so patch `main_mod.maybe_user` **and** confirm the `Depends(...)` in the route references the module-level name (it does: `Depends(maybe_user)`). If the patch does not take, instead `monkeypatch.setattr("app.firebaseauth.verify_id_token", lambda t: {"uid": "u1"})` and pass an `Authorization: Bearer x` header.

- [ ] **Step 2: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py::test_grade_survives_a_raising_profile_write -v`
Expected: FAIL — `TestClient` re-raises the `RuntimeError` (BackgroundTasks run synchronously under the test client and the call is currently unguarded at the call site).

- [ ] **Step 3: Rework the `/grade` handler in `main.py`**

Add `BackgroundTasks` to the FastAPI import line. Add a module-level helper near the other helpers:
```python
def _write_profile_bg(uid: str, *, defect_class: str, localisation_score: float,
                      total_score: int, passed: bool, submission: dict) -> None:
    try:
        record_graded_submission(
            uid,
            defect_class=defect_class,
            localisation_score=localisation_score,
            total_score=total_score,
            passed=passed,
            submission=submission,
        )
    except Exception:
        log.exception("profile_write_failed", uid=uid, exercise_id=submission.get("exerciseId"))
```
In the `grade` route signature add `background_tasks: BackgroundTasks`. Replace the `if user and user.get("uid"):` block with:
```python
    if user and user.get("uid"):
        from datetime import datetime, timezone

        submission = {
            "exerciseId": req.exercise_id,
            "defectClass": answer["defect_class"],
            "localisationScore": loc["score"],
            "explanationScore": expl["explanation_score"],
            "scoreAfterHints": score_after_hints,
            "pass": combined >= 0.6,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        background_tasks.add_task(
            _write_profile_bg,
            user["uid"],
            defect_class=answer["defect_class"],
            localisation_score=loc["score"],
            total_score=int(round(score_after_hints)),
            passed=combined >= 0.6,
            submission=submission,
        )
```

- [ ] **Step 4: Run the test + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_api.py -k grade -v`
Expected: PASS (including all existing grade tests).

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 200+ passed, 0 failed.

- [ ] **Step 5: Commit**

```bash
git -c gc.auto=0 add backend/app/main.py backend/tests/test_api.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(backend): move the /grade Firestore write to a background task

The signed-in profile write (incl. a blocking ref.get()) no longer runs
inline in the request; it is a BackgroundTasks callback wrapped in
try/except, so a Firestore outage can neither delay nor fail /grade.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 10: Convert remaining ad-hoc logging to structlog

**Files:**
- Modify: `backend/app/grader.py`, `backend/app/ai_review.py`, `backend/app/adminstore.py`, `backend/app/db.py` (and any other `app/` module a grep turns up)
- Test: `backend/tests/test_logging.py` (append a guard test)

**Interfaces:** none — mechanical.

- [ ] **Step 1: Find every remaining stdlib logger**

Run: `grep -rn "import logging\|getLogger\|logging\." backend/app/`
Expected: hits in `grader.py`, `ai_review.py`, `adminstore.py`, `db.py` (and now-clean `main.py`, `firebaseauth.py`). `app/logging.py` legitimately imports `logging` — exclude it.

- [ ] **Step 2: Write the guard test**

Append to `backend/tests/test_logging.py`:
```python
import pathlib


def test_no_stdlib_getlogger_in_app_modules():
    app_dir = pathlib.Path(__file__).parent.parent / "app"
    offenders = []
    for py in app_dir.glob("*.py"):
        if py.name == "logging.py":
            continue
        text = py.read_text(encoding="utf-8")
        if "getLogger" in text:
            offenders.append(py.name)
    assert not offenders, f"use structlog.get_logger: {offenders}"
```

- [ ] **Step 3: Run it, verify it fails**

Run: `.venv/Scripts/python.exe -m pytest tests/test_logging.py::test_no_stdlib_getlogger_in_app_modules -v`
Expected: FAIL — offenders list is non-empty.

- [ ] **Step 4: Swap each module**

In each offender, replace:
```python
import logging
...
log = logging.getLogger("codesight.something")
```
with:
```python
import structlog
...
log = structlog.get_logger("codesight.something")
```
and convert call sites from `%`-style to kwargs, e.g.
`log.info("added column %s.%s", table, name)` → `log.info("added_column", table=table, column=name)`.
`db.py`'s `_ensure_columns` is the main one. Keep messages short event-name strings; move interpolated values to kwargs. Do not change control flow.

- [ ] **Step 5: Run guard test + full suite**

Run: `.venv/Scripts/python.exe -m pytest tests/test_logging.py -v`
Expected: PASS.

Run: `.venv/Scripts/python.exe -m pytest -q`
Expected: 201+ passed, 0 failed.

- [ ] **Step 6: Commit**

```bash
git -c gc.auto=0 add backend/app/grader.py backend/app/ai_review.py backend/app/adminstore.py backend/app/db.py backend/tests/test_logging.py
git -c gc.auto=0 commit -m "$(cat <<'EOF'
refactor(backend): structlog everywhere; drop stdlib getLogger

All app/ modules now use structlog.get_logger with event-name + kwargs
call sites. A guard test keeps stdlib getLogger out of app/ (except the
logging config module).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## === REBASE GATE ===

**Before Task 11:** the human must have (a) re-published `firestore.rules` in the Firebase console and (b) merged `feat/onboarding-flow` → `main`. Then:

```bash
git -c gc.auto=0 fetch origin
git -c gc.auto=0 rebase origin/main
```
Resolve any conflict in `frontend/src/pages/pro/ProProblems.tsx` / `frontend/src/pages/ProblemListHome.tsx` in favour of the onboarding-branch version (this branch has not touched them yet). `npx tsc --noEmit` from `frontend/` must be clean before starting Task 11.

---

## Task 11: Frontend — `listExerciseSummaries` returns the envelope

**Files:**
- Modify: `frontend/src/api/types.ts`, `frontend/src/api/exercises.ts`, `frontend/src/api/index.ts` (verify only)
- Test: `npx tsc --noEmit`

**Interfaces:**
- Produces:
  - `types.ts`: `export interface ExerciseListResponse { items: ExerciseSummary[]; total: number; limit: number; offset: number }`.
  - `exercises.ts`: `listExerciseSummaries(opts?: { tier?: Tier; source?: 'curated' | 'generated'; limit?: number; offset?: number }): Promise<ExerciseListResponse>` — live path hits `/exercises` and returns the JSON as-is; mock path builds the same envelope from `mockExercises`.

- [ ] **Step 1: Add the type**

In `frontend/src/api/types.ts`, after `ExerciseSummary`:
```ts
export interface ExerciseListResponse {
  items: ExerciseSummary[]
  total: number
  limit: number
  offset: number
}
```

- [ ] **Step 2: Rewrite `listExerciseSummaries` in `exercises.ts`**

```ts
export async function listExerciseSummaries(
  opts: { tier?: Tier; source?: 'curated' | 'generated'; limit?: number; offset?: number } = {},
): Promise<ExerciseListResponse> {
  const limit = opts.limit ?? 100
  const offset = opts.offset ?? 0
  if (USE_MOCK) {
    await delay(200)
    let out = mockExercises.map(summaryFromMock)
    if (opts.tier) {
      const allowed = new Set(TIER_ORDER.slice(0, TIER_ORDER.indexOf(opts.tier) + 1))
      out = out.filter((e) => allowed.has(e.difficulty as Tier))
    }
    if (opts.source) out = out.filter((e) => e.source === opts.source)
    return { items: out.slice(offset, offset + limit), total: out.length, limit, offset }
  }
  return api.get<ExerciseListResponse>('/exercises', {
    tier: opts.tier,
    source: opts.source,
    limit,
    offset,
  })
}
```
Update the import line in `exercises.ts` to bring in `ExerciseListResponse` from `./types`.

- [ ] **Step 3: Verify `index.ts`**

Confirm `frontend/src/api/index.ts` still re-exports `listExerciseSummaries` (it does — no change needed). Confirm nothing imports the old `Promise<ExerciseSummary[]>` return anywhere except `ProProblems.tsx` / `ProblemListHome.tsx` (handled in Tasks 12–13):
Run: `grep -rn "listExerciseSummaries" frontend/src`

- [ ] **Step 4: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: errors **only** in `ProProblems.tsx` / `ProblemListHome.tsx` (they still treat the result as an array). That is expected — Tasks 12–13 fix them. If errors appear elsewhere, address them here.

- [ ] **Step 5: Commit**

```bash
git -c gc.auto=0 add frontend/src/api/types.ts frontend/src/api/exercises.ts
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(frontend): listExerciseSummaries returns the paginated envelope

Matches the backend {items,total,limit,offset} shape; mock path
synthesizes it. Callers updated in follow-up commits.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 12: Frontend — `ProProblems.tsx` server paging

**Files:**
- Modify: `frontend/src/pages/pro/ProProblems.tsx`
- Test: `npx tsc --noEmit`, `npx vite build`

**Interfaces:**
- Consumes: `listExerciseSummaries` returning `ExerciseListResponse` (Task 11).

Context: on the rebased tree this file already has a client-side `PAGE`/`visible`/`slice` model and a `source` toggle (`all`/`curated`/`generated`) from the onboarding branch. This task swaps the client-side slicing for real server paging.

- [ ] **Step 1: Replace the data-loading block**

In `ProProblems.tsx`:
- State: keep `source`; replace `rows` (was `ExerciseSummary[] | null`) usage with an accumulator:
  ```ts
  const PAGE = 60
  const [rows, setRows] = useState<ExerciseSummary[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  ```
- Loader: fetch `{ source: source === 'all' ? undefined : source, limit: PAGE, offset }` and **append** unless `offset === 0` (reset):
  ```ts
  useEffect(() => {
    let dead = false
    setLoading(true)
    setError(null)
    listExerciseSummaries({
      source: source === 'all' ? undefined : source,
      limit: PAGE,
      offset,
    })
      .then((res) => {
        if (dead) return
        setTotal(res.total)
        setRows((prev) => (offset === 0 ? res.items : [...prev, ...res.items]))
      })
      .catch((e) => !dead && setError(e instanceof ApiError ? `${e.status}` : String(e)))
      .finally(() => !dead && setLoading(false))
    return () => {
      dead = true
    }
  }, [source, offset])
  ```
- When `source` changes, reset paging:
  ```ts
  useEffect(() => {
    setOffset(0)
    setRows([])
  }, [source])
  ```
- Client-side filters (difficulty/defect-class/search) now narrow **`rows`** (what's loaded). Keep the existing `matched` filter but drop any `source` predicate from it (the server handles source now). `shown` = `matched` (no more `.slice(0, visible)`).
- Count line: `{matched.length} shown · {rows.length} loaded · {total.toLocaleString()} total`.
- "Show more" button (visible when `rows.length < total`): `onClick={() => setOffset((o) => o + PAGE)}`, disabled while `loading`.
- Delete the old `visible` state, the `useEffect` that reset `visible`, and the old `.slice(0, visible)`.

- [ ] **Step 2: Type-check + build**

Run (from `frontend/`): `npx tsc --noEmit` → clean.
Run: `npx vite build` → `✓ built`.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/pro/ProProblems.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(frontend): server paging in ProProblems

Source filter goes to the server; "Show more" fetches the next 60 by
offset and appends. Difficulty/class/search narrow the loaded rows.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 13: Frontend — `ProblemListHome.tsx` server paging

**Files:**
- Modify: `frontend/src/pages/ProblemListHome.tsx`
- Test: `npx tsc --noEmit`, `npx vite build`

**Interfaces:**
- Consumes: `listExerciseSummaries` → `ExerciseListResponse` (Task 11).

Context: on the rebased tree this file (onboarding version) fetches all summaries once, maps them into `reviewRows`, merges with mock `studentRows`, and slices client-side with `PAGE`/`visible`. This task pages the `reviewRows` (AI-engineer) half from the server; `studentRows` stays local.

- [ ] **Step 1: Rework the review-rows data layer**

- Replace the single `listExerciseSummaries()` fetch with the paging accumulator (same shape as Task 12): `apiRows: ExerciseSummary[]`, `reviewTotal: number`, `reviewOffset: number`, `source` state, `PAGE = 60`.
- Loader effect keyed on `[source, reviewOffset]`; appends unless `reviewOffset === 0`.
- `source` change → `setReviewOffset(0); setApiRows([])`.
- `reviewRows: Row[] = apiRows.map(fromExercise)` (unchanged mapper).
- `studentRows` unchanged.
- `base` for `filters.mode`:
  - `'student'` → `studentRows`
  - `'ai_engineer'` → `reviewRows`
  - `'all'` → `[...studentRows, ...reviewRows]`
- `matched` filter: drop the `source` predicate for `ai_engineer` rows (server handles it); keep difficulty/class/search over the accumulated rows. `shown = matched` (no `.slice`).
- Mode-tab counts: `Student Scratch ({studentRows.length})`, `AI Code Fix ({reviewTotal.toLocaleString()})`, `All Modes ({(studentRows.length + reviewTotal).toLocaleString()})`.
- Source toggle stays hidden when `filters.mode === 'student'`.
- Count line: `{matched.length} shown · {apiRows.length} loaded · {reviewTotal.toLocaleString()} review exercises`.
- "Show more" (when `apiRows.length < reviewTotal` and mode ≠ `student`): `setReviewOffset((o) => o + PAGE)`.
- Reset-filters also `setSource('all')` and `setReviewOffset(0)`.

- [ ] **Step 2: Type-check + build**

Run (from `frontend/`): `npx tsc --noEmit` → clean.
Run: `npx vite build` → `✓ built`.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/ProblemListHome.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(frontend): server paging for the AI-Code-Fix list in ProblemListHome

The review half pages from the server by offset; student rows stay local;
"All Modes" merges the two. Counts read `total` from the envelope.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 14: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Backend suite**

Run (from `backend/`): `.venv/Scripts/python.exe -m pytest -q`
Expected: **≥ 201 passed**, 10 skipped, 0 failed.

- [ ] **Step 2: Backend boots + endpoints behave**

Run (from `backend/`): `.venv/Scripts/python.exe -m uvicorn app.main:app --port 8010` (background), then:
- `curl -s localhost:8010/health` → `{"ok":true}`
- `curl -s localhost:8010/debug` → `401`
- `curl -s "localhost:8010/exercises?limit=5"` → JSON with `items` (5), `total`, `limit=5`, `offset=0`
- `curl -s "localhost:8010/exercises?source=bogus"` → `422`
- console shows one JSON/console `startup` line + `grader_probe` + `firebase_probe`, and one `request` line per curl with a `request_id`.
Stop the server.

- [ ] **Step 3: Frontend checks**

Run (from `frontend/`): `npx tsc --noEmit` → clean; `npx vite build` → `✓ built`.

- [ ] **Step 4: Browser walkthrough**

Start the dev server (`npm run dev` in `frontend/`, `VITE_API_BASE_URL` pointed at the local backend from Step 2 or the Railway URL). Log in, reach `/pro/problems`:
- initial list shows 60 rows, count line reads "… 60 loaded · 1,018 total" (or current corpus size);
- "Show more" adds 60 and a network call to `/exercises?...&offset=60` appears;
- the source toggle (All/Curated/Generated) refetches from `offset=0` and the total changes for Curated (~35);
- `/problems` "AI Code Fix" tab: same paging; "Student Scratch" tab unaffected; "All Modes" count = student + review total.

- [ ] **Step 5: Commit (if any walkthrough fixes were needed)**

```bash
git -c gc.auto=0 add -A
git -c gc.auto=0 commit -m "$(cat <<'EOF'
fix(frontend): paging walkthrough adjustments

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task |
|---|---|
| §3.1 isolate Firestore write | Task 9 |
| §3.2 `source` 422 | Task 7 (+ mirrored in Task 8's `_summaries_for`) |
| §3.3 `status` 422 | Task 7 |
| §3.4 global exception handler | Task 3 |
| §4.1 paginate `/exercises` | Task 8 |
| §4.2 memoize summary list | Task 8 |
| §4.3 background the write | Task 9 |
| §5.1 slowapi rate limiting | Task 5 |
| §5.2 gate `/debug` | Task 6 |
| §5.3 anchor CORS regex | Task 6 |
| §6.1 structlog config | Task 1 |
| §6.2 request-ID middleware + per-request line | Task 2 |
| §6.3 startup config summary | Task 4 |
| §6.4 non-fatal integration probe | Task 4 |
| §6.5 convert remaining ad-hoc logging | Task 10 |
| §7.1 update existing tests | Tasks 6, 8 |
| §7.2 new tests | Tasks 2–10 (each) |
| §8.1 frontend API envelope | Task 11 |
| §8.2 `ProProblems.tsx` paging | Task 12 |
| §8.3 `ProblemListHome.tsx` paging | Task 13 |
| §8.4 caller audit | Task 11 Step 3 |
| §8.5 frontend verification | Tasks 12–14 |
| §9 execution model | subagent-driven, ledger at `.superpowers/sdd/2026-08-31-backend-polish/` |

No gaps.

**2. Placeholder scan** — every code step carries real code. The only deferred item is the rebase gate, which is a human action explicitly called out. Task 12/13 describe edits prose-plus-snippets because they modify onboarding-branch file versions not visible at plan-writing time; the interfaces and every state variable are named.

**3. Type consistency**
- `list_summaries` returns `tuple[list[ExerciseSummary], int]` everywhere it is mentioned (Tasks 8).
- `ExerciseList` (backend) ↔ `ExerciseListResponse` (frontend) — deliberately different names, same four fields `{items,total,limit,offset}`.
- `_summaries_for(tier, source, reviewed_only)` cache key matches `_SUMMARY_CACHE` usage and `invalidate()`.
- `_write_profile_bg(uid, *, defect_class, localisation_score, total_score, passed, submission)` matches `record_graded_submission`'s existing signature.
- `configure_logging()` / `app.logging` imported consistently in Tasks 1, 4.
- `limiter` from `app.ratelimit` consistent in Task 5 and conftest.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-31-backend-polish.md`. Two execution options:

**1. Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
