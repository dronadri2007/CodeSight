"""Topic prediction — stateless, deterministic P/R/F1 grading.

Offline: no API key, no network. The answer key lives server-side; tests pull
it via `from app.topics import _TOPICS`.
"""
import ast
import collections
import re

from app.concepts import _CONCEPTS
from app.topics import CANDIDATES, _TOPICS

_SUMMARY_KEYS = {"id", "title", "language", "line_count", "function_count", "difficulty"}
_FILE_KEYS = {
    "id", "title", "language", "filename", "code", "line_count",
    "function_count", "candidate_classes", "instructions", "difficulty",
}
_CLASS_ROW_KEYS = {"defect_class", "present", "predicted", "outcome", "note"}


def _three_class_id() -> str:
    """A shipped file with exactly 3 present classes (spec 6 mandates >= 1)."""
    for tid, r in _TOPICS.items():
        if len(r["present_classes"]) == 3:
            return tid
    raise AssertionError("no three-class topic file is shipped")


# --- listing + file --------------------------------------------------
def test_topics_list_shape(client):
    rows = client.get("/topics").json()
    assert len(rows) == len(_TOPICS) == 6      # spec section 6: exactly 6 files
    assert [r["id"] for r in rows] == list(_TOPICS)  # file order
    for r in rows:
        assert set(r) == _SUMMARY_KEYS
        # nothing that reveals the answer or how many classes are present
        assert "present_classes" not in r and "notes" not in r
        assert "code" not in r and "candidate_classes" not in r


def test_topic_file_hides_answer_key(client):
    d = client.get("/topic/topic-001").json()
    assert set(d) == _FILE_KEYS
    assert "present_classes" not in d and "notes" not in d
    assert d["candidate_classes"] == list(CANDIDATES)
    assert 30 <= d["line_count"] <= 80
    assert d["function_count"] >= 3
    assert isinstance(d["instructions"], str) and d["instructions"].strip()


def test_topics_alias_routes(client):
    assert client.get("/topics/topic-001").status_code == 200
    r = client.post("/topics/topic-002/predict", json={"predicted_classes": ["auth"]})
    assert r.status_code == 200
    assert r.json()["id"] == "topic-002"


def test_unknown_topic_is_404(client):
    for resp in (
        client.get("/topic/nope"),
        client.post("/topic/nope/predict", json={"predicted_classes": []}),
        client.post("/topic/nope/predict", json={}),
    ):
        assert resp.status_code == 404
        assert resp.json()["detail"] == "unknown topic"


# --- scoring -------------------------------------------------------
def test_perfect_prediction(client):
    present = _TOPICS["topic-002"]["present_classes"]
    d = client.post("/topic/topic-002/predict", json={"predicted_classes": present}).json()
    assert d["precision"] == d["recall"] == d["f1"] == 1.0
    assert d["exact_match"] is True
    assert d["verdict"] == "perfect"
    assert d["passed"] is True
    assert d["false_positives"] == [] == d["false_negatives"]
    assert len(d["classes"]) == 6
    for row in d["classes"]:
        assert set(row) == _CLASS_ROW_KEYS
        assert row["outcome"] in {"true_positive", "true_negative"}
        assert row["note"].strip()
    assert d["practice_exercise_ids"] == []


def test_empty_prediction_scores_zero(client):
    d = client.post("/topic/topic-004/predict", json={"predicted_classes": []}).json()
    assert d["precision"] == 0.0 and d["recall"] == 0.0 and d["f1"] == 0.0
    assert d["passed"] is False
    assert d["verdict"] == "miss"
    assert d["near_miss"] is False
    present = set(_TOPICS["topic-004"]["present_classes"])
    for row in d["classes"]:
        expect = "false_negative" if row["defect_class"] in present else "true_negative"
        assert row["outcome"] == expect
        assert row["note"].strip()


def test_predict_defaults_to_empty(client):
    d = client.post("/topic/topic-004/predict", json={}).json()
    assert d["predicted_classes"] == []
    assert d["f1"] == 0.0 and d["verdict"] == "miss"


def test_only_junk_tokens_ignored(client):
    d = client.post(
        "/topic/topic-001/predict", json={"predicted_classes": ["clean", "banana"]}
    ).json()
    assert d["ignored_classes"] == ["clean", "banana"]  # input order, kept
    assert d["predicted_classes"] == []
    assert d["precision"] == 0.0 and d["recall"] == 0.0 and d["f1"] == 0.0
    assert d["verdict"] == "miss"


def test_case_sensitive_match_drops_to_ignored(client):
    # spec 2.3: matching is case-sensitive — "Injection" is not "injection"
    d = client.post(
        "/topic/topic-005/predict", json={"predicted_classes": ["Injection"]}
    ).json()
    assert d["predicted_classes"] == []
    assert d["ignored_classes"] == ["Injection"]
    assert d["f1"] == 0.0


def test_surrounding_whitespace_is_stripped(client):
    # spec 2.3: each token is stripped of surrounding whitespace before matching
    d = client.post(
        "/topic/topic-002/predict", json={"predicted_classes": [" auth "]}
    ).json()
    assert d["predicted_classes"] == ["auth"]
    assert d["ignored_classes"] == []
    assert d["recall"] == 0.5 and d["verdict"] == "under_predicted"


def test_ignored_classes_keep_duplicate_junk(client):
    # spec 2.3: dups among *invalid* tokens are preserved in ignored_classes
    d = client.post(
        "/topic/topic-001/predict", json={"predicted_classes": ["clean", "clean"]}
    ).json()
    assert d["ignored_classes"] == ["clean", "clean"]
    assert d["predicted_classes"] == []


def test_predicted_classes_length_cap_is_422(client):
    # schema caps predicted_classes at 20 items
    r = client.post(
        "/topic/topic-001/predict", json={"predicted_classes": ["logic"] * 21}
    )
    assert r.status_code == 422


def test_single_class_wrong_guess(client):
    # topic-001 is [logic]; guessing [auth] is all wrong
    d = client.post("/topic/topic-001/predict", json={"predicted_classes": ["auth"]}).json()
    assert d["f1"] == 0.0
    assert d["verdict"] == "miss"
    assert d["passed"] is False
    by_class = {r["defect_class"]: r["outcome"] for r in d["classes"]}
    assert by_class["auth"] == "false_positive"
    assert by_class["logic"] == "false_negative"


def test_single_class_exact_hit_passes(client):
    d = client.post("/topic/topic-001/predict", json={"predicted_classes": ["logic"]}).json()
    assert d["f1"] == 1.0
    assert d["verdict"] == "perfect"
    assert d["passed"] is True
    assert d["practice_exercise_ids"] == []


def test_single_class_over_by_one_still_passes(client):
    # spec 3.5: a single-class file plus exactly one stray still passes
    d = client.post(
        "/topic/topic-001/predict", json={"predicted_classes": ["logic", "auth"]}
    ).json()
    assert d["precision"] == 0.5 and d["recall"] == 1.0 and d["f1"] == 0.67
    assert d["verdict"] == "over_predicted"
    assert d["passed"] is True
    assert d["near_miss"] is True
    assert d["false_positives"] == ["auth"]


def test_predict_all_six_does_not_pass(client):
    # A 3-class file: predicting all 6 gives precision 0.5 / recall 1.0, so
    # unrounded f1 = 2/3 and f1 rounds to 0.67 — it *would* clear the 2/3 bar
    # on merits. The anti-gaming carve-out (`and not predicted_all`) is the
    # only thing making `passed` False here, so this assertion depends on it.
    tid = _three_class_id()
    everything = list(CANDIDATES)
    d = client.post(
        f"/topic/{tid}/predict", json={"predicted_classes": everything}
    ).json()
    assert d["recall"] == 1.0
    assert d["precision"] == 0.5
    assert d["f1"] == 0.67                # rounds to the pass threshold
    assert d["verdict"] == "over_predicted"
    assert d["passed"] is False           # anti-gaming carve-out
    assert d["exact_match"] is False


def test_correct_subset_passes_two_thirds(client):
    # topic-002 is [auth, error-handling]; predicting just [auth] -> f1 = 2/3
    d = client.post("/topic/topic-002/predict", json={"predicted_classes": ["auth"]}).json()
    assert d["precision"] == 1.0
    assert d["recall"] == 0.5
    assert d["f1"] == 0.67
    assert d["verdict"] == "under_predicted"
    assert d["passed"] is True
    assert d["near_miss"] is True


def test_over_by_one_passes_but_flags(client):
    d = client.post(
        "/topic/topic-002/predict",
        json={"predicted_classes": ["auth", "error-handling", "injection"]},
    ).json()
    assert d["f1"] == 0.8
    assert d["verdict"] == "over_predicted"
    assert d["passed"] is True
    assert d["near_miss"] is True
    assert d["false_positives"] == ["injection"]


def test_partial_does_not_pass(client):
    # topic-003 is [error-handling, logic]; one right, one wrong, one missed
    d = client.post(
        "/topic/topic-003/predict",
        json={"predicted_classes": ["error-handling", "auth"]},
    ).json()
    assert d["precision"] == 0.5 and d["recall"] == 0.5 and d["f1"] == 0.5
    assert d["verdict"] == "partial"
    assert d["passed"] is False
    assert d["near_miss"] is False        # >= 2 classes away (fp + fn == 2)


def test_duplicates_deduped(client):
    d = client.post(
        "/topic/topic-001/predict", json={"predicted_classes": ["logic", "logic"]}
    ).json()
    assert d["predicted_classes"] == ["logic"]
    assert d["f1"] == 1.0


def test_canonical_order_and_determinism(client):
    a = client.post(
        "/topic/topic-003/predict",
        json={"predicted_classes": ["logic", "auth", "error-handling"]},
    )
    b = client.post(
        "/topic/topic-003/predict",
        json={"predicted_classes": ["auth", "error-handling", "logic"]},
    )
    assert a.json() == b.json()  # byte-identical regardless of request order
    d = a.json()
    assert [r["defect_class"] for r in d["classes"]] == list(CANDIDATES)
    for key in ("predicted_classes", "true_positives", "false_positives", "false_negatives",
                "present_classes"):
        seq = d[key]
        order = [CANDIDATES.index(c) for c in seq]
        assert order == sorted(order), (key, seq)


def test_practice_ids_target_missed_classes(client):
    # topic-002 is [auth, error-handling]; predicting [auth] misses error-handling only
    d = client.post("/topic/topic-002/predict", json={"predicted_classes": ["auth"]}).json()
    assert d["false_negatives"] == ["error-handling"]
    assert d["practice_exercise_ids"] == _CONCEPTS["error-handling"]["practice_exercise_ids"]


def test_wrong_type_is_422(client):
    r = client.post("/topic/topic-001/predict", json={"predicted_classes": 5})
    assert r.status_code == 422


# --- data integrity ------------------------------------------------
def test_topic_data_integrity():
    seen = set()
    single, multi = 0, 0
    present_counts = collections.Counter()
    for tid, r in _TOPICS.items():
        assert re.match(r"^topic-\d{3}$", tid)
        assert tid not in seen
        seen.add(tid)

        code = r["code"]
        ast.parse(code)
        n = len(code.splitlines())
        assert 30 <= n <= 80, (tid, n)
        defs = code.count("\ndef ") + (1 if code.startswith("def ") else 0)
        assert defs >= 3, (tid, defs)

        pc = r["present_classes"]
        assert pc and len(pc) == len(set(pc))
        assert set(pc) <= set(CANDIDATES)
        assert "clean" not in pc
        assert len(pc) <= 3
        single += len(pc) == 1
        multi += len(pc) >= 2
        present_counts.update(pc)

        assert set(r["notes"]) == set(CANDIDATES)
        assert all(str(v).strip() for v in r["notes"].values())
        assert r["language"] == "python"
        assert "line_count" not in r  # spec 4: derived in the API, not stored

    # spec section 6 coverage (spec 8 item 15)
    assert len(_TOPICS) == 6                                  # exactly 6 files
    assert single >= 1                                        # >= 1 single-class file
    assert multi >= 1
    assert any(len(r["present_classes"]) == 3 for r in _TOPICS.values())  # >= 1 three-class file
    assert all(present_counts[c] >= 2 for c in CANDIDATES), present_counts  # each class present in >= 2 files
