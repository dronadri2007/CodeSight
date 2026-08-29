# CodeSight — Status Report

**Team HackHive · Tech Eximius 2026 · 2026-08-29**

Measured against `CodeSight_Recommended_Features.pdf`, tier by tier.

Legend: **BE** = backend (built + tested + deployed) · **FE** = frontend UI ·
**Wired** = the frontend actually calls the backend.

**Deployment:** Backend live on Railway
(`codesight-code-review-production.up.railway.app`), Postgres, 56 tests passing
(+10 network tests skipped by default). 1002 exercises (19 curated + 983
generated); generated pool under human review.
Frontend on Vercel, running on its own mock data — **not yet connected to the
backend**.

---

## Tier 1 — Core guidance loop

| # | Feature | BE | FE | Wired | Notes |
|---|---|---|---|---|---|
| 1 | Real-code review surface | done — `/exercises`, `/exercises/{id}` | done — Monaco workspace | no | FE reads `frontend/src/data/exercises.ts` |
| 2 | Teaching grader (where / why-missed / pattern) | done — `/grade` (Gemini + fallback) | done — results page | no | |
| 3 | Named six-class taxonomy | done — 1002 exercises tagged | done — `defectClasses.ts` | no | injection, auth, error-handling, concurrency, logic, resource |
| 4 | Learn the Concept | done — `/concepts`, `/concept/{id}` | done — concept page | no | 6 concepts: summary, bad/good, YouTube links (all verified 2026-08-29), practice ids |
| 5 | Prescriptive weakness profile | done — `/profile` | done — dashboard | no | "weakest area X, catch rate Y%, 3 more queued" |

**Tier 1: backend 5/5, frontend UI 5/5, wired 0/5.**

---

## Tier 2 — High value, low cost

| # | Feature | BE | FE | Wired | Notes |
|---|---|---|---|---|---|
| 6 | Progressive hints + score decay | done — `/exercises/{id}/hints/{n}`, `hints_used` in `/grade` (1.0 / 0.9 / 0.75 / 0.5) | done | no | |
| 7 | Concept micro-check (2-3 questions) | **not built** | UI exists | no | needs a `questions` field + endpoint, or keep FE-only static |
| 8 | Progress-over-time | done — `/progress/{session_id}` (timeline + running catch-rate + per-class first-vs-latest) | done — Recharts | no | |
| 9 | Prompt-injection guard | done — grader system prompt + 4000-char cap | n/a | yes (server-side) | basic form |

**Tier 2: backend 3/4, frontend 3/4, wired 0/4.**

---

## Tier 3 — Demo & engagement

| # | Feature | BE | FE | Wired | Notes |
|---|---|---|---|---|---|
| 10 | Multiplayer Code Review Battle | **not built** (plan cut it) | simulated (5 fake bots) | n/a | real version = websocket rooms, ~5-8 person-days |
| 11 | Leaderboard | **not built** | simulated | n/a | depends on 10 |
| 12 | AI Reviewer vs You | done — `/ai-review` (blind review, diff, headline, retry) | done — page | no | |

**Tier 3: backend 1/3, frontend 3/3 (2 simulated), wired 0/3.**

---

## Tier 4 — Later, if time allows

| # | Feature | BE | FE | Wired | Notes |
|---|---|---|---|---|---|
| 13 | False-positive trap exercises | done — 176 clean exercises + FP penalty in scoring | done | no | flagging clean code -> `false_positive`, score 0 |
| 14 | Large-code topic prediction | **not built** | not built | no | separate exercise type + scoring |
| 15 | Exercise feedback loop | done — `/exercises/{id}/report` (3 distinct sessions -> hidden) | **no report button in FE** | no | |

**Tier 4: backend 2/3, frontend 1/3, wired 0/3.**

---

## Integrity / anti-cheat section

| Layer | Item | Status |
|---|---|---|
| 1 — Editor friction | disable copy / cut / context-menu | FE has paste notification + char limit + timer per its README; full lockdown unclear |
| 2 — Behavioural detection | paste detection, keystroke cadence, tab-blur, time-to-submit, known-AI match, cross-student similarity, **integrity score** | **none on backend.** `/grade` accepts no telemetry |
| 3 — Task design | per-exercise timer, localise-first, word cap, follow-up probe | word cap done; timer / localise-first are FE; follow-up probe not built |
| 4 — Positioning | "practice not exam" framing | copy decision, not code |

**Integrity: ~15% done — the biggest untouched section from the doc.**

---

## "Getting to 10/10" section

| Item | Status |
|---|---|
| Taxonomy named + documented | done |
| Determinism (temp 0, hash cache, fixed rubric) | done |
| Grader benchmark (gold set + agreement number) | not run |
| Clean-file sourcing from refactor commits | hand-written / generated instead |
| Confirmed vs plausible findings | in grader prompt, not a structured field |
| Corpus to 120+ | done — **1002** (19 curated + 983 generated; generated pool unreviewed, teammate reviewing via `review_exercises.py`) |
| Predictive weakness profile | done; shareable "review-skill card" export not built |
| Real usage data (test on 8-10 students) | not done |
| 90-second demo loop, rehearsed | not done |
| Pre-answer judge questions slide | not done |

---

## Beyond the doc — the tier system (added later)

| Feature | Status |
|---|---|
| beginner / intermediate / pro tiers | done, deployed |
| Cumulative content gating (`/exercises?tier=`) | done |
| Session tier (`/session/{id}`, auto-created at beginner) | done |
| Promotion test (3 curated next-tier exercises) | done — `/promotion-test/{id}` |
| Promotion evaluate (first-attempt mean >= 0.7 -> promote) | done — verified live |
| Frontend UI for tiers / promotion | not built |

---

# What's left to finish the website

## Blocking — no working product without these

| # | Task | Owner | Size |
|---|---|---|---|
| A | **Wire the frontend to the backend.** Replace `frontend/src/data/*.ts` with real calls to `/exercises`, `/grade`, `/profile`, `/progress`, `/concept/{id}`, `/session/{id}`, `/promotion-test/*`, `/exercises/{id}/hints/{n}`. Generate `sessionId` -> `localStorage`. | FE pair | ~1 day |
| B | Tier UI: badge, tier-gated practice list, "take promotion test" flow | FE pair | ~half day |
| C | **"Report exercise" button** (calls `/exercises/{id}/report`) — needed because 983 generated exercises are unvalidated (human review in progress via `review_exercises.py` + `exercises.review.json` sidecar) | FE pair | ~1 hr |
| D | End-to-end test on the deployed stack (Vercel -> Railway), fix breakage | Both | ~3 hrs |
| ~~E~~ | ~~Verify the 6 concept YouTube URLs are live~~ **DONE (2026-08-29)** — all 10 links checked via YouTube oEmbed; 2 dead links replaced, 4 titles corrected (commit `b22aced`) | Anyone | — |

## Demo prep — not code

| # | Task |
|---|---|
| F | Decide + rehearse the 90-second demo journey (review -> weak concept -> video -> practice -> promote) |
| G | Pitch deck + roadmap slide (deferred: code-writing track, multiplayer, integrity telemetry) |
| H | Judge-question answers (grader accuracy, how it scales, why 6 classes, gaming) |

## Optional / post-hackathon

| # | Task | Note |
|---|---|---|
| I | Concept micro-check backend (#7) | or keep FE-only static |
| J | Integrity telemetry on `/grade` (paste events, timing, integrity score) | the whole Integrity section |
| K | Multiplayer + leaderboard (#10, #11) | 5-8 person-days — roadmap only |
| L | Human-review the 983 generated exercises (`review_exercises.py`, beginner tier first) | teammate, ongoing |
| M | Grader benchmark (gold set + agreement %) | strong for judges |
| N | Large-code topic prediction (#14) | roadmap |

---

## Bottom line

**Backend: ~90% of the recommended feature set is built, tested, and live** —
everything except multiplayer, concept micro-check, large-code prediction, and
integrity telemetry (all explicitly deferrable).

**Frontend: UI exists for most features but runs entirely on mock data.**

**The single thing standing between "impressive backend" and "working product"
is task A — connecting the two.** Everything else is polish or roadmap.
