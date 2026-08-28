"""Endpoint tests. Run without a GEMINI_API_KEY: the grader falls back
deterministically, and localisation + persistence + profile are fully exercised.

    cd backend && python -m pytest -q
"""


def test_health(client):
    assert client.get("/health").json() == {"ok": True}


def test_debug_shape(client):
    d = client.get("/debug").json()
    assert d["db"] in {"sqlite", "postgres"}
    assert "gemini_key_present" in d["grader"]


# --- /exercises ---------------------------------------------------------
def test_exercise_list_has_no_answer_fields(client):
    items = client.get("/exercises").json()
    assert len(items) >= 3
    for it in items:
        assert set(it) == {"id", "language", "title", "defect_class", "line_count"}


def test_exercise_file_hides_answers(client):
    f = client.get("/exercises/ex-001").json()
    assert "code" in f
    assert not any(k in f for k in ("real_lines", "fix_diff", "reference"))


def test_exercise_file_unknown_is_404(client):
    assert client.get("/exercises/does-not-exist").status_code == 404


# --- /grade -----------------------------------------------------------
def test_grade_response_shape(client):
    d = client.post(
        "/grade",
        json={
            "session_id": "t",
            "exercise_id": "ex-001",
            "selected_lines": [2],
            "explanation": "email is interpolated into the SQL string",
        },
    ).json()
    assert set(d) == {
        "localisation", "explanation", "teaching", "defect_class", "reference_fix",
        "hints_used", "hint_multiplier", "score_after_hints",
    }
    assert set(d["localisation"]) == {"score", "verdict", "real_lines", "note"}
    assert set(d["explanation"]) == {"score", "verdict", "note"}
    assert set(d["teaching"]) == {"where", "why_missed", "pattern"}
    assert d["defect_class"] == "injection"


def test_grade_correct_line_is_hit(client):
    d = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"},
    ).json()
    assert d["localisation"]["verdict"] == "hit"
    assert d["localisation"]["score"] == 1.0


def test_grade_no_selection_on_buggy_file_is_miss(client):
    d = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "ex-001", "selected_lines": [], "explanation": "looks fine"},
    ).json()
    assert d["localisation"]["verdict"] == "miss"
    assert d["localisation"]["score"] == 0.0


def test_grade_clean_file_no_selection_is_hit(client):
    d = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "ex-003", "selected_lines": [], "explanation": "correct"},
    ).json()
    assert d["localisation"]["verdict"] == "hit"
    assert d["localisation"]["score"] == 1.0
    assert d["defect_class"] == "clean"


def test_grade_clean_file_flagged_is_false_positive(client):
    d = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "ex-003", "selected_lines": [4], "explanation": "div by zero"},
    ).json()
    assert d["localisation"]["verdict"] == "false_positive"
    assert d["localisation"]["score"] == 0.0


def test_grade_unknown_exercise_is_404(client):
    r = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "nope", "selected_lines": [1], "explanation": "x"},
    )
    assert r.status_code == 404


def test_grade_missing_fields_is_422(client):
    assert client.post("/grade", json={"exercise_id": "ex-001"}).status_code == 422


def test_grade_explanation_falls_back_without_api_key(client):
    d = client.post(
        "/grade",
        json={"session_id": "t", "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"},
    ).json()
    assert d["explanation"]["verdict"] == "weak"
    assert d["explanation"]["score"] == 0.0
    # teaching still populated from the reference so the UI has something to show
    assert d["teaching"]["where"]


# --- hints ------------------------------------------------------------
def test_hint_returns_text_and_multiplier(client):
    d = client.get("/exercises/ex-001/hints/1").json()
    assert d["index"] == 1
    assert d["text"]
    assert d["total"] == 3
    assert d["score_multiplier"] == 0.9


def test_hint_multipliers_decay(client):
    m = [client.get(f"/exercises/ex-001/hints/{i}").json()["score_multiplier"] for i in (1, 2, 3)]
    assert m == [0.9, 0.75, 0.5]


def test_hint_out_of_range_is_404(client):
    assert client.get("/exercises/ex-001/hints/9").status_code == 404


def test_hint_unknown_exercise_is_404(client):
    assert client.get("/exercises/nope/hints/1").status_code == 404


def test_exercise_file_reports_hint_count(client):
    assert client.get("/exercises/ex-001").json()["hint_count"] == 3
    assert client.get("/exercises/ex-003").json()["hint_count"] == 2  # clean, 2 hints


def test_grade_hints_scale_score_but_not_raw(client):
    body = {"session_id": "h", "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"}
    no_hint = client.post("/grade", json={**body, "hints_used": 0}).json()
    two_hint = client.post("/grade", json={**body, "hints_used": 2}).json()

    # raw localisation is unchanged by hints
    assert no_hint["localisation"]["score"] == two_hint["localisation"]["score"] == 1.0
    assert no_hint["hint_multiplier"] == 1.0
    assert two_hint["hint_multiplier"] == 0.75
    # combined mean is 0.5 here (loc 1.0, expl 0.0 fallback); *0.75 -> 0.38
    assert two_hint["score_after_hints"] == round(0.5 * 0.75, 2)


def test_grade_rejects_too_many_hints(client):
    r = client.post("/grade", json={
        "session_id": "h", "exercise_id": "ex-001", "selected_lines": [2],
        "explanation": "x", "hints_used": 99,
    })
    assert r.status_code == 422


# --- /ai-review -------------------------------------------------
def test_ai_review_shape_and_unavailable_without_key(client):
    d = client.post("/ai-review", json={"exercise_id": "ex-001", "selected_lines": [2]}).json()
    assert set(d) == {
        "exercise_id", "ai_available", "real_lines", "you_found", "ai_lines",
        "ai_findings", "both_found", "you_caught_ai_missed", "ai_caught_you_missed",
        "both_missed", "headline",
    }
    assert d["ai_available"] is False
    assert d["real_lines"] == [2]
    assert d["you_found"] == [2]
    assert "unavailable" in d["headline"].lower()


def test_ai_review_unknown_exercise_is_404(client):
    assert client.post("/ai-review", json={"exercise_id": "nope", "selected_lines": [1]}).status_code == 404


def test_ai_review_clean_file(client):
    d = client.post("/ai-review", json={"exercise_id": "ex-003", "selected_lines": []}).json()
    assert d["real_lines"] == []
    assert d["you_found"] == []
    assert d["ai_findings"] == []


# --- /progress ----------------------------------------------------
def test_progress_empty_session(client):
    d = client.get("/progress/none").json()
    assert d["total_attempts"] == 0
    assert d["timeline"] == []
    assert d["by_class"] == []


def test_progress_timeline_and_running_catch_rate(client):
    s = "prog"
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"})   # hit 1.0
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-001", "selected_lines": [], "explanation": "x"})    # miss 0.0
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"})   # hit 1.0

    d = client.get(f"/progress/{s}").json()
    assert d["total_attempts"] == 3
    assert [p["n"] for p in d["timeline"]] == [1, 2, 3]
    assert [p["localisation_score"] for p in d["timeline"]] == [1.0, 0.0, 1.0]
    assert [p["cumulative_catch_rate"] for p in d["timeline"]] == [1.0, 0.5, 0.67]


def test_progress_by_class_first_vs_latest(client):
    s = "trend"
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-014", "selected_lines": [], "explanation": "x"})   # logic miss
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-014", "selected_lines": [2], "explanation": "x"})  # logic hit

    trend = {c["defect_class"]: c for c in client.get(f"/progress/{s}").json()["by_class"]}
    logic = trend["logic"]
    assert logic["scores"] == [0.0, 1.0]
    assert logic["first_catch_rate"] == 0.0
    assert logic["latest_catch_rate"] == 1.0
    assert logic["improved"] is True


# --- /profile -------------------------------------------------------
def test_profile_empty_session(client):
    d = client.get("/profile/brand-new").json()
    assert d["total_attempts"] == 0
    assert d["by_class"] == []
    assert d["weakest_class"] is None


def test_profile_aggregates_and_sorts_weakest_first(client):
    s = "agg"
    for _ in range(2):  # injection: correct line -> catch_rate 1.0
        client.post("/grade", json={"session_id": s, "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"})
    for _ in range(2):  # logic: no selection -> catch_rate 0.0
        client.post("/grade", json={"session_id": s, "exercise_id": "ex-014", "selected_lines": [], "explanation": "x"})

    d = client.get(f"/profile/{s}").json()
    assert d["total_attempts"] == 4
    by = {c["defect_class"]: c for c in d["by_class"]}
    assert by["injection"]["attempts"] == 2
    assert by["injection"]["catch_rate"] == 1.0
    assert by["logic"]["catch_rate"] == 0.0
    assert d["by_class"][0]["catch_rate"] <= d["by_class"][-1]["catch_rate"]
    assert d["weakest_class"] == "logic"
    assert "logic" in d["recommendation"]


def test_profile_excludes_clean_from_weakest(client):
    s = "cleansess"
    for _ in range(2):  # clean flagged -> catch_rate 0.0 (worst)
        client.post("/grade", json={"session_id": s, "exercise_id": "ex-003", "selected_lines": [4], "explanation": "x"})
    for _ in range(2):  # injection hit -> catch_rate 1.0
        client.post("/grade", json={"session_id": s, "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"})

    d = client.get(f"/profile/{s}").json()
    assert d["weakest_class"] != "clean"
    assert d["weakest_class"] == "injection"


def test_profile_needs_two_attempts_before_recommending(client):
    s = "one"
    client.post("/grade", json={"session_id": s, "exercise_id": "ex-014", "selected_lines": [], "explanation": "x"})
    d = client.get(f"/profile/{s}").json()
    assert d["total_attempts"] == 1
    assert d["weakest_class"] is None
