"""The exercises.review.json sidecar: rejected exercises drop out of listings,
edited ones get their patch merged. Uses _load() directly with a temp sidecar
so the on-disk review file and the module global are untouched.
"""
import json

from app import exercises as ex


def _reload_with_sidecar(tmp_path, monkeypatch, mapping):
    sidecar = tmp_path / "exercises.review.json"
    sidecar.write_text(json.dumps(mapping), encoding="utf-8")
    monkeypatch.setattr(ex, "_REVIEW", sidecar)
    return ex._load()


def _first_generated_id():
    return next(r["id"] for r in ex._EXERCISES.values() if r["source"] == "generated")


def test_rejected_is_hidden_from_listings(tmp_path, monkeypatch):
    victim = _first_generated_id()
    loaded = _reload_with_sidecar(
        tmp_path, monkeypatch,
        {victim: {"status": "rejected", "by": "t", "at": "2026-08-29", "note": "bad"}},
    )
    monkeypatch.setattr(ex, "_EXERCISES", loaded)

    assert loaded[victim]["review_status"] == "rejected"
    assert victim not in {s.id for s in ex.list_summaries()}
    # still resolvable by id for an in-progress attempt
    assert ex.get_answer(victim)["id"] == victim


def test_edit_patch_is_merged(tmp_path, monkeypatch):
    target = _first_generated_id()
    loaded = _reload_with_sidecar(
        tmp_path, monkeypatch,
        {target: {"status": "edited", "by": "t", "at": "2026-08-29",
                  "patch": {"reference": "PATCHED REFERENCE"}}},
    )
    assert loaded[target]["review_status"] == "edited"
    assert loaded[target]["reference"] == "PATCHED REFERENCE"


def test_reviewed_only_excludes_unreviewed(tmp_path, monkeypatch):
    loaded = _reload_with_sidecar(tmp_path, monkeypatch, {})
    monkeypatch.setattr(ex, "_EXERCISES", loaded)

    everything = ex.list_summaries()
    approved = ex.list_summaries(reviewed_only=True)
    assert len(approved) < len(everything)
    assert all(ex._EXERCISES[s.id]["review_status"] == "approved" for s in approved)


def test_curated_are_approved_by_default(tmp_path, monkeypatch):
    loaded = _reload_with_sidecar(tmp_path, monkeypatch, {})
    curated = [r for r in loaded.values() if r["source"] == "curated"]
    assert curated and all(r["review_status"] == "approved" for r in curated)
