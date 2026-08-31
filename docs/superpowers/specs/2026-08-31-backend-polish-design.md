# Backend Polish — Design Spec

**Date:** 2026-08-31
**Branch:** `feat/backend-polish` (off `main` *after* `feat/onboarding-flow` merges)
**Team HackHive · Tech Eximius 2026**

A hardening pass over the existing FastAPI backend (`backend/`) across four
dimensions: robustness / error handling, performance / scale, security, and
observability. The backend is already mature — 183 tests passing, clean module
boundaries, deployed and healthy on Railway. This is polish, not a rescue: every
change is small, local, and independently testable against the existing suite.

Two runtime dependencies are added: `slowapi` (rate limiting) and `structlog`
(structured logging).

---

## 1. Context

- **Stack:** FastAPI + SQLAlchemy 2 + Pydantic 2, `google-genai` for the grader,
  `firebase-admin` for server-authoritative profile writes. Postgres in prod
  (Railway), SQLite file in dev.
- **Deployed:** `https://codesight-code-review-production.up.railway.app` —
  `/health` green, postgres, `gemini-3.6-flash`, Gemini key present, Firebase
  service account set.
- **Test baseline:** `python -m pytest -q` → **183 passed, 10 skipped** (offline,
  no API key needed). This number must not regress.
- **Exercise corpus:** ~1,018 records (35 curated + ~983 generated), loaded once
  at import into `_EXERCISES`, then merged with a Postgres admin overlay into a
  cached `_EFFECTIVE` dict (busted by `exercises.invalidate()` on every admin
  write).

### Rough edges this spec addresses

1. `GET /exercises` returns **all ~1,018 rows** every call, building ~1,018
   Pydantic `ExerciseSummary` models per request. No pagination. The frontend
   problem lists lean on this hard (fetch-all, slice client-side).
2. `/grade` calls `record_graded_submission()` (Firestore, Admin SDK)
   **synchronously in the request path**, unwrapped — a Firestore hiccup can turn
   a valid grade into a 500.
3. `GET /exercises?source=xxx` with a bad value **silently returns an empty
   list** instead of 422 (`tier` is validated; `source` is not).
4. `GET /admin/exercises?status=xxx` with an unknown label is passed straight
   through — no validation.
5. `/debug` is **public** and returns `allowed_origins`, the CORS regex, and
   grader internals.
6. **No rate limiting anywhere** — `POST /admin/login` included (brute-forceable).
7. Unhandled exceptions render as raw HTML 500s with no request correlation.
8. Logging is bare `logging.basicConfig(level=INFO)` with ~a handful of ad-hoc
   `log.info` calls. No request IDs, no per-request line, no startup config
   summary, no boot-time visibility into whether Gemini / Firebase actually
   initialised.

### Non-goals

- Alembic / migrations — table creation stays `init_db()` / `create_all`.
- Admin auth rework — the shared-password → HMAC-token scheme is kept as-is
  (only rate-limited).
- New endpoints beyond adding query params to `GET /exercises`.
- Any change to `/ai-review`, the grader, the localisation scorer, or the
  concepts / topics / tiers logic.
- Frontend test runner — frontend verification stays `tsc --noEmit` + `vite
  build` + browser walkthrough.

---

## 2. Prerequisite & sequencing

1. **Human, before implementation:**
   - Re-publish `firestore.rules` in the Firebase console (adds `onboarded` to
     `createFields()` / `editableFields()` — the standing onboarding blocker).
   - Merge `feat/onboarding-flow` → `main`.
2. `feat/backend-polish` is rebased onto the updated `main`, then implementation
   begins. (The branch is cut early only to carry this spec + the plan; its one
   conflict surface with onboarding is `ProProblems.tsx` / `ProblemListHome.tsx`,
   handled by rebasing after the merge.)
3. `requirements.txt` gains `slowapi>=0.1.9` and `structlog>=24.1`. Railway
   installs them on the next deploy automatically.

---

## 3. Dimension 1 — Robustness / error handling

### 3.1 Isolate the Firestore write in `/grade`

`record_graded_submission(...)` moves into a FastAPI `BackgroundTasks` callback
(see §4.3). The callback body is wrapped:

```python
def _write_profile(uid, ...):
    try:
        record_graded_submission(uid, ...)
    except Exception:
        log.exception("firestore profile write failed", uid=uid, exercise_id=...)
```

`/grade` returns its `GradeResponse` without awaiting Firestore. A Firestore
outage degrades to "profile not updated this attempt", never a 500. The
anonymous path (no `user`) is unchanged.

**Files:** `app/main.py` (grade handler), possibly a small helper in
`app/firebaseauth.py`.

### 3.2 Validate `source` on `GET /exercises`

`app/exercises.list_summaries` already raises `HTTPException(422)` for an unknown
`tier`. Add the mirror for `source`: anything not in `{"curated", "generated"}`
(and not `None`) → `HTTPException(422, detail="unknown source")`.

**Files:** `app/exercises.py` (`list_summaries`).
**Note:** admin overlay records use `source="admin"`; `source=admin` on the
public endpoint is **not** a documented filter and stays a 422 — the public list
only distinguishes curated vs generated. If we ever want it, that is a separate
change.

### 3.3 Validate `status` on `GET /admin/exercises`

`app/admin.list_exercises` accepts `status` as `Approved | Pending | Draft |
Archived` or a raw `review_status`. Add an explicit allow-list check at the top
of the handler (or in `admin.list_exercises`): unknown value →
`HTTPException(422, detail="unknown status filter")`. The valid set is the four
labels plus the raw statuses the loader can produce (`approved`, `unreviewed`,
`rejected`, `edited`, `deleted`).

**Files:** `app/main.py` (admin_exercises handler) or `app/admin.py`.

### 3.4 Global unhandled-exception handler

Register `@app.exception_handler(Exception)`:

```python
@app.exception_handler(Exception)
async def unhandled(request, exc):
    rid = request.headers.get("x-request-id") or request.state.request_id
    log.exception("unhandled error", request_id=rid, path=request.url.path)
    return JSONResponse(status_code=500,
        content={"detail": "internal error", "request_id": rid})
```

`HTTPException` and `RequestValidationError` keep FastAPI's default rendering
(`{"detail": ...}` / 422 body) — only genuinely unhandled errors hit this.
Result: every 500 is JSON, logged with a traceback, and carries the request id
the client also sees in the `X-Request-ID` response header.

**Files:** `app/main.py`.

---

## 4. Dimension 2 — Performance / scale

### 4.1 Paginate `GET /exercises`

New query params on the endpoint:

| param | type | default | bounds |
|---|---|---|---|
| `limit` | int | `100` | `1`–`500` (`Query(ge=1, le=500)`) |
| `offset` | int | `0` | `ge=0` |

Response shape changes from a bare `list[ExerciseSummary]` to an envelope:

```json
{
  "items": [ ...ExerciseSummary... ],
  "total": 1018,
  "limit": 100,
  "offset": 0
}
```

`total` is the count **after** all filters (`tier`, `source`, hidden/reported,
`review_status != rejected`) but **before** the `limit`/`offset` slice.
`tier` and `source` semantics are unchanged.

New schema `ExerciseList` in `app/schemas.py`; `response_model` on the route
updated. `CONTRACT.md` updated to document the envelope + params.

**Files:** `app/main.py`, `app/schemas.py`, `app/exercises.py`, `CONTRACT.md`.

### 4.2 Memoize the built summary list

In `app/exercises.py`, add a module-level cache:

```python
_SUMMARY_CACHE: dict[tuple, list[ExerciseSummary]] = {}
```

keyed by `(tier, source, reviewed_only)`. `list_summaries` builds the filtered,
model-ified list once per key and stores it. Per request:

1. look up / build the cached list for `(tier, source, reviewed_only)`;
2. filter out `hidden_ids` (cheap set membership on the cached list — so
   report-hiding never needs a cache bust);
3. compute `total = len(filtered)`;
4. return `filtered[offset : offset + limit]` + `total`.

`invalidate()` (already called by `adminstore` after every write) also clears
`_SUMMARY_CACHE`. Net effect: 1,018 `ExerciseSummary` models are built once and
reused until an admin write, instead of on every `/exercises` call.

**Files:** `app/exercises.py`.

### 4.3 Background the `/grade` Firestore write

The `if user and user.get("uid"):` block in the grade handler is replaced by a
`background_tasks.add_task(_write_profile, ...)` call (handler gains
`background_tasks: BackgroundTasks`). Payload construction (the `submission`
dict, `datetime.now(timezone.utc)`) moves into or before the task. The DB
`Attempt` write stays synchronous (it is the source of truth for scoring /
profile / leaderboard). See §3.1 for the wrapper.

**Files:** `app/main.py`.

---

## 5. Dimension 3 — Security hardening

### 5.1 Rate limiting with `slowapi`

- New `app/ratelimit.py`: `Limiter(key_func=get_remote_address)`.
- `app/main.py`: `app.state.limiter = limiter`;
  `app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)` returning
  `429 {"detail": "rate limit exceeded"}`.
- `@limiter.limit("5/minute")` on `POST /admin/login` (the handler gains
  `request: Request`, required by slowapi).
- A loose global default via `Limiter(..., default_limits=["200/minute"])` —
  high enough that a live demo or the exercise-review tooling never trips it,
  low enough to blunt a script. `/health` and `/` are exempted
  (`@limiter.exempt`) so uptime checks don't count.

**Railway note:** `get_remote_address` reads `request.client.host`. Behind
Railway's proxy that may be the proxy IP; acceptable for brute-force blunting
(all admin-login attempts share a bucket at worst). Not relying on per-client
precision. `X-Forwarded-For` parsing is explicitly out of scope.

**Files:** `app/ratelimit.py` (new), `app/main.py`, `requirements.txt`.

### 5.2 Gate `/debug` behind `require_admin`

`@app.get("/debug", dependencies=[Depends(adminauth.require_admin)])`. It exposes
CORS config + grader diagnostics — same trust level as `/admin/stats`. When
`ADMIN_PASSWORD` is unset the endpoint returns 503 (consistent with the rest of
`/admin/*`); the `/health` check stays public and unauthenticated for uptime
monitors.

**Files:** `app/main.py`.

### 5.3 Anchor the CORS regex

`app/config.ALLOWED_ORIGIN_REGEX` default becomes
`r"^(https://[a-z0-9-]+\.vercel\.app|http://localhost:\d+)$"`. Starlette already
uses `fullmatch`, so this is defensive/clarifying, not a behaviour change. Any
`ALLOWED_ORIGIN_REGEX` env override on Railway is untouched.

**Files:** `app/config.py`.

---

## 6. Dimension 4 — Observability

### 6.1 `structlog` configuration

New `app/logging.py`, `configure_logging()` called once at import in `main.py`
before the app is built:

- shared processors: `merge_contextvars`, `add_log_level`, timestamper (ISO,
  UTC), `StackInfoRenderer`, `format_exc_info`.
- renderer: `JSONRenderer()` when `DB_IS_SQLITE is False` (prod), else
  `ConsoleRenderer()` (dev).
- stdlib `logging` routed through structlog (`ProcessorFormatter`) so
  `uvicorn` / `sqlalchemy` lines share the stream.
- module-level `log = structlog.get_logger("codesight")` replaces the current
  `logging.getLogger`.

**Files:** `app/logging.py` (new), `app/main.py`, `requirements.txt`.

### 6.2 Request-ID middleware + one line per request

`@app.middleware("http")`:

1. `rid = request.headers.get("x-request-id") or uuid4().hex[:12]`.
2. `request.state.request_id = rid`;
   `structlog.contextvars.bind_contextvars(request_id=rid)`.
3. time the call; on the way out set `response.headers["X-Request-ID"] = rid`.
4. emit exactly one `log.info("request", method=…, path=…, status=…,
   duration_ms=…)` (the bound `request_id` rides along).
5. `clear_contextvars()` in a `finally`.

**Files:** `app/main.py` (or `app/logging.py` for the middleware factory).

### 6.3 Startup config summary

The `lifespan` handler emits one structured line:

```
log.info("startup",
    db="sqlite" if DB_IS_SQLITE else "postgres",
    grader_model=GRADER_MODEL,
    gemini_key=bool(GEMINI_API_KEY),
    firebase=bool(FIREBASE_SERVICE_ACCOUNT_JSON),
    admin_api=adminauth.admin_enabled(),
    cors_origins=ALLOWED_ORIGINS,
    cors_regex=bool(ALLOWED_ORIGIN_REGEX))
```

Replaces the current two ad-hoc `log.warning` / `log.info` calls.

### 6.4 Non-fatal startup integration probe

Still in `lifespan`, after the summary:

- `log.info("grader_probe", **grader.diagnostics(run_probe=False))` — reports
  `client_initialised`, `gemini_key_present`, `grader_model` without spending a
  live call.
- a Firebase status line: whether `firebase_admin` initialised (a
  `firebaseauth.status()` helper — added if one doesn't already exist — that
  returns `{configured: bool, initialised: bool}` without raising).

Neither aborts startup; they make a broken integration visible at boot instead
of on the first user request.

**Files:** `app/main.py`, `app/firebaseauth.py` (small `status()` helper if
absent).

### 6.5 Convert remaining ad-hoc logging

The ~handful of `logging` / `log.` sites outside `main.py` (grep: `grader.py`,
`ai_review.py`, `firebaseauth.py`, `adminstore.py` as they surface) switch to
`structlog.get_logger(__name__)` for one consistent stream. Mechanical; no
message changes.

---

## 7. Testing

`tests/` is `pytest` + `fastapi.testclient`. Conftest already isolates a
per-test SQLite DB.

### 7.1 Existing tests

- Any assertion in `tests/test_api.py` that treats `GET /exercises` as a bare
  list is updated to the `{items, total, limit, offset}` envelope
  (`r.json()["items"]`, `r.json()["total"]`).
- **183 passed** must hold after updates (the count may rise as new tests land;
  it must not fall).

### 7.2 New tests

| area | assertion |
|---|---|
| pagination | `limit=10` → 10 items, `total == full count`; `offset` walks the set; `limit` out of bounds → 422; no params → 100 items (or `total` if fewer) |
| `source` validation | `GET /exercises?source=bogus` → 422 |
| `status` validation | `GET /admin/exercises?status=bogus` (with token) → 422 |
| admin-login rate limit | 6 `POST /admin/login` within a minute from one client → 6th is 429 |
| `/debug` gating | no token → 401 (or 503 when `ADMIN_PASSWORD` unset); valid token → 200 |
| `/grade` resilience | monkeypatch `record_graded_submission` to raise → `/grade` still 200, body intact |
| request id | every response carries `X-Request-ID`; a client-supplied `X-Request-ID` is echoed back |
| unhandled handler | a route forced to raise (test-only) → 500 JSON `{"detail","request_id"}`, not HTML |

### 7.3 Manual / deploy verification

- Local: `pytest -q` green; `uvicorn app.main:app` boots; startup log shows the
  config summary + probes; `GET /exercises?limit=5` returns the envelope;
  `curl /debug` → 401.
- Post-deploy: Railway logs show one JSON line per request with `request_id`;
  `/health` still public 200; `/debug` now 401 without the admin token.

---

## 8. Frontend adoption

### 8.1 API client

`frontend/src/api/` — `listExerciseSummaries()`:

- **before:** `listExerciseSummaries(opts?: { tier?; source? }): Promise<ExerciseSummary[]>`
- **after:** `listExerciseSummaries(opts?: { tier?; source?; limit?; offset? }):
  Promise<{ items: ExerciseSummary[]; total: number; limit: number; offset: number }>`

`types.ts` gains `ExerciseListResponse`.

### 8.2 `ProProblems.tsx`

Replace the client-only `PAGE`/`visible`/`slice` model with server paging:

- keep an accumulating `rows: ExerciseSummary[]` + `total: number` + `offset`.
- initial load: `listExerciseSummaries({ limit: 60, offset: 0 })`.
- "Show more" → fetch `offset += 60`, append.
- the `source` toggle (`all` / `curated` / `generated`) now passes `source`
  through to the server and **resets** the accumulator (`offset = 0`, `rows =
  []`) on change.
- difficulty / defect-class / search filters stay **client-side over the
  accumulated rows** (the smaller change, matches today's UX). `tier` is **not**
  sent server-side in this pass — only `source` and `limit`/`offset` are. The
  count line reads "showing N of M loaded · T total".
- consequence, accepted: a difficulty/class/search filter only narrows what has
  been loaded so far, so "Show more" is how the user pulls more matches into
  view. Server-side `tier`/search filtering is a possible follow-up, explicitly
  not in this spec.

### 8.3 `ProblemListHome.tsx`

- `reviewRows` (AI-engineer half) pages from the server exactly as §8.2.
- `studentRows` stays the local mock list.
- "All Modes" = `[...studentRows, ...pagedReviewRows]` — the merge stays
  client-side; only the review half grows via "Show more".
- mode-tab counts: student count is exact; AI count shows `total` from the
  envelope; "All" adds them.

### 8.4 Caller audit

`grep -rn "listExerciseSummaries\|'/exercises'\|\"/exercises\"" frontend/src` —
every hit updated to the envelope. Known: `ProProblems.tsx`,
`ProblemListHome.tsx`. Any workspace/next-exercise helper that calls it for a
single "next" item is adjusted to read `.items`.

### 8.5 Verification

`npx tsc --noEmit` clean · `npx vite build` → `built` · browser walkthrough on
`localhost:5173`: `/pro/problems` initial 60, "Show more" loads the next 60 from
the network tab, source toggle refetches, counts read from `total`; `/problems`
same for the AI-Code-Fix tab.

---

## 9. Execution model

Subagent-driven development (`superpowers:subagent-driven-development`), same as
the onboarding flow: fresh implementer subagent per plan task, task review + fix
loop between tasks, final whole-branch review, ledger in
`.superpowers/sdd/2026-08-31-backend-polish/progress.md`.

**Task ordering (for the plan):**

1. Deps + `structlog` config + request-ID middleware + startup summary/probe
   (§6.1–6.4) — everything else logs through it.
2. Global exception handler (§3.4).
3. `slowapi` wiring + `/admin/login` limit + global default + `/health` exempt
   (§5.1).
4. `/debug` gating + CORS regex anchor (§5.2–5.3).
5. `source` / `status` validation (§3.2–3.3).
6. `GET /exercises` pagination — schema + endpoint + `list_summaries` rework +
   summary-list memoization (§4.1–4.2) + `CONTRACT.md`.
7. `/grade` background Firestore write + wrapper (§3.1, §4.3).
8. Convert remaining ad-hoc logging (§6.5).
9. Backend test updates + new tests (§7).
10. Frontend API client envelope (§8.1) + caller audit (§8.4).
11. `ProProblems.tsx` server paging (§8.2).
12. `ProblemListHome.tsx` server paging (§8.3).
13. Frontend verification pass (§8.5).

---

## 10. Risks

| risk | mitigation |
|---|---|
| `/exercises` envelope breaks an un-audited caller | §8.4 grep audit is a plan task; backend tests cover the shape |
| slowapi global limit trips the exercise-review tooling or a demo | 200/min is generous; `/health` + `/` exempt; limit values are one-line tunable |
| Railway proxy IP collapses all clients into one rate-limit bucket | acceptable for brute-force blunting; documented; per-client precision explicitly out of scope |
| structlog stdlib routing double-formats uvicorn lines | covered by the local boot check in §7.3; `ProcessorFormatter` is the standard pattern |
| rebase of `feat/backend-polish` onto post-merge `main` conflicts in the two list files | expected; the rebase happens before frontend tasks 10–13 start, against known-good onboarding versions |
| `firebaseauth.status()` helper doesn't exist and adding it touches init | keep it a pure read of `firebase_admin._apps` / a module flag; no init side effects |
