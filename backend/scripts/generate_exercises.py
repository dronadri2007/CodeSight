"""Batch-generate practice exercises with Gemini into
app/data/exercises.generated.json (source="generated", ids ex-gNNNN).

    cd backend
    python scripts/generate_exercises.py --count 200

Needs GEMINI_API_KEY. On the free tier expect ~1-2 s per exercise plus
rate-limit backoff. Safe to re-run: it resumes from the highest existing id
and skips code it already has. Generated exercises are NEVER used in a
promotion test; users can flag broken ones via POST /exercises/{id}/report.
"""
import argparse
import ast
import json
import pathlib
import random
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from pydantic import BaseModel  # noqa: E402

from app.gemini import generate  # noqa: E402
from google.genai import types  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parents[1] / "app" / "data" / "exercises.generated.json"

CLASSES = ["injection", "auth", "error-handling", "concurrency", "logic", "resource", "clean"]
DIFFICULTIES = ["beginner", "intermediate", "pro"]
DOMAINS = [
    "user authentication", "file uploads", "a payments flow", "an inventory service",
    "request logging", "a caching layer", "report generation", "a search endpoint",
    "session handling", "a background job queue", "CSV import", "an email sender",
    "rate limiting", "a config loader", "an image thumbnailer", "a webhook receiver",
]

MODEL = "gemini-3.5-flash-lite"  # separate free-tier daily quota from the grader


class Gen(BaseModel):
    title: str
    filename: str
    code: str            # 3-12 lines of Python, exactly one defect (or none if clean)
    real_lines: list[int]  # 1-based; [] for a clean exercise
    fix_diff: str        # unified-diff-ish; "" for clean
    reference: str       # 2-4 sentence explanation
    hints: list[str]     # 2-3, progressive


def _prompt(defect_class: str, difficulty: str, domain: str) -> str:
    if defect_class == "clean":
        return (
            f"Write a short, CORRECT Python function ({difficulty} level) related to "
            f"{domain}. It must have NO defect, but include something that looks "
            f"slightly suspicious to a novice reviewer. real_lines = [], fix_diff = "
            f'"". reference explains why it is fine and that flagging it is a false '
            f"positive. 2 hints that lead the reviewer to conclude it is clean."
        )
    return (
        f"Write a short Python function (3-12 lines, {difficulty} level) related to "
        f"{domain} that contains EXACTLY ONE {defect_class} defect. Give real_lines "
        f"(1-based) for the buggy line(s), a fix_diff showing the correction, a 2-4 "
        f"sentence reference explaining the mechanism and the fix, and 3 progressive "
        f"hints (general -> specific -> near-answer). Do not write comments that give "
        f"the bug away."
    )


def _valid(g: dict, defect_class: str) -> bool:
    code = g.get("code", "")
    if not code.strip() or code.count("\n") > 20:
        return False
    try:
        ast.parse(code)
    except SyntaxError:
        return False
    n = code.count("\n") if code.endswith("\n") else code.count("\n") + 1
    rl = g.get("real_lines", [])
    if defect_class == "clean":
        return rl == [] and not g.get("fix_diff", "")
    if not rl or any(not (1 <= x <= n) for x in rl):
        return False
    return bool(g.get("fix_diff")) and bool(g.get("reference")) and len(g.get("hints", [])) >= 2


def _load_existing() -> tuple[list[dict], set[str], int]:
    if not OUT.exists():
        return [], set(), 0
    data = json.loads(OUT.read_text("utf-8"))
    seen = {" ".join(r["code"].split()) for r in data}
    last = max((int(r["id"].split("-g")[1]) for r in data), default=0)
    return data, seen, last


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=100)
    args = ap.parse_args()

    data, seen, last = _load_existing()
    made = skipped = 0
    for _ in range(args.count):
        dc = random.choice(CLASSES)
        diff = random.choice(DIFFICULTIES)
        dom = random.choice(DOMAINS)
        try:
            resp = generate(
                model=MODEL,
                contents=_prompt(dc, diff, dom),
                config=types.GenerateContentConfig(
                    system_instruction="You produce code-review practice exercises as JSON.",
                    temperature=1.0,
                    response_mime_type="application/json",
                    response_schema=Gen,
                    max_output_tokens=1200,
                ),
            )
            g = (getattr(resp, "parsed", None) or Gen.model_validate_json(resp.text)).model_dump()
        except Exception as e:  # noqa: BLE001
            print(f"  gen error: {type(e).__name__}: {e}")
            skipped += 1
            continue

        norm = " ".join(g["code"].split())
        if norm in seen or not _valid(g, dc):
            skipped += 1
            continue
        seen.add(norm)
        last += 1
        data.append({
            "id": f"ex-g{last:04d}",
            "language": "python",
            "title": g["title"][:80],
            "defect_class": dc,
            "difficulty": diff,
            "source": "generated",
            "filename": g["filename"][:40] or "snippet.py",
            "code": g["code"] if g["code"].endswith("\n") else g["code"] + "\n",
            "real_lines": g["real_lines"],
            "fix_diff": g["fix_diff"],
            "reference": g["reference"],
            "hints": g["hints"][:3],
        })
        made += 1
        if made % 20 == 0:
            OUT.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
            print(f"  ...{made} made, {skipped} skipped")

    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    print(f"done: +{made} generated (total {len(data)}), {skipped} skipped -> {OUT.name}")


if __name__ == "__main__":
    main()
