# Roadmap — Multiplayer Review Battles (Tier 3 #10)

**Team HackHive · Tech Eximius 2026 · 2026-08-29**

**Status: roadmap, not built.** The plan cut real multiplayer during the hackathon.
The frontend has a full simulated flow (`MultiplayerLobby` / `MultiplayerBattle` /
`MultiplayerResults`, driven by `frontend/src/store/battleStore.ts` on five fake
bots). The backend has nothing — `/grade` and `/leaderboard` are the only pieces a
battle would reuse, and they already exist.

This doc is the pick-up spec: a **~1-day async MVP** that ships on existing
endpoints, and a **full real-time version at ~5–8 person-days**. Nothing in the
MVP is thrown away to reach the real-time version — `match_id` is the WebSocket
room key, `GET /match/{id}` is the reconnect snapshot, the scoring helper is
shared.

Legend: **BE** = backend · **FE** = frontend · **prereq** = must land before the rows that depend on it.

---

## 1. Summary

### What it is

Two or more anonymous sessions review the **same** exercise file under a shared
timer, then see a head-to-head comparison. Correctness comes entirely from the
existing `/grade` path (`score_localisation` in Python + one Gemini call for the
explanation), so "battle skill" and "solo ladder skill" stay the same
measurement and the existing `/leaderboard` keeps working unchanged.

Two shipping stages:

| Stage | Transport | Feel | Effort |
|---|---|---|---|
| **MVP — async "challenge a friend"** | 7 s polling of one REST endpoint | "play it when you have five minutes"; opponent's result appears within ~10 s of them finishing | **~1 day BE**, ~3 days for a polished full-stack slice |
| **Full — synchronous battle** | WebSocket, one connection per player | live countdown, opponent progress, provisional → final scores | **~5–8 person-days** (includes the MVP work as its first slice) |

### Why roadmap, not built

- Real-time infra (room state, disconnect/reconnect, server-authoritative clock,
  the per-submission Gemini fan-out) is 5–8 days — more than the whole rest of
  Tier 3 combined, and the async MVP already demos the core idea.
- Anonymous `localStorage` sessions mean no accounts, no MMR identity, no
  collusion defence — all solvable, none free.
- Railway runs one Nixpacks service. In-process room state means **one replica**;
  the multi-replica story needs Redis, which is a scale concern, not a demo one.

### Headline effort

**MVP: ~1 person-day** (backend; ~3 for a demo-ready full-stack slice).
**Full real-time: ~5–8 person-days** — mid-case ~7, where the low end assumes the
existing mock `Multiplayer*` components drop onto a WebSocket hook with little
rework and Gemini behaves, and the high end covers Redis-readiness and
anti-cheat polish. Redis fan-out for >1 replica is **documented, not built**
(+1–1.5 days when actually needed).

---

## 2. MVP — async "Challenge a Friend" (~1 day BE)

### 2.1 Thesis

A "match" is a short code that (a) pins a fixed exercise set and (b) tags the
`Attempt` rows that belong to it. Standings are then a `GROUP BY session_id` over
rows the app already writes, scored with the **same** `0.7·catch + 0.3·explanation`
composite the leaderboard uses. No socket server, no synchronised clock, no
matchmaking.

### 2.2 New tables

`init_db()` runs `Base.metadata.create_all` on startup — idempotent for **new
tables**, so these are free:

```python
class Match(Base):
    __tablename__ = "matches"
    id:           Mapped[str]      = mapped_column(String(8), primary_key=True)   # 6-char Crockford base32, no I/O/0/1
    exercise_ids: Mapped[list]     = mapped_column(JSON, default=list)            # 1..5 curated ids
    created_by:   Mapped[str]      = mapped_column(String(64), index=True)        # challenger session_id
    created_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    expires_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True))       # created_at + 48h
    # full version adds: status, round_duration_s, rounds, starts_at (see §3)

class MatchParticipant(Base):
    __tablename__ = "match_participants"
    id:           Mapped[str]      = mapped_column(String(36), primary_key=True, default=_uuid)
    match_id:     Mapped[str]      = mapped_column(String(8), index=True)
    session_id:   Mapped[str]      = mapped_column(String(64), index=True)
    display_name: Mapped[str]      = mapped_column(String(40), default="")        # match-scoped nickname
    joined_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    # unique (match_id, session_id)
```

### 2.3 One column on `attempts`

```sql
ALTER TABLE attempts ADD COLUMN match_id VARCHAR(8);
CREATE INDEX ix_attempts_match_id ON attempts (match_id);
```

`create_all` never `ALTER`s an existing table, **but `db.py` already has the
mechanism** — add `match_id` to the `_ADDED_COLUMNS["attempts"]` dict and
`_ensure_columns()` runs the `ALTER` on boot, exactly as it already does for
`telemetry`, `seq`, etc. No hand migration, no Alembic.

### 2.4 New endpoints

| method + path | purpose |
|---|---|
| `POST /match` | create a challenge. Body `{session_id, exercise_ids?, tier?, display_name?}`. `exercise_ids` optional (1–5); if omitted the server picks **one curated** exercise (`source=curated`, not hidden, honouring `tier`). Returns `{match_id, exercise_ids, created_by, created_at, expires_at, share_path}`. |
| `GET /match/{id}` | metadata + live standings — **the poll target** for both the "waiting" and "results" screens. Returns `status` (`open` \| `expired`), `exercise_ids`, `participants[]`, `leader`. See §2.5. |
| `POST /match/{id}/join` | register before submitting so the challenger sees "Priya joined". Body `{session_id, display_name?}`. Idempotent per `session_id`. `404` on unknown id; `200` with `status:"expired"` on an expired match (viewing a finished challenge is legitimate). |
| `POST /grade` | **one new optional field** `match_id`. When present and valid (match exists, not expired, `exercise_id ∈ match.exercise_ids`) the new `Attempt` row is stamped with it. When invalid/expired: grade normally, leave `match_id` NULL, log a warning — **never 4xx**, a broken link must not cost the user their attempt. Auto-creates a `MatchParticipant` on first tagged grade if `/join` was skipped. Grading is otherwise byte-for-byte identical. |

### 2.5 `GET /match/{id}` response shape

```jsonc
{
  "match_id": "K7QP2A",
  "status": "open",                        // open | expired
  "exercise_ids": ["ex-012"],
  "created_at": "...", "expires_at": "...",
  "participants": [
    {
      "participant_id": "a1b2c3d4",        // sha1(match_id + session_id)[:8] — NOT the raw session_id
      "display_name": "Afrid",
      "done": 1, "of": 1,
      "catch_rate": 1.0, "avg_explanation": 0.8,
      "score": 0.94,                        // shared composite() helper
      "total_time_ms": 94000,              // sum of telemetry.time_to_submit_ms, null if any attempt lacked it
      "per_exercise": [
        { "exercise_id": "ex-012", "localisation_score": 1.0, "explanation_score": 0.8,
          "score_after_hints": 0.9, "hints_used": 0, "submitted_at": "..." }
      ]
    },
    { "participant_id": "e5f6a7b8", "display_name": "Priya",
      "done": 0, "of": 1, "catch_rate": null, "score": null, "per_exercise": [] }
  ],
  "leader": "a1b2c3d4"                      // top score; ties broken by lower total_time_ms; null if nobody done
}
```

- `participants` = every session in `match_participants` **union** every session
  with a `match_id`-tagged attempt.
- **Scoring rule:** for each `(session, exercise)` take the **first** tagged
  attempt only, so a retry can't farm a better number. (The weakness profile
  still records every attempt — unchanged.)
- **`participant_id` is `sha1(match_id + session_id)[:8]`, never the raw
  `session_id`.** A `session_id` is the only identity in this system — whoever
  holds it can read that user's `/profile` and `/progress` and submit `/grade`
  as them. The `you`-row pattern from `/leaderboard` (client passes its own
  `session_id` as a query param) lets a client still identify its own row.

### 2.6 Shared scoring helper (prereq, tiny)

Extract the composite from `leaderboard.py` so there is exactly one definition:

```python
# app/scoring.py  (new)
_W_LOC, _W_EXPL = 0.7, 0.3
def composite(catch_rate: float, avg_explanation: float) -> float:
    return round(_W_LOC * catch_rate + _W_EXPL * avg_explanation, 3)
```

`leaderboard.build_leaderboard` and the new `match.build_standings` both call it.

### 2.7 What the MVP fakes — and why it's fine

| Full version | MVP substitute | Why acceptable for v1 |
|---|---|---|
| Real-time lobby with presence | poll `GET /match/{id}` every 7 s; "waiting for opponent" spinner | a challenge is async *by framing*; sub-10 s staleness is invisible |
| Synchronised server countdown | per-client soft timer, advisory only, not enforced | a hard clock needs a server clock authority = real-time infra. Speed is still captured: ties sort by `total_time_ms` from existing telemetry |
| Matchmaking / ranked queue | none — friend-to-friend link only | Tier 3 #10 is "battle a **friend**". Queue is a fast-follow, fully additive |
| Live opponent progress ("on line 14") | coarse `done: 0/1` from polling | keystroke-level presence has no learning value in v1 and is pure infra |
| Push notification on opponent finish | poll only | no notification infra exists today |
| Server-enforced "can't see opponent's answer" | nothing — `GET /exercises/{id}` already ships **zero** answer data | no leak exists to plug; the only cheat (looking up the fix elsewhere) is already surfaced by `/grade` integrity telemetry |
| Real usernames / accounts | `display_name` is a match-scoped nickname, defaulting to the participant id | anonymous sessions are a deliberate product choice; per-match nicknames don't drag in auth |
| Bespoke battle score (speed bonus, FP penalty — as the mock shows) | reuse `0.7·catch + 0.3·expl`; tiebreak on `total_time_ms` | one scoring definition across leaderboard + match. A divergent formula is a real design decision, not a blocker — add it as a separate `match_score` field later (§3.6) |
| AI-vs-human comparison on results (mock `mockAIComparison`) | call existing `POST /ai-review` per exercise on the results screen | `/ai-review` is already cached per exercise and needs no match awareness; ~0.25 d of FE for a strong demo beat |

### 2.8 How it looks to the user

1. On the exercise list or a result screen: **"Challenge a friend"** → `POST /match` → a
   share link `codesight.app/challenge/K7QP2A` and a "copy link" button.
2. Challenger lands on a **waiting screen** polling `GET /match/{id}` every 7 s:
   "Waiting for your opponent… link copied."
3. Friend opens the link, picks a nickname (`POST /match/{id}/join`), reviews the
   **same file** in the normal review workspace, submits through `/grade` with
   `match_id` attached.
4. Both land on a **results table** fed by `participants`: side-by-side
   localisation score, explanation score, total time, a `leader` highlight, and
   the three cosmetic badges (`Most Precise` = top `catch_rate` with 0 strays,
   `Best Explanation` = top `explanation_score`, `Fastest Correct` = best time
   among `localisation_score ≥ 0.5`).
5. Match stays `open` for 48 h, then `status: "expired"` with whatever partial
   standings exist ("1 of 2 played").

### 2.9 Frontend work

Swap `battleStore.ts` mock actions for real calls, add a 7 s polling hook, a
"copy challenge link" flow, and feed the results table from `participants`. Keep
the existing mock lobby visuals; reuse the single-player review component
verbatim for the battle screen. Delete `frontend/src/mock/battle.ts`,
`mockOpponents`, `mockBattleResults`.

### 2.10 MVP failure modes

| Failure | Handling |
|---|---|
| Opponent never plays | match stays `open` until `expires_at` (48 h), then `expired` with partial standings. No cleanup job for the demo; a daily `DELETE FROM matches WHERE expires_at < now() - interval '7 days'` is a 10-line fast-follow |
| One person opens the link on two devices | two `localStorage` sessions → two participants. Dedupe is impossible without identity; accepted. `/join` idempotent per `session_id` keeps each device stable |
| Participant re-submits the match exercise | `GET /match/{id}` counts only the **first** tagged attempt per `(session, exercise)`. Weakness profile still records both |
| Challenger picks a generated exercise that later gets hidden | `GET /exercises/{id}` still resolves hidden exercises, so the match completes. Mitigated by preferring `source=curated` at create time |
| `match_id` sent to `/grade` for an unknown/expired match | grade normally, drop the tag, log. User keeps their attempt and grade |
| Gemini down during a match | `/grade` already degrades (`explanation.score = 0.0`, verdict `weak`). Match still scores, effectively on localisation — **symmetric** for both players |
| Client timer drift / clock skew | timer is advisory; nothing depends on client time. All timestamps come from `Attempt.created_at` (server) |
| Short-code collision | 6 chars from a 32-symbol alphabet ≈ 1e9 space; check-and-retry up to 3× on insert |
| Scripted `POST /match` abuse | none mitigated in MVP (same posture as the rest of the API). Fast-follow: per-IP rate limit + cap open matches per `created_by` |

---

## 3. Full real-time version (~5–8 person-days)

### 3.1 Transport decision

| Path | Choice | Why |
|---|---|---|
| **Player** | **WebSocket**, one connection per player per battle | the round is bidirectional and latency-sensitive: `submit`, opponent progress, live countdown, round transitions. SSE + companion POSTs is two transports to keep alive; polling can't push a countdown |
| **Spectator / live-standings viewer** | **SSE**, or 3 s polling | one-way, `EventSource` auto-reconnects, sails through proxies. Not worth a WebSocket for read-only viewers |
| **Cold load / reconnect / crawler** | **`GET /match/{id}`** (the MVP endpoint, unchanged) | the socket layer is a *push on top of the same query*; the frontend renders from one code path regardless of transport |

**FastAPI mechanics.** The existing route handlers are sync `def` (Starlette
threadpool). WebSocket handlers must be `async def` — both coexist fine. **The
trap:** `SessionLocal` is sync psycopg; calling it inside an async coroutine
blocks the event loop for every other room. Wrap every DB / Gemini call from
async code in `run_in_threadpool`. **Do not** migrate to async SQLAlchemy for
this — too much churn; the threadpool bridge is enough at this scale.

**Railway specifics.** The edge proxy passes WebSocket upgrades by default (no
config flag); add `websockets` to `requirements.txt` (Starlette picks it up).
Idle connections through the edge are cut around 60 s → an **app-level heartbeat
is mandatory**. Nixpacks already starts `uvicorn app.main:app`; no start-command
change. WebSocket bypasses the CORS middleware, so check `Origin` by hand in the
handler, mirroring `config.ALLOWED_ORIGIN_REGEX`.

### 3.2 The single-vs-multi-replica caveat (spelled out)

Room state lives **in-process**: `registry: dict[room_code, Room]`, one
`asyncio.Task` per active room driving timers and broadcasts, a per-room
`asyncio.Lock` around state mutation. Railby gives **no sticky-session guarantee**
across replicas. With 2+ replicas this design breaks concretely:

1. **Players land in different processes.** Alice's socket terminates on replica
   A, Bob's on replica B; each replica's `registry` has its own `Room` for the
   same code. They never see each other's `ready` or progress — effectively two
   separate 1-player battles.
2. **Broadcasts don't cross processes.** `room.broadcast()` iterates a
   `set[WebSocket]` held in one process.
3. **Quick-match queue is per-process.** Two waiters on two replicas never pair.
4. **Duplicate room tasks.** Each replica spins its own timer task for the same
   code → two countdowns, two `round_start` frames with different deadlines.
5. **Redeploy / crash drops everything** — even at 1 replica. A deploy restarts
   the process, every socket closes, every `Room` is gone; clients reconnect to
   `error: unknown_room`.

What does **not** break: the durable `matches` / `battle_submission` / `Attempt`
rows (they're in Postgres) and `GET /match/{id}` for finished battles.

**Fixes, cheapest first:**

- **Demo:** pin to **1 replica**, disable autoscale, don't deploy during the demo
  window. Honest and sufficient. Document points 1–5 as the known limit.
- **Real:** put room state + pub/sub fan-out behind a `RoomStore` interface from
  **day one** (in-process impl now), then add a Redis impl — room state as a
  Redis JSON/hash with a 1 h TTL, broadcasts via Redis pub/sub keyed by room
  code, one elected room task per room (Redis `SETNX` lock with heartbeat
  renewal), quick-match queue as a Redis list. Railway has a one-click Redis
  plugin (`REDIS_URL`). Each replica still terminates its own sockets; Redis
  carries state and fan-out between them. **+1–1.5 days if the interface exists
  from day one; ~1.5+ if retrofitted.** Not built for the demo.
- **Alternative:** run battles in a dedicated worker service (`replicas=1`) while
  the main API scales freely; the frontend connects to the worker's URL for
  battle. Avoids Redis; reintroduces the single-point-of-failure and the
  redeploy problem.

### 3.3 Room lifecycle

```
lobby → countdown → active → settling → results
                                  └── aborted   (ranked drops <2 before results, or host cancels in lobby)
```

| Phase | What happens |
|---|---|
| **lobby** | players toggle ready; host starts. **The exercise code is in no message yet.** New players allowed here only |
| **countdown** | fixed **5 s** (`3 – 2 – 1 – go`); its only job is to synchronise the reveal. Clients render from `starts_at − server_now`, never a local `setTimeout` chain |
| **active** | `round_start` fires, code delivered to all clients **on one server tick**, `round_deadline` (epoch ms) set. First frame that contains the file |
| **settling** | deadline passed; explanation grades still draining (§3.5) |
| **results** | all submissions settled, or the settle deadline hit; server then closes sockets |
| **aborted** | ranked match drops below 2 players before results, or host cancels in lobby |

**Timer is server-authoritative.** The authoritative fact is `round_deadline`;
the client's ticking clock is cosmetic. A client that moves its system clock
forward gains nothing — every `submit` is validated against the server's
`round_deadline` (+ ~2 s network grace). At the buzzer the server **auto-submits
each player's last autosaved draft** (§3.4) so a slow finisher still banks
localisation credit.

Defaults: **180 s** per round (matches the mock and the current FE), host-selectable
120 / 180 / 300 in friendly, fixed 180 in ranked. **1 round MVP**; the schema
carries `rounds` / `round` from day one so best-of-3 is a config flag, not a
migration.

**Reconnect & disconnect.**

- **Heartbeat:** client sends `ping` every 20 s; server replies `pong` and drops
  a socket with no frame for 45 s (Railway's edge cuts idle ~60 s; not every
  proxy forwards WS control frames, so app-level ping is required).
- **Client reconnect:** exponential backoff (0.5 / 1 / 2 / 4 s, cap 5 s,
  jittered), reusing the same `room_code` + `player_token`; on reopen it sends
  `join` with the token, server matches the existing slot and replies with a
  fresh `room_state` (+ `round_start` if a round is live).
- **Server-side grace:** on `WebSocketDisconnect` the player is marked
  `connected: false` but the slot is held for the **remainder of the round**
  (30 s in `lobby`). Broadcast `room_state` so opponents see "Alice
  (reconnecting…)". Rejoin within the window → restore silently. Never returns →
  the buzzer auto-submits the last autosaved draft; a missing draft scores 0 for
  that round (`verdict: "no_submission"`), battle continues with the rest.
- **Draft autosave:** client sends `draft_update` (debounced ~5 s) with
  `selected_lines` + `explanation` + `telemetry`; server keeps the latest per
  player.
- **Idempotency:** second `submit` for a round → `error: already_submitted`,
  no-op. `join` with a token already on a live socket → close the **old** socket,
  attach the new one (handles two-tabs / stale connection).

### 3.4 WebSocket message schema

JSON frames, `{ "type": ..., ... }`. `session_id` is sent **once**, in the
connect query string or the first `join` frame — it is **never echoed in an
outbound frame**; every outbound reference to a player is `participant_id`
(`sha1(match_id + session_id)[:8]`, §2.5).

**Client → server**

| type | payload | when |
|---|---|---|
| `join` | `session_id`, `display_name`, `player_token?` | first frame after connect; `player_token` only on reconnect |
| `ready` | — | in lobby |
| `draft_update` | `selected_lines: int[]`, `explanation: string`, `telemetry: {...}` | debounced ~5 s during `active` |
| `submit` | `round`, `selected_lines: int[]`, `explanation: string`, `hints_used`, `telemetry` | once per round during `active`; later `submit`s for that round rejected |
| `forfeit` | — | explicit give-up: round score 0, state `forfeited` |
| `leave` | — | explicit quit |
| `ping` | `t: number` | every 20 s |

**Server → client**

| type | payload | notes |
|---|---|---|
| `room_state` | `status`, `players: [{participant_id, display_name, connected, ready, tier}]`, `round_index`, `you: {participant_id, player_token}` | **full snapshot**, sent on join and any roster change — a reconnecting client resyncs from one frame |
| `countdown` | `seconds` (3→1), `starts_at`, `server_now` | before each round |
| `round_start` | `round`, `exercise: {id, filename, language, code, line_count}`, `deadline: epoch_ms`, `server_now` | `deadline` is absolute server time; client renders its own countdown to it |
| `opponent_progress` | `participant_id`, `state: "reading" \| "submitted"` | deliberately coarse — no line selections, no score mid-round |
| `submission_provisional` | `participant_id`, `localisation: {score, verdict}`, `score_so_far`, `rank` | emitted the instant a `submit` lands — the 0.7-weighted term only |
| `submission_settled` | `participant_id`, `breakdown: {base, speed_bonus, fp_penalty, hint_mult, total}`, `integrity_verdict` | emitted when the Gemini call returns (or falls back); standings re-sort |
| `round_result` | `round`, `per_player: [{participant_id, loc_score, explanation_score, verdict, selected_lines}]`, `real_lines`, `scores` | running totals; sent once all submissions for the round have settled or the settle deadline hit |
| `battle_result` | `placement: [{participant_id, display_name, final_score, badges}]`, `battle_id` | terminal; server then closes the socket |
| `error` | `code`, `message` | e.g. `room_full`, `battle_started`, `already_submitted`, `unknown_room`, `bad_frame` |
| `pong` | `t` (echo) | heartbeat reply |

Design notes that constrain the FE / persistence:

- **`deadline` is absolute server epoch, not a duration** — a client reconnecting
  8 s in computes the right remaining time and can't gain free seconds.
- **`room_state` is a full snapshot** — reconnect = reattach + one `room_state`
  (+ `round_start` if mid-round). No incremental replay to implement.
- **`submission_provisional` before `submission_settled`** is the two-phase
  scoring contract (§3.5); the FE shows "provisional" then "final" so the resort
  is expected, not jarring.

### 3.5 Live scoring — handling per-submission Gemini latency

`score_localisation` is pure Python (<1 ms). `grade_explanation` is **one Gemini
call** — temp 0, cached by `(exercise, selected_lines, explanation)` hash,
~1–4 s warm, up to ~10 s with the existing 503/429 backoff, graceful
`explanation_score: 0.0` fallback on failure. In a live race that latency and
that fan-out (up to 8 players × N rounds) are the whole design problem.

**Two-phase scoring:**

1. **On `submit` → provisional, immediately.** Compute localisation, emit
   `submission_provisional` with `0.7 · localisation_score` mapped to points and
   a provisional rank. Player's state badge flips to "grading explanation…".
2. **Enqueue the Gemini call** on a bounded pool (`asyncio.Semaphore(3)` around
   the grader), run via `run_in_threadpool` so a slow call never freezes another
   room's countdown. On return (or fallback) emit `submission_settled` with the
   full breakdown; standings re-sort.
3. **Results don't lock** until every submission is settled **or**
   `round_deadline + 30 s` passes. Anything still pending at that deadline
   settles on the existing fallback (`explanation_score 0.0`, "explanation
   grading timed out" in its breakdown).

**Why this is acceptable:** the exact, instant part is the **0.7-weighted** term.
Provisional ranking is usually the final ranking; only the 0.3 explanation term
shifts.

**Thundering herd at the buzzer** (N players submitting within one second → N
cold Gemini calls into an API that already 429s under load):

- **Bounded concurrency** — `Semaphore(3)`. Worst case 8 players / 3 / ~3 s ≈ 9 s
  to drain, inside the 30 s settle window.
- **Pre-warm** — grade **the moment a player submits**, not at the buzzer. Most
  players submit early, so the load spreads across the round instead of spiking.
- **Reuse `grader._cache`** — identical `(exercise, lines, explanation)`
  submissions (empty answers, "looks clean") are free hits; same exercise for
  everyone maximises this.
- **Total Gemini-down** — the whole room settles on the fallback →
  `explanation_score 0` for everyone → **symmetric**. The match still completes
  and still ranks on the localisation term. This is the graceful-degradation
  story for judges: the race never hard-fails on a flaky dependency.

### 3.6 Data model

**Evolve `matches`, don't fork it.** The MVP `matches` table gains columns via
the `db.py` `_ADDED_COLUMNS` shim — `match_id` stays the join key forever and
becomes the WebSocket room name:

```
matches   (+ status varchar(16)      -- lobby | in_progress | finished | aborted
           + mode varchar(8)          -- friendly | ranked
           + round_duration_s int
           + rounds int
           + tier_band varchar(16)
           + starts_at timestamptz null
           + finished_at timestamptz null)
```

**New table** for the richer per-submission detail a battle produces:

```
battle_submission (
  match_id      varchar(8)  fk,
  round         int,
  session_id    varchar(64),
  selected_lines json,
  explanation   text,
  hints_used    int,
  localisation_score  float,
  explanation_score   float,
  integrity_score     float null,
  integrity_verdict   varchar(16),
  telemetry     json null,
  base          float,        -- 1000 * composite(...)
  speed_bonus   float,
  penalty       float,        -- false-positive penalty
  total         float,
  submitted_at  timestamptz,
  settled_at    timestamptz null,
  state         varchar(16),  -- reviewing | submitted | provisional | settled | forfeited
  primary key (match_id, round, session_id)
)
```

**Also write a normal `Attempt` row per settled submission** (reuse the `/grade`
write path), tagged with `match_id` and `source="battle"`, so battle practice
still feeds the weakness profile and the solo `/leaderboard`. Consequences to
decide (§6): a battle advances your solo standings (good loop, but farmable — no
worse than today's no-auth posture). If it matters, add a nullable `mode` column
to `attempts` and filter `build_leaderboard` to `mode='solo'` — a one-line change
handled by the same `db.py` shim.

**Battle score** lands as a `match_score` computed field *alongside* the reused
`composite()`, so the leaderboard formula and the battle formula can diverge
without a rewrite:

```
base        = 1000 * composite(mean(localisation_score), mean(explanation_score))   # shared helper
hint_mult   = score_multiplier(hints_used)                                          # reused: 1.0 / 0.9 / 0.75 / 0.5
speed_bonus = round(200 * time_left / round_duration)  IF localisation_score >= 0.5 ELSE 0
fp_penalty  = -150  IF localisation.verdict == "false_positive"  ELSE 0
match_score = max(0, base * hint_mult + speed_bonus + fp_penalty)
```

Winner = highest `match_score`; ties → earlier `submitted_at` → higher
`localisation_score` → `session_id` (matches the leaderboard's tie-break style).

### 3.7 Migration path: MVP → full, nothing thrown away

1. **`match_id` is the join key forever** — becomes the WebSocket room name;
   attempts stay tagged identically; historical matches keep resolving through
   `GET /match/{id}`.
2. **`GET /match/{id}` stays** as the cold-load / reconnect / crawler snapshot.
   The socket layer is a push on top of the same query: after each tagged
   `/grade` commits (or each `submission_settled`), publish a `match.update` to
   room `match_id`. **Same JSON** as the REST `participants` array — the FE
   renders from one code path.
3. **Transport without a second service** — FastAPI does WebSockets natively; an
   in-process `dict[str, set[WebSocket]]` pub/sub is enough for one replica
   (~1 day). Redis is only needed past 1 replica and hides behind `publish()`.
4. **Synchronised timer becomes real here** — `matches` gains `starts_at` /
   `round_duration_s`; server is the clock. Late `/grade` (server time >
   deadline) is flagged `late: true` in results, not rejected (fallback path).
5. **Lobby / ready-up** is the `status` state machine (`lobby → in_progress →
   finished`) driven by `ready` socket messages, REST fallback
   `POST /match/{id}/ready`. MVP's `open / expired` maps onto
   `in_progress / finished`.
6. **Matchmaking queue** is a new `POST /match/queue` that pairs two waiting
   sessions of similar leaderboard `score` and returns a `match_id`. Rest of the
   pipeline untouched.

---

## 4. Fairness & anti-cheat

Built to reuse the existing `/grade` internals so "battle skill" and "ladder
skill" stay the same measurement.

### 4.1 Match format

- **2–8 players.** Below 2 the match can't start; above 8 the results screen and
  the per-submission Gemini fan-out get unpleasant. **4 is the sweet spot** and
  what the mock already shows.
- **One shared exercise per round.** Every player reviews the *identical* file —
  same stimulus, same ground truth, same deterministic localisation scoring.
  This is the core fairness guarantee.
- **Two modes:** `friendly` (host + 6-digit code, no MMR, hints allowed, bots may
  fill seats — clearly labelled) and `ranked` (server matchmaking only — you
  can't pick your room, see collusion; hints disabled; telemetry mandatory;
  affects MMR).

### 4.2 Exercise selection (server-side, at match start)

1. **Tier band** = the mode of participants' tiers from `GET /session/{id}` (ties
   → lower tier, so nobody is out of their depth).
2. Candidate pool = **`source=curated` only**. The 983 generated exercises are
   "LLM, unvalidated"; an unfair or broken exercise in a live race is
   unrecoverable. Non-negotiable for ranked.
3. **Exclude any exercise any participant has an `Attempt` row for** (query
   `Attempt` by the participant `session_id`s). Prior exposure is the single
   biggest unfairness.
4. Pick deterministically from a `match_id` seed so a re-roll is reproducible;
   **persist `exercise_ids` on the match row before anyone sees it.**
5. Pool-exhaustion ladder: widen the tier band → allow a repeat for whoever has
   seen it least → fall back to a small **battle-only holdout set** (curated
   exercises withheld from solo `/exercises`).

### 4.3 Timer & scoring blend

- **Server-authoritative timer**, `round_deadline` (epoch ms) in every relevant
  frame; client clock is cosmetic; `submit` validated server-side against the
  deadline + ~2 s network grace (§3.3).
- **Scoring blend** = the leaderboard's `0.7 · localisation + 0.3 · explanation`
  as `base`, via the shared `composite()` helper, then the `match_score` layer
  (`hint_mult`, `speed_bonus` gated on `localisation_score ≥ 0.5`, `fp_penalty`
  for a `false_positive` verdict — §3.6). The gate + penalty kill the two race
  exploits: "submit garbage in 3 s for max speed" and "spray-click every line".
- **Badges** (cosmetic, from the breakdown): `Most Precise`, `Best Explanation`,
  `Fastest Correct`.
- **Prereq refactor (~0.25 pd):** `grade()` in `main.py` currently fuses scoring
  + `Attempt` persistence + response shaping. Extract `grade_core(req) ->
  GradeResult` (pure, no DB write). Then `POST /grade` and the battle settler run
  the **identical** scoring code and can't drift.

### 4.4 Reuse of the existing integrity telemetry

`score_integrity` (in `app/integrity.py`) already turns optional behavioural
telemetry into a `clean | review | flagged` verdict. Battle reuses it with
**tuned constants passed in, not a fork:**

- **Telemetry mandatory in ranked** — a ranked `submit` with no `telemetry` block
  is rejected (opting out = opting out of MMR). Optional in friendly, as in solo.
- **Tighter battle thresholds:** `_BLUR_MS_CONCERN` 15 000 → **8 000** (8 s
  off-tab in a 180 s race is far more suspicious than in an untimed drill); any
  `paste_count > 0` on the explanation → auto-flag; `_FAST_MS_PER_CHAR`
  unchanged (typing physics don't speed up under pressure).
- **Verdict handling:** a `flagged` submission is **still scored and still shown
  live** (don't stall the room, don't tip the cheater off), but it is (a)
  excluded from ranked MMR, (b) badged in results, (c) written to the existing
  `GET /session/{id}/integrity` mentor view, (d) on repeat, routed to a shadow
  pool — matched only against other flagged sessions.
- **Focus timeline, not just aggregates:** battle clients report
  `visibilitychange` / `blur` / `focus` as a timestamped list, so the mentor
  view shows "left tab 0:45, back 1:10, submitted 1:12".

### 4.5 Synchronous-only guards

- **One WebSocket per `session_id` per match** — a second connection is refused
  (or takes over, dropping the first). Stops one person opening N tabs as N
  "players" or as a self-spectator reading the code.
- **Code never leaks early** — in no message before `round_start`; delivered to
  all clients on one server tick.
- **Answer data never client-side** — `real_lines`, `fix_diff`, `reference` stay
  server-side, same discipline as `/grade` today.
- **Idempotent submits** keyed on `(match_id, round, session_id)` — pre-buzzer
  last-write-wins (revisions allowed), post-buzzer rejected.
- **Late join is closed** once `countdown` starts — a latecomer on the same fixed
  timer has strictly less time. Post-start arrivals with the code join as
  **spectators**: redacted state (roster, standings, timer), **not the code**,
  cannot submit; full detail unlocks at `results`. Spectators capped at 20,
  throttled to 1 standings update/s.
- **Collusion** (two real people helping each other) can't be fully solved
  without identity. Mitigations: ranked matchmaking is random; two sessions that
  repeatedly co-occur with correlated submit timing get flagged for review;
  friendly rooms are explicitly "unranked, play with friends" so it doesn't
  matter there.

### 4.6 Forfeit / rage-quit / abort

| Situation | Handling |
|---|---|
| Tab close / WS drop, no return | last autosaved draft auto-submitted at buzzer; **not** marked "forfeited" (they were present, may have real work saved) |
| Explicit **Forfeit** button | round score 0, state `forfeited`, greyed in results; no speed bonus, no penalty |
| Ranked forfeit / no-return | counts as an MMR loss + increments an abandon counter; repeat abandoners get a short matchmaking cooldown. Friendly: no penalty |
| **All** opponents quit, one player left | match still completes and grades solo, but ranked MMR gain is **voided** — you can't gain rating against nobody. Kills quit-farming |
| Host quits in lobby | host role migrates to the next-joined player |
| Host quits mid-match | match continues untouched — the clock is server-owned; host powers (start/cancel) exist only in `lobby` |
| Player idle, never submits, never leaves | buzzer auto-submits empty draft → localisation `miss` (0), explanation fallback (0), total 0; state `submitted`, not `forfeited` |
| Replica restart / deploy mid-match | on `SIGTERM`: stop accepting new matches, let running matches finish inside the shutdown grace window, persist each submission as it settles. On boot, any `matches` row still `in_progress` and older than `max round duration + settle` → `aborted`; its players get a "match interrupted" screen (ranked: no MMR change) |

---

## 5. Effort breakdown

Whole feature: **~5–8 person-days**, mid-case ~7. The MVP (row A) is
independently shippable and is the first slice of the full build, not extra work.

| # | Component | Est. | Depends on | Notes |
|---|---|---|---|---|
| **P** | Prereq refactor: `app/scoring.py` `composite()` extracted from `leaderboard.py`; `grade_core(req) -> GradeResult` (pure scoring, no DB write) | 0.5 d | — | **must land first**; unblocks A, E, §4.3 |
| **A** | **MVP async challenge** — `Match` + `MatchParticipant` tables; `match_id` on `attempts` via the `db.py` `_ADDED_COLUMNS` shim; `POST /match`, `GET /match/{id}` (+ standings builder), `POST /match/{id}/join`; `match_id` field on `/grade`; Pydantic schemas; ~5 pytest cases | 1.0 d BE | P | ships standalone |
| **A-FE** | Swap `battleStore` mock → real calls; 7 s polling hook; copy-link flow; results table from `participants`; `/ai-review` on results; delete `mock/battle.ts` | 0.5–1.5 d FE | A | 0.5 d if the mock visuals are kept and only piped real data; 1.5 d for a polished slice (nicknames, badges, expiry UX) |
| **B** | WS transport: `/ws/battle/{room_code}`, `ConnectionManager`, hand-rolled Origin check, `websockets` dep, `RoomStore` interface + in-process impl, Railway WS verify | 0.75 d BE | — | `RoomStore` interface **now** so Redis is a drop-in, not a rewrite |
| **C** | Room lifecycle: state machine (`lobby → countdown → active → settling → results`), per-room `asyncio.Task` + `Lock`, server-authoritative clock, 20 s heartbeat + 45 s timeout, reconnect grace + `player_token` + `draft_update` autosave | 1.5 d BE | B | the core of the real-time work |
| **D** | Message protocol both directions + React WS hook (connect, `player_token`, backoff reconnect, heartbeat, snapshot resync) + wire `MultiplayerLobby` / `MultiplayerBattle` / `MultiplayerResults` off the mock (round transitions, opponent progress, results screen) | 1.5 d (BE+FE) | C | reuses the single-player review component in the battle screen |
| **E** | Two-phase scoring: `submission_provisional` (localisation) + `submission_settled` (deferred Gemini via `run_in_threadpool` + `Semaphore(3)` + pre-warm + 30 s settle deadline); `match_score` layer (`speed_bonus`, `fp_penalty`, `hint_mult`) + badges on top of `composite()` | 1.0 d BE | P, C | degrades exactly like `/grade` if Gemini is down |
| **F** | Durable model: evolve `matches` (status / mode / round_duration_s / rounds / tier_band / starts_at) via the shim; new `battle_submission` table; per-submission `Attempt` write; `GET /match/{id}` results shape extended; matchmaking — 6-char codes, `POST /match` (room), `POST /match/queue` quick-match (single-replica) | 0.75 d BE | C | `matches` stays the one join key |
| **G** | Fairness + anti-cheat: exercise selection (curated, exclude seen, tier band, holdout fallback); forfeit / host-migration / solo-completion + ranked-MMR-void; battle telemetry thresholds into `score_integrity`; mandatory-telemetry gate (ranked); one-WS-per-session; `flagged` → exclude/shadow; focus timeline; spectator redaction | 1.0 d BE | E | reuses `score_integrity` with tuned params, no fork |
| **H** | Hardening: pin `replicas=1` + disable autoscale; `SIGTERM` drain; stale-match cleanup on boot; fake-clock + simulated-buzzer-herd tests; end-to-end on Railway (Vercel → Railway WS) | 0.75 d | all | |
| — | *Redis fan-out for >1 replica — **documented, not built***; if built later | *+1–1.5 d* | B (interface) | only when scaling past one replica |
| — | *Separate battle leaderboard (`GET /battle/leaderboard`, ranked by wins / `match_score`) — optional; sidesteps the solo-ladder-farming question* | *+0.25 d* | F | |

**Sum P + B–H (full real-time, MVP folded in): ~7.75 d optimistic** → the stated
5–8 range is the mid-case where D's frontend wiring goes smoothly and Redis stays
deferred. **A + A-FE alone (async MVP): ~1.5–3 d**, backend-only ~1 d.

### What must land first

1. **P** (scoring refactor) — everything scoring-related depends on it, and it's
   half a day.
2. **A** — the MVP; also proves the `matches` / `match_id` / standings shape the
   real-time version builds on.
3. **B** before **C/D/F** — no room lifecycle without a transport and a
   `RoomStore` interface.
4. **C** before **E/G** — provisional/settled scoring and anti-cheat guards hang
   off the room task and its state machine.
5. **H** last, but pin `replicas=1` on day one so nothing is tested against a
   broken multi-replica assumption.

### Reuse vs. build

- **Reuse unchanged:** `score_localisation`, `grader._cache`, `score_multiplier`,
  `/ai-review` (results screen), `Attempt` + weakness profile + `/session/{id}`
  tier lookup, the `0.7 / 0.3` leaderboard weighting (as the battle `base`),
  `GET /leaderboard`.
- **Reuse with tuned params:** `score_integrity` (battle thresholds).
- **Build:** `app/scoring.py`, `grade_core()`, `app/match.py` (standings +
  create/join), room manager + WS layer + `RoomStore`, `match_score`, matchmaking
  / MMR, `battle_submission` table + `matches` columns, the React WS hook.

### Files a future team will touch

- `backend/app/models.py` — `Match`, `MatchParticipant`, `battle_submission`; `match_id` + `source` on `Attempt`
- `backend/app/db.py` — add `match_id` (and later `mode`) to `_ADDED_COLUMNS["attempts"]`; `matches` columns for the full version
- `backend/app/scoring.py` — **new**, extracted `composite()`
- `backend/app/leaderboard.py` — call the shared helper; later `mode='solo'` filter
- `backend/app/match.py` — **new**, standings builder + create/join logic
- `backend/app/battle/` — **new**, `ws.py` (WS endpoint), `room.py` (state machine + timer task), `store.py` (`RoomStore` interface + in-process impl), `scoring.py` (`match_score` + badges)
- `backend/app/main.py` — `grade_core()` extraction; register `POST /match`, `GET /match/{id}`, `POST /match/{id}/join`, `/ws/battle/{code}`; `match_id` handling in `/grade`
- `backend/app/grader.py` — expose the grade call for the deferred settler (already `_cache`-backed)
- `backend/app/integrity.py` — accept tuned battle thresholds as params
- `backend/app/schemas.py` — `MatchCreateRequest`, `Match`, `MatchStanding`, `MatchParticipantOut`; `match_id` on `GradeRequest`
- `backend/requirements.txt` — add `websockets` (and later `redis`)
- `CONTRACT.md` — `## POST /match` / `## GET /match/{id}` / `## POST /match/{id}/join` sections; one line under `## POST /grade`; WS frame reference
- `frontend/src/store/battleStore.ts` — replace mock actions with real calls + polling, then the WS hook
- `frontend/src/lib/` — **new** `battleSocket.ts` (WS hook: connect, `player_token`, backoff reconnect, heartbeat, snapshot resync)
- `frontend/src/pages/MultiplayerLobby.tsx` / `MultiplayerBattle.tsx` / `MultiplayerResults.tsx` — feed real data; reuse the single-player review component
- Delete `frontend/src/mock/battle.ts`, `mockOpponents`, `mockBattleResults`

---

## 6. Open questions

Calls a future team still has to make.

| # | Question | Context / lean |
|---|---|---|
| 1 | **Do battle attempts feed the solo `/leaderboard` and weakness profile?** | Writing a tagged `Attempt` per submission gives a clean one-activity-both-progressions loop, but battle mode can then farm the solo ladder. No worse than today's no-auth posture. Lean: write the `Attempt`, tag `source="battle"`, add the `mode` filter only if farming shows up. Alternative: a separate `GET /battle/leaderboard` (+0.25 d) sidesteps it entirely |
| 2 | **MVP battle score: reuse `composite()` or ship the bespoke `match_score` from day one?** | The mock already shows a speed bonus + FP penalty. Reusing `composite()` keeps one definition; the bespoke formula is a real product decision. Lean: `composite()` for the MVP, `match_score` as an additive field in the full version |
| 3 | **Last-opponent-standing: walkover, or abort?** | If everyone else quits mid-battle, does the remaining player get a win (walkover) or does the match `abort` with no result? Ranked MMR gain is voided either way. Product decision — flag it in the lobby copy |
| 4 | **Ranked mode at all for the hackathon, or friendly-only?** | Ranked needs matchmaking + MMR + mandatory telemetry + collusion handling — most of row G. Friendly-only (share a code) is a much smaller build and still demos. Lean: friendly-only for the first real-time cut, ranked as a fast-follow |
| 5 | **MMR system:** Elo, Glicko, or a simple rating? | Only matters once ranked exists. Anonymous sessions make rating volatile (new session = provisional rating every time). Lean: simplest possible (Elo, K=32) or defer |
| 6 | **Bot fill for friendly rooms** — keep the five mock bots as a real "practice vs bot" mode? | The FE already renders them. A bot that submits a canned answer at a random time is cheap and useful for solo testing. Lean: keep as a labelled `friendly` option, never in ranked |
| 7 | **Redis now or later?** | The `RoomStore` interface makes it a drop-in. If the team expects >1 replica during judging (they shouldn't need it), build it; otherwise document and pin `replicas=1`. Lean: later |
| 8 | **Multi-round (best-of-3) in v1?** | Schema carries `rounds` / `round` from day one. More rounds = more Gemini calls = more settle-window pressure. Lean: 1 round for the first cut, flip the flag once the settle path is proven |
| 9 | **Spectators in v1?** | Redacted SSE stream, capped at 20. Nice for a demo ("watch the battle on the projector") but pure addition. Lean: cut from the first cut, add if time |
| 10 | **`display_name` moderation** — free text from an anonymous client. | Cap at 40 chars, render as text (no HTML). Profanity filter out of scope for v1 — decide if that's acceptable for a public demo |
| 11 | **Exercise pool for battles** — is 19 curated exercises enough to run repeated battles without repeats? | The "exclude any exercise a participant has seen" rule burns the curated pool fast. May need the battle-only holdout set, or to accept repeats sooner, or to fast-track generated-pool review |

---

## Bottom line

The async MVP is **~1 backend day** and demos the core idea on endpoints that
already exist — one new table pair, one nullable column (via a mechanism `db.py`
already has), three thin endpoints, one `/grade` field. The full synchronous
battle is **~5–8 person-days**: WebSocket transport on the existing FastAPI app,
in-process room state pinned to one replica (Redis documented for scale),
two-phase scoring that keeps the Gemini call off the round's critical path, and
fairness/anti-cheat that reuses `score_localisation`, `score_integrity`, and the
`0.7 / 0.3` blend so battle skill and ladder skill stay the same number.
