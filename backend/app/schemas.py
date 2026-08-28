"""Request / response shapes. These mirror CONTRACT.md."""
from typing import Literal

from pydantic import BaseModel, Field


# --- GET /exercises ----------------------------------------------------------
class ExerciseSummary(BaseModel):
    id: str
    language: str
    title: str
    defect_class: str
    line_count: int


# --- GET /exercises/{id} ---------------------------------------------------
class ExerciseFile(BaseModel):
    id: str
    language: str
    filename: str
    code: str
    line_count: int
    hint_count: int


# --- GET /exercises/{id}/hints/{n} --------------------------------------
class HintResponse(BaseModel):
    index: int          # 1-based
    text: str
    total: int
    score_multiplier: float  # what the final score is scaled by if you stop here


# --- POST /grade -----------------------------------------------------------
class GradeRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=64)
    exercise_id: str
    selected_lines: list[int] = Field(default_factory=list)
    explanation: str = Field(default="", max_length=4000)
    hints_used: int = Field(default=0, ge=0, le=10)


class LocalisationResult(BaseModel):
    score: float
    verdict: str
    real_lines: list[int]
    note: str


class ExplanationResult(BaseModel):
    score: float
    verdict: str
    note: str


class TeachingResult(BaseModel):
    where: str
    why_missed: str
    pattern: str


class GradeResponse(BaseModel):
    localisation: LocalisationResult
    explanation: ExplanationResult
    teaching: TeachingResult
    defect_class: str
    reference_fix: str
    hints_used: int
    hint_multiplier: float          # 1.0 / 0.9 / 0.75 / 0.5
    score_after_hints: float        # mean(loc, expl) * multiplier, 0.0-1.0


# --- model-facing schema for the grader call -----------------------------
class ExplanationGrade(BaseModel):
    """What the grader model returns for the explanation + teaching half."""

    explanation_score: float
    explanation_verdict: Literal["strong", "partial", "weak"]
    explanation_note: str
    teaching_where: str
    teaching_why_missed: str
    teaching_pattern: str


# --- GET /profile/{session_id} ------------------------------------------
class ClassProgress(BaseModel):
    defect_class: str
    attempts: int
    catch_rate: float  # mean localisation score, 0.0-1.0
    avg_explanation: float


class WeaknessProfile(BaseModel):
    session_id: str
    total_attempts: int
    by_class: list[ClassProgress]
    weakest_class: str | None
    recommendation: str


# --- GET /progress/{session_id} ---------------------------------------
class TimelinePoint(BaseModel):
    n: int                       # 1-based attempt number in this session
    created_at: str              # ISO timestamp
    exercise_id: str
    defect_class: str
    localisation_score: float
    explanation_score: float
    cumulative_catch_rate: float  # running mean of localisation_score


class ClassTrend(BaseModel):
    defect_class: str
    attempts: int
    scores: list[float]          # localisation_score per attempt, in order
    first_catch_rate: float
    latest_catch_rate: float
    improved: bool


class ProgressReport(BaseModel):
    session_id: str
    total_attempts: int
    timeline: list[TimelinePoint]
    by_class: list[ClassTrend]
