"""Human review pass over the LLM-generated exercises.

    cd backend
    python scripts/review_exercises.py --difficulty beginner

Walks generated exercises one at a time and records a verdict in the
append-only sidecar app/data/exercises.review.json:

    a  approve   - keep it, counts as human-reviewed
    r  reject    - drop it from listings (asks for a one-line reason)
    e  edit      - open the record in $EDITOR; saved changes are stored as a
                   patch and the status becomes "edited" (still shown)
    s  skip      - decide later
    q  quit      - save and exit
    ?  help

Only stdlib - no venv, no API key, no database. The sidecar is written after
every keypress, so it is safe to quit any time and safe to run on a second
machine: generation only ever appends to exercises.generated.json, review
only ever writes exercises.review.json, so the two never conflict in git.

Flags:
    --difficulty {beginner,intermediate,pro}   only this difficulty
    --class NAME                               only this defect_class
    --reviewer NAME                            recorded as "by" (or $REVIEWER)
    --all                                      revisit already-reviewed ones
    --limit N                                  stop after N decisions
    --status                                   print counts and exit
"""
import argparse
import datetime as dt
import json
import os
import pathlib
import subprocess
import sys
import tempfile

DATA = pathlib.Path(__file__).resolve().parents[1] / "app" / "data"
GENERATED = DATA / "exercises.generated.json"
REVIEW = DATA / "exercises.review.json"

PATCHABLE = {"title", "code", "real_lines", "fix_diff", "reference", "hints",
             "defect_class", "difficulty", "filename"}


def _load_json(path: pathlib.Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def _save_reviews(reviews: dict) -> None:
    """Atomic write so a Ctrl-C mid-save can't truncate the file."""
    fd, tmp = tempfile.mkstemp(dir=REVIEW.parent, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(reviews, f, indent=2, ensure_ascii=False, sort_keys=True)
        f.write("\n")
    os.replace(tmp, REVIEW)


def _render(ex: dict) -> None:
    real = set(ex.get("real_lines", []))
    print("\n" + "=" * 70)
    print(f"  {ex['id']}   {ex.get('defect_class', '?')} · {ex.get('difficulty', '?')}")
    print(f"  {ex.get('title', '')}")
    print("-" * 70)
    for i, line in enumerate(ex.get("code", "").splitlines(), 1):
        mark = ">>" if i in real else "  "
        print(f"{mark}{i:3} {line}")
    print("-" * 70)
    print(f"  real_lines : {ex.get('real_lines')}")
    print(f"  fix_diff   : {ex.get('fix_diff', '')}")
    print(f"  reference  : {ex.get('reference', '')}")
    if ex.get("hints"):
        for h in ex["hints"]:
            print(f"  hint       : {h}")
    print("=" * 70)


def _edit(ex: dict) -> dict | None:
    """Open the record in $EDITOR; return {field: new_value} for changed
    PATCHABLE fields, or None if nothing changed / no editor."""
    editor = os.environ.get("EDITOR") or ("notepad" if os.name == "nt" else "vi")
    fd, tmp = tempfile.mkstemp(suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump({k: ex.get(k) for k in sorted(PATCHABLE)}, f, indent=2, ensure_ascii=False)
    try:
        subprocess.call([editor, tmp])
        edited = json.loads(pathlib.Path(tmp).read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"  ! editor '{editor}' not found - set $EDITOR. Treating as skip.")
        return None
    except json.JSONDecodeError as e:
        print(f"  ! your edit isn't valid JSON ({e}) - discarded, treating as skip.")
        return None
    finally:
        os.unlink(tmp)
    patch = {k: v for k, v in edited.items() if k in PATCHABLE and v != ex.get(k)}
    return patch or None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--difficulty", choices=["beginner", "intermediate", "pro"])
    ap.add_argument("--class", dest="cls")
    ap.add_argument("--reviewer", default=os.environ.get("REVIEWER", ""))
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--status", action="store_true")
    args = ap.parse_args()

    exercises = _load_json(GENERATED, [])
    reviews = _load_json(REVIEW, {})

    if args.status:
        seen = collections_count(reviews.get(e["id"], {}).get("status", "unreviewed") for e in exercises)
        for k in ("unreviewed", "approved", "edited", "rejected"):
            print(f"  {k:11} {seen.get(k, 0)}")
        print(f"  {'TOTAL':11} {len(exercises)}")
        return 0

    reviewer = args.reviewer or input("Your name (recorded as reviewer): ").strip()
    if not reviewer:
        print("need a reviewer name")
        return 1

    queue = [
        e for e in exercises
        if (args.difficulty is None or e.get("difficulty") == args.difficulty)
        and (args.cls is None or e.get("defect_class") == args.cls)
        and (args.all or reviews.get(e["id"], {}).get("status", "unreviewed") == "unreviewed")
    ]
    if not queue:
        print("nothing to review with those filters.")
        return 0

    done = rejected = 0
    print(f"{len(queue)} to review. a=approve r=reject e=edit s=skip q=quit ?=help")

    for ex in queue:
        if args.limit and done >= args.limit:
            print(f"\nhit --limit {args.limit}.")
            break
        _render(ex)
        while True:
            choice = input(f"[{done}/{len(queue)} done · {rejected} rejected] a/r/e/s/q > ").strip().lower()
            now = dt.datetime.now(dt.timezone.utc).date().isoformat()
            if choice == "?":
                print("  a approve · r reject (asks reason) · e edit in $EDITOR · s skip · q save & quit")
                continue
            if choice == "s":
                break
            if choice == "q":
                _save_reviews(reviews)
                print(f"\nsaved. {done} decided this session ({rejected} rejected).")
                return 0
            if choice == "a":
                reviews[ex["id"]] = {"status": "approved", "by": reviewer, "at": now}
                done += 1
                break
            if choice == "r":
                note = input("  reason > ").strip()
                reviews[ex["id"]] = {"status": "rejected", "by": reviewer, "at": now, "note": note}
                done += 1
                rejected += 1
                break
            if choice == "e":
                patch = _edit(ex)
                if patch is None:
                    print("  no changes - not recorded.")
                    continue
                reviews[ex["id"]] = {"status": "edited", "by": reviewer, "at": now, "patch": patch}
                done += 1
                break
            print("  ? for help")
        _save_reviews(reviews)

    _save_reviews(reviews)
    print(f"\ndone. {done} decided this session ({rejected} rejected). sidecar: {REVIEW}")
    return 0


def collections_count(it):
    d: dict[str, int] = {}
    for x in it:
        d[x] = d.get(x, 0) + 1
    return d


if __name__ == "__main__":
    raise SystemExit(main())
