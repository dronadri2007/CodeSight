"""Endpoint tests. Run without a GEMINI_API_KEY: the grader falls back
deterministically, and localisation + persistence + profile are fully exercised.

    cd backend && python -m pytest -q
"""


def _all_exercise_items(client, q=""):
    """Walk every page of GET /exercises. The corpus (~1018) exceeds the 500
    max `limit`, so membership / subset checks over the whole set must paginate.
    `q` is an extra query fragment, e.g. "&tier=intermediate"."""
    out, offset = [], 0
    while True:
        body = client.get(f"/exercises?limit=500&offset={offset}{q}").json()
        out.extend(body["items"])
        offset += 500
        if offset >= body["total"]:
            return out


def test_health(client):
    assert client.get("/health").json() == {"ok": True}


def test_debug_requires_admin(client):
    assert client.get("/debug").status_code == 401


def test_debug_shape(client, admin_headers):
    d = client.get("/debug", headers=admin_headers).json()
    assert d["db"] in {"sqlite", "postgres"}
    assert "gemini_key_present" in d["grader"]


# --- /exercises ---------------------------------------------------------
def test_exercise_list_has_no_answer_fields(client):
    body = client.get("/exercises?limit=500").json()
    items = body["items"]
    assert body["total"] >= 3
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
    def ids(q=""):
        return {e["id"] for e in _all_exercise_items(client, q)}

    beginner = ids("&tier=beginner")
    inter = ids("&tier=intermediate")
    all_ex = ids()
    assert beginner < inter <= all_ex
    assert all(e["difficulty"] == "beginner"
               for e in _all_exercise_items(client, "&tier=beginner"))
    assert all(e["difficulty"] in {"beginner", "intermediate"}
               for e in _all_exercise_items(client, "&tier=intermediate"))


def test_exercises_unknown_tier_is_422(client):
    assert client.get("/exercises?tier=wizard").status_code == 422


def test_exercises_source_filter(client):
    body = client.get("/exercises?source=curated&limit=500").json()
    assert body["items"] and all(e["source"] == "curated" for e in body["items"])
    assert body["total"] == len(body["items"])


def test_exercises_pagination_walks_the_set(client):
    full = client.get("/exercises?limit=500").json()
    total = full["total"]
    assert total > 10

    p1 = client.get("/exercises?limit=10&offset=0").json()
    assert p1["limit"] == 10 and p1["offset"] == 0 and p1["total"] == total
    assert len(p1["items"]) == 10

    p2 = client.get("/exercises?limit=10&offset=10").json()
    assert [e["id"] for e in p1["items"]] != [e["id"] for e in p2["items"]]
    assert {e["id"] for e in p1["items"]}.isdisjoint({e["id"] for e in p2["items"]})


def test_exercises_default_limit_is_100(client):
    body = client.get("/exercises").json()
    assert body["limit"] == 100
    assert len(body["items"]) == min(100, body["total"])


def test_exercises_limit_out_of_bounds_is_422(client):
    assert client.get("/exercises?limit=0").status_code == 422
    assert client.get("/exercises?limit=99999").status_code == 422


def test_exercises_summary_cache_busts_on_admin_write(client, admin_headers):
    before = client.get("/exercises?limit=500").json()["total"]
    body = {
        "title": "Cache bust probe", "language": "python",
        "defect_class": "logic", "difficulty": "beginner",
        "filename": "snippet.py", "code": "def f():\n    return 1\n",
        "real_lines": [], "fix_diff": "", "reference": "", "hints": [],
        "review_status": "approved",
    }
    r = client.post("/admin/exercises", headers=admin_headers, json=body)
    assert r.status_code == 201, r.text
    after = client.get("/exercises?limit=500").json()["total"]
    assert after == before + 1


def test_exercise_file_hides_answers(client):
    f = client.get("/exercises/ex-001").json()
    assert "code" in f
    assert f["title"] and f["defect_class"] == "injection"
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
        "hints_used", "hint_multiplier", "score_after_hints", "integrity",
    }
    assert set(d["localisation"]) == {"score", "verdict", "real_lines", "note"}
    assert set(d["explanation"]) == {"score", "verdict", "note"}
    assert set(d["teaching"]) == {"where", "why_missed", "pattern"}
    assert d["defect_class"] == "injection"
    assert d["integrity"] is None  # no telemetry sent


# --- integrity telemetry -------------------------------------------
def test_grade_integrity_clean_when_typed_normally(client):
    expl = "The user email is interpolated straight into the SQL string on line 2, "
    expl += "so an attacker can inject a quote and change the query. Bind it instead."
    d = client.post(
        "/grade",
        json={
            "session_id": "t", "exercise_id": "ex-001", "selected_lines": [2],
            "explanation": expl,
            "telemetry": {
                "time_to_submit_ms": 95_000, "paste_count": 0, "pasted_chars": 0,
                "tab_blur_count": 0, "tab_blur_ms": 0, "keystroke_count": len(expl) + 20,
            },
        },
    ).json()
    assert d["integrity"]["verdict"] == "clean"
    assert d["integrity"]["score"] == 1.0
    assert d["integrity"]["flags"] == []


def test_grade_integrity_flags_a_dominant_paste(client):
    expl = "x" * 200
    d = client.post(
        "/grade",
        json={
            "session_id": "t", "exercise_id": "ex-001", "selected_lines": [2],
            "explanation": expl,
            "telemetry": {
                "time_to_submit_ms": 8_000, "paste_count": 1, "pasted_chars": 200,
                "tab_blur_count": 0, "tab_blur_ms": 0, "keystroke_count": 3,
            },
        },
    ).json()
    assert d["integrity"]["verdict"] == "flagged"
    assert d["integrity"]["score"] < 0.4
    assert any("pasted" in f for f in d["integrity"]["flags"])
    # the grade itself is untouched by integrity
    assert d["score_after_hints"] == client.post(
        "/grade",
        json={"session_id": "t2", "exercise_id": "ex-001", "selected_lines": [2], "explanation": expl},
    ).json()["score_after_hints"]


def test_grade_integrity_flags_off_tab_time(client):
    expl = "This code fails to check that the row exists before using it. " * 3
    d = client.post(
        "/grade",
        json={
            "session_id": "t", "exercise_id": "ex-002", "selected_lines": [1],
            "explanation": expl,
            "telemetry": {
                "time_to_submit_ms": 120_000, "paste_count": 0, "pasted_chars": 0,
                "tab_blur_count": 2, "tab_blur_ms": 45_000, "keystroke_count": len(expl),
            },
        },
    ).json()
    assert d["integrity"]["verdict"] in {"review", "flagged"}
    assert any("focused" in f for f in d["integrity"]["flags"])


def test_grade_integrity_ignores_signals_on_short_answers(client):
    d = client.post(
        "/grade",
        json={
            "session_id": "t", "exercise_id": "ex-001", "selected_lines": [2],
            "explanation": "sql injection",
            "telemetry": {"time_to_submit_ms": 200, "paste_count": 0, "pasted_chars": 0,
                          "tab_blur_count": 0, "tab_blur_ms": 0, "keystroke_count": 1},
        },
    ).json()
    assert d["integrity"]["verdict"] == "clean"


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


# --- /leaderboard ------------------------------------------------
_HIT = {"ex-001": [2], "ex-013": [2, 3], "ex-014": [2], "ex-015": [2]}
_MISS = {"ex-001": [9], "ex-013": [9], "ex-014": [9], "ex-015": [9]}


def _play(client, session_id, correct: int, wrong: int = 0):
    ids = list(_HIT)
    for i in range(correct):
        eid = ids[i % len(ids)]
        client.post("/grade", json={"session_id": session_id, "exercise_id": eid,
                                    "selected_lines": _HIT[eid], "explanation": "x"})
    for i in range(wrong):
        eid = ids[i % len(ids)]
        client.post("/grade", json={"session_id": session_id, "exercise_id": eid,
                                    "selected_lines": _MISS[eid], "explanation": "x"})


def test_leaderboard_empty(client):
    d = client.get("/leaderboard").json()
    assert d["entries"] == []
    assert d["total_ranked"] == 0
    assert d["you"] is None


def test_leaderboard_ranks_by_score(client):
    _play(client, "ace", correct=4)
    _play(client, "mid", correct=2, wrong=2)
    _play(client, "low", correct=0, wrong=4)
    d = client.get("/leaderboard").json()
    order = [e["session_id"] for e in d["entries"]]
    assert order == ["ace", "mid", "low"]
    assert [e["rank"] for e in d["entries"]] == [1, 2, 3]
    assert d["entries"][0]["catch_rate"] == 1.0
    assert d["entries"][0]["score"] >= d["entries"][1]["score"] >= d["entries"][2]["score"]


def test_leaderboard_min_attempts_filter(client):
    _play(client, "grinder", correct=5)
    _play(client, "dabbler", correct=2)  # only 2 attempts
    default = client.get("/leaderboard").json()
    assert {e["session_id"] for e in default["entries"]} == {"grinder"}
    loosened = client.get("/leaderboard?min_attempts=2").json()
    assert {e["session_id"] for e in loosened["entries"]} == {"grinder", "dabbler"}


def test_leaderboard_you_row(client):
    _play(client, "ace", correct=4)
    _play(client, "me", correct=3, wrong=1)
    _play(client, "rival", correct=4)
    d = client.get("/leaderboard?session_id=me").json()
    assert d["you"]["session_id"] == "me"
    assert d["you"]["rank"] == next(e["rank"] for e in d["entries"] if e["session_id"] == "me")
    # a session with too few attempts is not ranked -> no you row
    _play(client, "newbie", correct=1)
    assert client.get("/leaderboard?session_id=newbie").json()["you"] is None


def test_leaderboard_limit_caps_entries_not_total(client):
    for name in ("a", "b", "c", "d"):
        _play(client, name, correct=3)
    d = client.get("/leaderboard?limit=2").json()
    assert len(d["entries"]) == 2
    assert d["total_ranked"] == 4


def test_leaderboard_tier_filter(client):
    _play(client, "s1", correct=3)
    client.get("/session/s1")  # creates the LearnerSession row at beginner
    assert {e["session_id"] for e in client.get("/leaderboard?tier=beginner").json()["entries"]} == {"s1"}
    assert client.get("/leaderboard?tier=intermediate").json()["entries"] == []
    assert client.get("/leaderboard?tier=wizard").status_code == 422


# --- GET /session/{id}/integrity (mentor view) -----------------
_CLEAN_TEL = {"time_to_submit_ms": 95000, "paste_count": 0, "pasted_chars": 0,
              "tab_blur_count": 0, "tab_blur_ms": 0, "keystroke_count": 400}
_DIRTY_TEL = {"time_to_submit_ms": 4000, "paste_count": 1, "pasted_chars": 200,
              "tab_blur_count": 1, "tab_blur_ms": 40000, "keystroke_count": 2}
_LONG_EXPL = "x" * 200


def _grade(client, sid, tel=None, expl="user input is interpolated into the SQL string"):
    body = {"session_id": sid, "exercise_id": "ex-001", "selected_lines": [2], "explanation": expl}
    if tel is not None:
        body["telemetry"] = tel
    return client.post("/grade", json=body)


def test_session_integrity_empty(client):
    d = client.get("/session/nobody/integrity").json()
    assert d == {
        "session_id": "nobody", "total_attempts": 0, "tracked": 0, "untracked": 0,
        "by_verdict": {"clean": 0, "review": 0, "flagged": 0}, "attempts": [],
    }


def test_session_integrity_counts_tracked_vs_untracked(client):
    _grade(client, "s", tel=_CLEAN_TEL)
    _grade(client, "s")                       # no telemetry
    _grade(client, "s", tel=_DIRTY_TEL, expl=_LONG_EXPL)
    d = client.get("/session/s/integrity").json()
    assert d["total_attempts"] == 3
    assert d["tracked"] == 2
    assert d["untracked"] == 1
    assert d["by_verdict"]["clean"] == 1
    assert d["by_verdict"]["flagged"] == 1
    assert len(d["attempts"]) == 2


def test_session_integrity_newest_first_and_flags(client):
    _grade(client, "s", tel=_CLEAN_TEL)
    _grade(client, "s", tel=_DIRTY_TEL, expl=_LONG_EXPL)
    rows = client.get("/session/s/integrity").json()["attempts"]
    assert rows[0]["integrity_verdict"] == "flagged"          # most recent first
    assert rows[0]["flags"] and any("pasted" in f for f in rows[0]["flags"])
    assert rows[0]["telemetry"]["paste_count"] == 1
    assert rows[1]["integrity_verdict"] == "clean"
    assert rows[1]["flags"] == []


def test_session_integrity_verdict_filter(client):
    _grade(client, "s", tel=_CLEAN_TEL)
    _grade(client, "s", tel=_DIRTY_TEL, expl=_LONG_EXPL)
    d = client.get("/session/s/integrity?verdict=flagged").json()
    assert [a["integrity_verdict"] for a in d["attempts"]] == ["flagged"]
    assert d["tracked"] == 2                  # counts still reflect everything
    assert client.get("/session/s/integrity?verdict=bogus").status_code == 422


def test_session_integrity_limit_caps_rows_not_counts(client):
    for _ in range(4):
        _grade(client, "s", tel=_CLEAN_TEL)
    d = client.get("/session/s/integrity?limit=2").json()
    assert len(d["attempts"]) == 2
    assert d["tracked"] == 4


# --- GET /profile/{id}/card ------------------------------------
def test_skill_card_empty_session(client):
    d = client.get("/profile/ghost/card").json()
    assert d["total_attempts"] == 0
    assert d["catch_rate"] == 0.0
    assert d["skill_score"] == 0.0
    assert d["headline"] == "Just Started"
    assert d["strongest_class"] is None and d["weakest_class"] is None
    assert d["false_positive_discipline"] is None
    assert d["leaderboard_rank"] is None
    assert d["tier"] == "beginner"


def test_skill_card_summarises_play(client):
    # strong on injection, weak on logic
    for _ in range(3):
        client.post("/grade", json={"session_id": "p", "exercise_id": "ex-001",
                                    "selected_lines": [2], "explanation": "sql string interpolation"})
    for _ in range(3):
        client.post("/grade", json={"session_id": "p", "exercise_id": "ex-014",
                                    "selected_lines": [9], "explanation": "x"})
    d = client.get("/profile/p/card").json()
    assert d["total_attempts"] == 6
    assert d["classes_covered"] == 2
    assert d["strongest_class"] == "injection"
    assert d["weakest_class"] == "logic"
    assert 0.0 < d["skill_score"] <= 1.0
    assert d["headline"] in {"Warming Up", "Developing Reviewer", "Solid Reviewer", "Sharp Reviewer"}


def test_skill_card_false_positive_discipline(client):
    # ex-003 is a clean file: selecting nothing is correct (1.0), flagging is a FP (0.0)
    client.post("/grade", json={"session_id": "clean1", "exercise_id": "ex-003",
                                "selected_lines": [], "explanation": "looks correct"})
    assert client.get("/profile/clean1/card").json()["false_positive_discipline"] == 1.0

    client.post("/grade", json={"session_id": "clean2", "exercise_id": "ex-003",
                                "selected_lines": [4], "explanation": "possible div by zero"})
    assert client.get("/profile/clean2/card").json()["false_positive_discipline"] == 0.0


def test_skill_card_leaderboard_rank(client):
    _play(client, "rival", correct=4)
    _play(client, "me", correct=3)
    d = client.get("/profile/me/card").json()
    assert d["leaderboard_rank"] is not None
    assert d["ranked_out_of"] >= 2
    # a 1-attempt session is below the leaderboard's min_attempts -> unranked
    _play(client, "rookie", correct=1)
    assert client.get("/profile/rookie/card").json()["leaderboard_rank"] is None


# --- admin auth ------------------------------------------------
def test_admin_needs_a_token(client):
    assert client.get("/admin/stats").status_code == 401
    assert client.get("/admin/exercises").status_code == 401


def test_admin_login_wrong_password(client):
    assert client.post("/admin/login", json={"password": "nope"}).status_code == 401


def test_admin_login_and_use_token(client, admin_headers):
    d = client.get("/admin/stats", headers=admin_headers).json()
    assert d["total"] >= 1000


# --- admin (read-only) ------------------------------------------
def test_admin_stats_shape(client, admin_headers):
    d = client.get("/admin/stats", headers=admin_headers).json()
    assert d["total"] >= 1000
    assert set(d) == {
        "total", "by_status", "by_source", "by_difficulty", "by_defect_class",
        "reported", "hidden", "sessions", "attempts", "distinct_reporters",
    }
    assert d["by_status"].get("Approved", 0) >= 19  # curated are approved
    assert d["by_source"].get("curated", 0) >= 35


def test_admin_exercises_filters(client, admin_headers):
    everything = client.get("/admin/exercises", headers=admin_headers).json()
    assert everything["total"] == everything["matched"] >= 1000
    row = everything["exercises"][0]
    assert set(row) >= {"id", "title", "review_status", "status_label", "difficulty_label", "reports", "source"}
    assert "code" not in row and "real_lines" not in row

    curated = client.get("/admin/exercises?source=curated", headers=admin_headers).json()
    assert curated["matched"] < everything["total"]
    assert all(r["source"] == "curated" for r in curated["exercises"])

    pending = client.get("/admin/exercises?status=Pending", headers=admin_headers).json()
    assert all(r["status_label"] == "Pending" for r in pending["exercises"])

    hit = client.get("/admin/exercises?search=injection&limit=5", headers=admin_headers).json()
    assert hit["matched"] >= 1 and len(hit["exercises"]) <= 5


def test_admin_exercises_reports_reflected(client, admin_headers):
    client.post("/exercises/ex-g0001/report", json={"session_id": "a", "reason": "bad"})
    client.post("/exercises/ex-g0001/report", json={"session_id": "b", "reason": "bad"})
    row = next(r for r in client.get("/admin/exercises?search=ex-g0001", headers=admin_headers).json()["exercises"] if r["id"] == "ex-g0001")
    assert row["reports"] == 2
    assert client.get("/admin/stats", headers=admin_headers).json()["reported"] == 1


# --- admin write path (Postgres overlay) ----------------------
def test_admin_review_status_persists_and_gates_listings(client, admin_headers):
    # reject a generated exercise -> it drops from the public listing
    assert "ex-g0002" in {e["id"] for e in _all_exercise_items(client)}
    r = client.post("/admin/exercises/ex-g0002/review", headers=admin_headers, json={"status": "rejected", "note": "wrong fix"})
    assert r.status_code == 200 and r.json()["review_status"] == "rejected"
    assert "ex-g0002" not in {e["id"] for e in _all_exercise_items(client)}
    # still resolvable by id
    assert client.get("/exercises/ex-g0002").status_code == 200
    # approve it back
    client.post("/admin/exercises/ex-g0002/review", headers=admin_headers, json={"status": "approved"})
    assert "ex-g0002" in {e["id"] for e in _all_exercise_items(client)}


def test_admin_create_edit_delete_exercise(client, admin_headers):
    body = {
        "title": "Admin-made injection", "defect_class": "injection", "difficulty": "beginner",
        "code": "def q(u):\n    return db.execute(\"select * from t where u='\" + u + \"'\")\n",
        "real_lines": [2], "fix_diff": "+ bind u", "reference": "string interpolation into SQL.",
        "hints": ["follow u", "line 2 concatenates"],
    }
    r = client.post("/admin/exercises", headers=admin_headers, json=body)
    assert r.status_code == 201, r.text
    exid = r.json()["id"]
    assert exid.startswith("adm-")

    # it shows up everywhere the effective set is used
    assert exid in {e["id"] for e in _all_exercise_items(client)}
    f = client.get(f"/exercises/{exid}").json()
    assert f["title"] == "Admin-made injection" and "real_lines" not in f
    full = client.get(f"/admin/exercises/{exid}", headers=admin_headers).json()
    assert full["real_lines"] == [2] and full["source"] == "admin"

    # grade against it (answers come from the overlay)
    g = client.post("/grade", json={"session_id": "s", "exercise_id": exid, "selected_lines": [2], "explanation": "x"}).json()
    assert g["localisation"]["verdict"] == "hit"

    # edit the title
    client.put(f"/admin/exercises/{exid}", headers=admin_headers, json={"title": "Renamed"})
    assert client.get(f"/exercises/{exid}").json()["title"] == "Renamed"

    # bad code on patch -> 422
    assert client.put(f"/admin/exercises/{exid}", headers=admin_headers, json={"code": "def ("}).status_code == 422

    # delete
    assert client.delete(f"/admin/exercises/{exid}", headers=admin_headers).status_code == 200
    assert client.get(f"/exercises/{exid}").status_code == 404


def test_admin_create_validation(client, admin_headers):
    assert client.post("/admin/exercises", headers=admin_headers, json={
        "title": "bad", "defect_class": "injection", "difficulty": "beginner", "code": "def ("
    }).status_code == 422
    assert client.post("/admin/exercises", headers=admin_headers, json={
        "title": "bad", "defect_class": "not-a-class", "difficulty": "beginner", "code": "x = 1"
    }).status_code == 422


def test_admin_review_unknown_is_404(client, admin_headers):
    assert client.post("/admin/exercises/nope/review", headers=admin_headers, json={"status": "approved"}).status_code == 404
    assert client.put("/admin/exercises/nope", headers=admin_headers, json={"title": "x"}).status_code == 404
    assert client.delete("/admin/exercises/nope", headers=admin_headers).status_code == 404


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
    assert xid not in {e["id"] for e in _all_exercise_items(client)}
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


def test_exercises_unknown_source_is_422(client):
    assert client.get("/exercises?source=bogus").status_code == 422


def test_admin_exercises_unknown_status_is_422(client, admin_headers):
    r = client.get("/admin/exercises?status=bogus", headers=admin_headers)
    assert r.status_code == 422
