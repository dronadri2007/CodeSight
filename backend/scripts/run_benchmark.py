"""Run the explanation grader over benchmark/gold_set.json and report how well
it agrees with the human labels.

    cd backend
    python scripts/run_benchmark.py                 # uses the disk cache
    python scripts/run_benchmark.py --no-cache      # force fresh grader calls
    python scripts/run_benchmark.py --limit 8       # first 8 cases only
    python scripts/run_benchmark.py --json          # machine-readable summary

Each case has a human-set expectation:
  - expect_localisation : the deterministic localisation verdict
  - expect_verdict      : strong | partial | weak
  - score_min/score_max : band the explanation score should land in

A case AGREES when the grader's verdict matches and the score is in band.
Localisation is checked separately as a sanity signal (it is pure Python).

Grader quota note: the grader model's free tier is small and is shared with
the live deploy. Set BENCHMARK_API_KEY (or GEMINI_API_KEY2) to a separate
key so a full run does not starve production. Results are cached to
benchmark/cache.json keyed by (exercise, selection, explanation, model), so
re-runs and CI cost nothing.
"""
import argparse
import hashlib
import json
import os
import pathlib
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

import app.config  # noqa: E402, F401  (loads .env)
from app import exercises as ex  # noqa: E402
from app.config import GRADER_MODEL  # noqa: E402
from app.localisation import score_localisation  # noqa: E402

BENCH_DIR = pathlib.Path(__file__).resolve().parents[1] / "benchmark"
GOLD = BENCH_DIR / "gold_set.json"
CACHE = BENCH_DIR / "cache.json"
LAST_RUN = BENCH_DIR / "last_run.json"


# gemini-3.6-flash free tier is ~5 req/min and ~20 req/day *per project*, and
# it is shared with the live deploy. Pace well under the minute limit and hop
# keys when one project's day is spent.
_PACE_S = 13.0


def _keys() -> list[str]:
    out, seen = [], set()
    for name in ("BENCHMARK_API_KEY", "GEMINI_API_KEY2", "GEMINI_API_KEY", "GEMINI_API_KEY3", "GOOGLE_API_KEY"):
        v = os.getenv(name, "").strip()
        if v and v not in seen:
            out.append(v)
            seen.add(v)
    return out


class _Pool:
    def __init__(self, keys: list[str]) -> None:
        from google import genai

        self._clients = [genai.Client(api_key=k) for k in keys]
        self.i = 0
        self.n = len(keys)

    def _install(self) -> None:
        from app import gemini as gemini_mod
        from app import grader as grader_mod

        gemini_mod.client = grader_mod._client = self._clients[self.i]

    def rotate(self) -> bool:
        if self.i + 1 < self.n:
            self.i += 1
            self._install()
            return True
        return False


def _cache_key(case: dict) -> str:
    raw = f"{GRADER_MODEL}|{case['exercise_id']}|{sorted(case['selected_lines'])}|{case['explanation'].strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--json", action="store_true", dest="as_json")
    args = ap.parse_args()

    gold = json.loads(GOLD.read_text(encoding="utf-8"))
    cases = gold["cases"][: args.limit] if args.limit else gold["cases"]

    keys = _keys()
    pool = None
    if keys:
        pool = _Pool(keys)
        pool._install()
    else:
        from app import gemini as gemini_mod
        from app import grader as grader_mod

        gemini_mod.client = grader_mod._client = None
        print("!! no grader API key (BENCHMARK_API_KEY / GEMINI_API_KEY2 / GEMINI_API_KEY).")
        print("!! the grader will run its fallback path; agreement numbers are meaningless.")
    live = pool is not None

    from app.grader import _fallback, grade_explanation  # after client is installed
    from app.grader import _cache as _grader_cache  # bypass its in-proc cache on rotation

    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() and not args.no_cache else {}
    fresh_calls = 0

    def _grade_with_rotation(case, answer, loc_verdict):
        """One grader call; on a per-day RESOURCE_EXHAUSTED hop to the next key."""
        nonlocal fresh_calls
        while True:
            _grader_cache.clear()
            g = grade_explanation(
                exercise_id=case["exercise_id"], code=answer["code"], fix_diff=answer["fix_diff"],
                reference=answer["reference"], selected_lines=case["selected_lines"],
                explanation=case["explanation"], localisation_verdict=loc_verdict,
            )
            fresh_calls += 1
            time.sleep(_PACE_S)
            # grade_explanation swallows failures into _fallback(); detect that
            is_fallback = g == _fallback(answer["reference"], loc_verdict)
            if is_fallback and pool and pool.rotate():
                print(f"  {case['id']}: key exhausted, rotated to key {pool.i + 1}/{pool.n}")
                continue
            return g, is_fallback

    rows = []
    loc_ok = verdict_ok = band_ok = agree = 0
    voided = 0
    for case in cases:
        answer = ex.get_answer(case["exercise_id"])
        loc = score_localisation(case["selected_lines"], answer["real_lines"])

        ck = _cache_key(case)
        voided_case = False
        if ck in cache:
            g = cache[ck]
        else:
            g, voided_case = _grade_with_rotation(case, answer, loc["verdict"])
            if voided_case:
                voided += 1
            else:
                cache[ck] = g

        gscore = float(g["explanation_score"])
        gverdict = g["explanation_verdict"]

        # localisation is deterministic and always counts; the LLM checks only
        # count when the grader actually ran (not on a quota-exhausted fallback).
        c_loc = loc["verdict"] == case["expect_localisation"]
        c_verdict = (not voided_case) and gverdict == case["expect_verdict"]
        c_band = (not voided_case) and case["score_min"] <= gscore <= case["score_max"]
        c_agree = c_verdict and c_band

        loc_ok += c_loc
        if not voided_case:
            verdict_ok += c_verdict
            band_ok += c_band
            agree += c_agree

        rows.append({
            "id": case["id"], "exercise_id": case["exercise_id"], "quality": case["quality"],
            "loc_expected": case["expect_localisation"], "loc_got": loc["verdict"], "loc_ok": c_loc,
            "verdict_expected": case["expect_verdict"], "verdict_got": gverdict, "verdict_ok": c_verdict,
            "band": [case["score_min"], case["score_max"]], "score_got": round(gscore, 2), "band_ok": c_band,
            "agree": c_agree, "voided": voided_case,
        })

    if not args.no_cache:
        CACHE.write_text(json.dumps(cache, indent=2), encoding="utf-8")

    n = len(cases)
    scored = n - voided
    summary = {
        "model": GRADER_MODEL,
        "cases": n,
        "scored": scored,
        "voided_quota": voided,
        "grader_live": live,
        "fresh_calls": fresh_calls,
        "localisation_match": f"{loc_ok}/{n}",
        "explanation_verdict_match": f"{verdict_ok}/{scored}" if scored else "0/0",
        "score_in_band": f"{band_ok}/{scored}" if scored else "0/0",
        "overall_agreement": f"{agree}/{scored}" if scored else "0/0",
        "overall_agreement_pct": round(100 * agree / scored, 1) if scored else 0.0,
    }
    LAST_RUN.write_text(json.dumps({"summary": summary, "rows": rows}, indent=2), encoding="utf-8")

    if args.as_json:
        print(json.dumps(summary, indent=2))
        return 0 if scored and agree == scored else 1

    tag = "FALLBACK, VOID" if not live else f"{fresh_calls} fresh"
    if voided:
        tag += f", {voided} quota-voided"
    print(f"\nGrader benchmark - {GRADER_MODEL} - {n} cases ({tag})")
    print("-" * 78)
    print(f"{'id':4} {'exercise':9} {'quality':8} {'loc':>18} {'verdict':>20} {'score/band':>16}  ")
    for r in rows:
        if r["voided"]:
            print(f"{r['id']:4} {r['exercise_id']:9} {r['quality']:8} {r['loc_got']:>18} {'(quota - not graded)':>20} {'':>16}  --")
            continue
        loc = f"{r['loc_got']}{'' if r['loc_ok'] else ' !=' + r['loc_expected']}"
        vd = f"{r['verdict_got']}{'' if r['verdict_ok'] else ' !=' + r['verdict_expected']}"
        sb = f"{r['score_got']} in {r['band']}" if r["band_ok"] else f"{r['score_got']} OUT {r['band']}"
        mark = "ok " if r["agree"] else "MISS"
        print(f"{r['id']:4} {r['exercise_id']:9} {r['quality']:8} {loc:>18} {vd:>20} {sb:>16}  {mark}")
    print("-" * 78)
    print(f"  localisation verdict match : {summary['localisation_match']}  (deterministic)")
    print(f"  explanation verdict match  : {summary['explanation_verdict_match']}")
    print(f"  explanation score in band  : {summary['score_in_band']}")
    print(f"  OVERALL AGREEMENT          : {summary['overall_agreement']}  ({summary['overall_agreement_pct']}%)")
    if voided:
        print(f"  ({voided} case(s) skipped - grader quota exhausted; re-run to fill from cache)")
    print(f"\nwrote {LAST_RUN.relative_to(BENCH_DIR.parent)}")
    return 0 if scored and agree == scored else 1


if __name__ == "__main__":
    raise SystemExit(main())
