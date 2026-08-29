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
        assert set(it) == {
            "id", "language", "title", "defect_class", "line_count",
            "difficulty", "source",
        }
        assert it["difficulty"] in {"beginner", "intermediate", "pro"}
        assert it["source"] in {"curated", "generated"}
        assert not any(k in it for k in ("real_lines", "fix_diff", "reference", "code"))


def test_exercises_tier_gate_is_cumulative(client):
    beginner = {e["id"] for e in client.get("/exercises?tier=beginner").json()}
    inter = {e["id"] for e in client.get("/exercises?tier=intermediate").json()}
    all_ex = {e["id"] for e in client.get("/exercises").json()}
    assert beginner < inter <= all_ex
    assert all(e["difficulty"] == "beginner" for e in client.get("/exercises?tier=beginner").json())
    assert all(e["difficulty"] in {"beginner", "intermediate"}
               for e in client.get("/exercises?tier=intermediate").json())


def test_exercises_unknown_tier_is_422(client):
    assert client.get("/exercises?tier=wizard").status_code == 422


def test_exercises_source_filter(client):
    curated = client.get("/exercises?source=curated").json()
    assert curated and all(e["source"] == "curated" for e in curated)


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
        "exercise_id", "ai_available", "ai_error", "real_lines", "you_found", "ai_lines",
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


# --- concepts (recommendation engine) --------------------------------
def test_concepts_list(client):
    ids = {c["id"] for c in client.get("/concepts").json()}
    assert ids == {"injection", "auth", "error-handling", "concurrency", "logic", "resource"}


def test_concept_detail_shape(client):
    c = client.get("/concept/injection").json()
    assert set(c) == {
        "id", "title", "summary", "example_bad", "example_good",
        "videos", "practice_exercise_ids", "micro_check_count",
    }
    assert c["videos"] and all(set(v) == {"title", "url"} for v in c["videos"])
    assert c["practice_exercise_ids"]
    assert c["micro_check_count"] == 3


def test_concept_unknown_is_404(client):
    assert client.get("/concept/telepathy").status_code == 404


# --- concept micro-check --------------------------------------------
def test_micro_check_questions_hide_the_answer_key(client):
    d = client.get("/concept/injection/micro-check").json()
    assert d["concept_id"] == "injection"
    assert len(d["questions"]) == 3
    for q in d["questions"]:
        assert set(q) == {"id", "prompt", "options"}
        assert len(q["options"]) >= 2


def test_micro_check_unknown_concept_is_404(client):
    assert client.get("/concept/nope/micro-check").status_code == 404
    assert client.post("/concept/nope/micro-check", json={"answers": []}).status_code == 404


def test_micro_check_all_correct_passes(client):
    # answer key lives server-side; pull it via the module for the test
    from app.concepts import _CONCEPTS

    key = _CONCEPTS["auth"]["micro_check"]
    body = {"answers": [{"question_id": q["id"], "choice_index": q["answer_index"]} for q in key]}
    d = client.post("/concept/auth/micro-check", json=body).json()
    assert d["total"] == 3
    assert d["correct"] == 3
    assert d["score"] == 1.0
    assert d["passed"] is True
    assert all(r["correct"] for r in d["results"])
    assert all("explanation" in r and "correct_index" in r for r in d["results"])


def test_micro_check_one_wrong_still_passes_two_of_three(client):
    from app.concepts import _CONCEPTS

    key = _CONCEPTS["logic"]["micro_check"]
    answers = [{"question_id": q["id"], "choice_index": q["answer_index"]} for q in key]
    answers[0]["choice_index"] = (key[0]["answer_index"] + 1) % len(key[0]["options"])
    d = client.post("/concept/logic/micro-check", json={"answers": answers}).json()
    assert d["correct"] == 2
    assert d["passed"] is True
    assert d["results"][0]["correct"] is False
    assert d["results"][0]["your_index"] == answers[0]["choice_index"]


def test_micro_check_missing_answers_count_wrong_and_fail(client):
    d = client.post("/concept/resource/micro-check", json={"answers": []}).json()
    assert d["correct"] == 0
    assert d["score"] == 0.0
    assert d["passed"] is False
    assert all(r["your_index"] is None for r in d["results"])
    assert d["practice_exercise_ids"] == ["ex-016", "ex-017"]


# --- session tier -------------------------------------------------
def test_session_defaults_to_beginner(client):
    d = client.get("/session/newbie").json()
    assert d["tier"] == "beginner"
    assert d["next_tier"] == "intermediate"
    assert d["promotion_test_available"] is True


# --- promotion test --------------------------------------------
def test_promotion_test_offers_three_next_tier_exercises(client):
    d = client.get("/promotion-test/pt1").json()
    assert d["eligible"] is True
    assert d["from_tier"] == "beginner"
    assert d["to_tier"] == "intermediate"
    assert len(d["exercise_ids"]) == 3
    # all three are intermediate + curated
    for xid in d["exercise_ids"]:
        f = client.get(f"/exercises/{xid}").json()
        assert f["difficulty"] == "intermediate" and f["source"] == "curated"


def test_promotion_blocked_until_all_three_attempted(client):
    s = "pt2"
    ids = client.get(f"/promotion-test/{s}").json()["exercise_ids"]
    client.post("/grade", json={"session_id": s, "exercise_id": ids[0], "selected_lines": [2], "explanation": "x"})
    d = client.post(f"/promotion-test/{s}/evaluate").json()
    assert d["passed"] is False
    assert set(d["missing"]) == set(ids[1:])
    assert client.get(f"/session/{s}").json()["tier"] == "beginner"


def test_promotion_passes_and_persists_tier(client):
    s = "pt3"
    ids = client.get(f"/promotion-test/{s}").json()["exercise_ids"]
    # a wide selection [1..5] covers the defect in every small snippet ->
    # first-attempt localisation is a hit for all three
    for xid in ids:
        client.post("/grade", json={
            "session_id": s, "exercise_id": xid,
            "selected_lines": [1, 2, 3, 4, 5], "explanation": "covering the defect",
        })
    d = client.post(f"/promotion-test/{s}/evaluate").json()
    assert d["passed"] is True
    assert d["from_tier"] == "beginner" and d["to_tier"] == "intermediate"
    assert d["mean_score"] >= d["needed"]
    assert client.get(f"/session/{s}").json()["tier"] == "intermediate"


def test_promotion_fails_when_scores_too_low(client):
    s = "ptlow"
    ids = client.get(f"/promotion-test/{s}").json()["exercise_ids"]
    for xid in ids:  # wildly wrong line -> localisation miss/false_positive
        client.post("/grade", json={
            "session_id": s, "exercise_id": xid, "selected_lines": [99], "explanation": "x",
        })
    d = client.post(f"/promotion-test/{s}/evaluate").json()
    assert d["passed"] is False
    assert client.get(f"/session/{s}").json()["tier"] == "beginner"


def test_promotion_test_at_pro_is_ineligible(client):
    s = "topdog"
    # force to pro by two promotions
    for _ in range(2):
        for xid in client.get(f"/promotion-test/{s}").json()["exercise_ids"]:
            client.post("/grade", json={
                "session_id": s, "exercise_id": xid,
                "selected_lines": [1, 2, 3, 4, 5], "explanation": "x",
            })
        client.post(f"/promotion-test/{s}/evaluate")
    assert client.get(f"/session/{s}").json()["tier"] == "pro"
    d = client.get(f"/promotion-test/{s}").json()
    assert d["eligible"] is False
    assert d["to_tier"] is None


# --- exercise reporting -------------------------------------------
def test_report_hides_exercise_after_three_distinct_sessions(client):
    xid = "ex-002"
    for i, sess in enumerate(["a", "b"]):
        r = client.post(f"/exercises/{xid}/report", json={"session_id": sess, "reason": "bad"}).json()
        assert r["hidden"] is False
    r = client.post(f"/exercises/{xid}/report", json={"session_id": "c", "reason": "bad"}).json()
    assert r["reports"] == 3 and r["hidden"] is True
    # gone from the listing
    assert xid not in {e["id"] for e in client.get("/exercises").json()}
    # still resolvable by id (in-progress attempt)
    assert client.get(f"/exercises/{xid}").status_code == 200
    assert client.post("/grade", json={
        "session_id": "x", "exercise_id": xid, "selected_lines": [5, 6], "explanation": "x",
    }).status_code == 200


def test_report_same_session_thrice_does_not_hide(client):
    xid = "ex-005"
    for _ in range(3):
        r = client.post(f"/exercises/{xid}/report", json={"session_id": "spammer"}).json()
    assert r["reports"] == 1 and r["hidden"] is False


def test_report_unknown_exercise_is_404(client):
    assert client.post("/exercises/nope/report", json={"session_id": "a"}).status_code == 404
