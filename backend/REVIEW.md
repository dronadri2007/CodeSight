# Reviewing generated exercises (runbook)

Exercises `ex-g0001`+ are LLM-generated and unverified. This is how a
reviewer signs off on them from any machine. You only ever edit **one**
file — `app/data/exercises.review.json` — so your work never collides with
new exercises being generated on someone else's machine.

## One-time setup on the reviewer's laptop

You need **Python 3.11+** and nothing else — no venv, no API key, no
database. The review script is pure standard library.

```
git clone https://github.com/dronadri2007/codesight-code-review.git
cd codesight-code-review/backend
python scripts/review_exercises.py --status      # should print counts
```

Set your name once so it's recorded on each verdict:

```
# Windows PowerShell
$env:REVIEWER = "yourname"
# macOS / Linux
export REVIEWER=yourname
```

(or pass `--reviewer yourname` each run).

## Each review session

```
cd codesight-code-review/backend
git checkout main
git pull                                   # pick up newly generated exercises
git checkout -b review-YYYYMMDD            # a fresh branch each time

python scripts/review_exercises.py --difficulty beginner
```

Review **beginner first** — those are shown to the most users. Then
`--difficulty intermediate`, then `pro`. `--class auth` etc. narrows further.

For each exercise the script shows the code (buggy lines marked `>>`),
`real_lines`, `fix_diff`, and `reference`, then waits:

| key | meaning |
|---|---|
| `a` | approve — it's a valid exercise, counts as human-reviewed |
| `r` | reject — drop it from the app (you'll be asked for a one-line reason) |
| `e` | edit — opens the record in `$EDITOR`; your saved changes are stored as a patch, status becomes `edited` (still shown) |
| `s` | skip — decide later |
| `q` | save and quit |

The sidecar is saved after **every keypress**, so quitting or Ctrl-C at any
point loses nothing. Re-running picks up where you left off (skips anything
already decided unless you pass `--all`).

`$EDITOR` for the `e` option: set it to your editor, e.g.
`export EDITOR="code -w"` (VS Code) or `export EDITOR=nano`. On Windows it
falls back to Notepad.

## Pushing your review back

Only the sidecar changed:

```
git add app/data/exercises.review.json
git commit -m "review: <difficulty> batch — N approved, M rejected"
git push -u origin review-YYYYMMDD
```

Open a PR on GitHub. Whoever merges it just needs to eyeball the diff (it's
all `approved` / `rejected` / `edited` entries). No conflicts with
generation because that only ever appends to
`app/data/exercises.generated.json`.

## What the flags do in the app

- `rejected` → the exercise disappears from `GET /exercises` (still
  resolvable by id, so an attempt already open doesn't break).
- `edited` → the `patch` fields override the generated ones on load.
- `approved` → eligible for `reviewed_only` listings and, later, promotion
  tests.

Check overall progress any time:

```
python scripts/review_exercises.py --status
```
