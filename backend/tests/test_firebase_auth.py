"""Firebase auth wiring on /grade.

Firebase is unconfigured in tests (no FIREBASE_SERVICE_ACCOUNT_JSON), so the
anonymous path must be untouched. The signed-in path is exercised by overriding
the maybe_user dependency and capturing the Firestore write helper.
"""
from app import firebaseauth
from app import main as main_mod
from app.firebaseauth import maybe_user
from app.main import app


def test_firebase_disabled_by_default():
    assert firebaseauth.firebase_enabled() is False
    assert maybe_user("Bearer whatever") is None
    assert maybe_user(None) is None
    assert firebaseauth.verify_id_token("anything") is None


def test_grade_anonymous_still_works(client):
    r = client.post(
        "/grade",
        json={"session_id": "anon", "exercise_id": "ex-001", "selected_lines": [2], "explanation": "x"},
    )
    assert r.status_code == 200, r.text


def test_grade_signed_in_writes_profile(client, monkeypatch):
    calls = []
    monkeypatch.setattr(
        main_mod,
        "record_graded_submission",
        lambda uid, **kw: calls.append((uid, kw)),
    )
    app.dependency_overrides[maybe_user] = lambda: {"uid": "user-123", "email": "u@x.com"}
    try:
        r = client.post(
            "/grade",
            json={
                "session_id": "s1",
                "exercise_id": "ex-001",
                "selected_lines": [2],
                "explanation": "The query interpolates user input directly.",
            },
        )
        assert r.status_code == 200, r.text
        assert len(calls) == 1
        uid, kw = calls[0]
        assert uid == "user-123"
        assert set(kw) == {"defect_class", "localisation_score", "total_score", "passed", "submission"}
        assert kw["submission"]["exerciseId"] == "ex-001"
        assert isinstance(kw["passed"], bool)
    finally:
        app.dependency_overrides.pop(maybe_user, None)
