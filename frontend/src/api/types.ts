/**
 * Response/request shapes for the CodeSight API. These mirror
 * ../../CONTRACT.md — keep them in sync with the backend.
 * snake_case is preserved from the wire; do not camelCase here.
 */

export type Tier = 'beginner' | 'intermediate' | 'pro'
export type DefectClass =
  | 'injection'
  | 'auth'
  | 'error-handling'
  | 'concurrency'
  | 'logic'
  | 'resource'
  | 'clean'

// --- exercises -------------------------------------------------------
export interface ExerciseSummary {
  id: string
  language: string
  title: string
  defect_class: string
  line_count: number
  difficulty: string
  source: 'curated' | 'generated'
}

export interface ExerciseFile {
  id: string
  language: string
  title: string
  defect_class: string
  filename: string
  code: string
  line_count: number
  hint_count: number
  difficulty: string
  source: string
}

export interface HintResponse {
  index: number
  text: string
  total: number
  score_multiplier: number
}

export interface ReportResponse {
  exercise_id: string
  reports: number
  hidden: boolean
}

// --- grade ----------------------------------------------------------
export interface GradeTelemetry {
  time_to_submit_ms?: number
  paste_count?: number
  pasted_chars?: number
  tab_blur_count?: number
  tab_blur_ms?: number
  keystroke_count?: number
}

export interface GradeRequest {
  session_id: string
  exercise_id: string
  selected_lines: number[]
  explanation: string
  hints_used?: number
  telemetry?: GradeTelemetry
}

export interface IntegritySignal {
  score: number
  verdict: 'clean' | 'review' | 'flagged'
  flags: string[]
}

export interface GradeResponse {
  localisation: { score: number; verdict: string; real_lines: number[]; note: string }
  explanation: { score: number; verdict: string; note: string }
  teaching: { where: string; why_missed: string; pattern: string }
  defect_class: string
  reference_fix: string
  hints_used: number
  hint_multiplier: number
  score_after_hints: number
  integrity: IntegritySignal | null
}

// --- ai review ----------------------------------------------------
export interface AiFinding {
  lines: number[]
  issue: string
  severity: 'high' | 'medium' | 'low'
}

export interface AiReviewResponse {
  exercise_id: string
  ai_available: boolean
  ai_error: string | null
  real_lines: number[]
  you_found: number[]
  ai_lines: number[]
  ai_findings: AiFinding[]
  both_found: number[]
  you_caught_ai_missed: number[]
  ai_caught_you_missed: number[]
  both_missed: number[]
  headline: string
}

// --- profile / progress / skill card -----------------------------
export interface ClassProgress {
  defect_class: string
  attempts: number
  catch_rate: number
  avg_explanation: number
}

export interface WeaknessProfile {
  session_id: string
  total_attempts: number
  by_class: ClassProgress[]
  weakest_class: string | null
  recommendation: string
}

export interface TimelinePoint {
  n: number
  created_at: string
  exercise_id: string
  defect_class: string
  localisation_score: number
  explanation_score: number
  cumulative_catch_rate: number
}

export interface ClassTrend {
  defect_class: string
  attempts: number
  scores: number[]
  first_catch_rate: number
  latest_catch_rate: number
  improved: boolean
}

export interface ProgressReport {
  session_id: string
  total_attempts: number
  timeline: TimelinePoint[]
  by_class: ClassTrend[]
}

export interface SkillCard {
  session_id: string
  generated_at: string
  tier: Tier
  total_attempts: number
  classes_covered: number
  catch_rate: number
  avg_explanation: number
  skill_score: number
  headline: string
  strongest_class: string | null
  weakest_class: string | null
  false_positive_discipline: number | null
  leaderboard_rank: number | null
  ranked_out_of: number
}

// --- concepts ---------------------------------------------------
export interface ConceptSummary {
  id: string
  title: string
}

export interface ConceptVideo {
  title: string
  url: string
}

export interface Concept {
  id: string
  title: string
  summary: string
  example_bad: string
  example_good: string
  videos: ConceptVideo[]
  practice_exercise_ids: string[]
  micro_check_count: number
}

export interface MicroCheckQuestion {
  id: string
  prompt: string
  options: string[]
}

export interface MicroCheckData {
  concept_id: string
  questions: MicroCheckQuestion[]
}

export interface MicroCheckAnswer {
  question_id: string
  choice_index: number
}

export interface MicroCheckQuestionResult {
  question_id: string
  correct: boolean
  your_index: number | null
  correct_index: number
  explanation: string
}

export interface MicroCheckResult {
  concept_id: string
  total: number
  correct: number
  score: number
  passed: boolean
  results: MicroCheckQuestionResult[]
  practice_exercise_ids: string[]
}

// --- session / tiers / promotion --------------------------------
export interface SessionInfo {
  session_id: string
  tier: Tier
  next_tier: Tier | null
  promotion_test_available: boolean
}

export interface PromotionTest {
  session_id: string
  eligible: boolean
  from_tier: Tier
  to_tier: Tier | null
  exercise_ids: string[]
  reason: string
}

export interface PromotionResult {
  session_id: string
  passed: boolean
  from_tier: Tier
  to_tier: Tier | null
  tier_after: Tier
  scores: number[]
  mean_score: number
  needed: number
  missing: string[]
}

// --- leaderboard ----------------------------------------------
export interface LeaderboardEntry {
  rank: number
  session_id: string
  tier: Tier
  attempts: number
  catch_rate: number
  avg_explanation: number
  score: number
}

export interface Leaderboard {
  generated_at: string
  min_attempts: number
  total_ranked: number
  entries: LeaderboardEntry[]
  you: LeaderboardEntry | null
}

// --- mentor / integrity view --------------------------------
export interface IntegrityAttempt {
  attempt_id: string
  exercise_id: string
  defect_class: string
  created_at: string
  localisation_score: number
  explanation_score: number
  integrity_score: number | null
  integrity_verdict: string
  flags: string[]
  telemetry: Record<string, number | null> | null
}

export interface SessionIntegrity {
  session_id: string
  total_attempts: number
  tracked: number
  untracked: number
  by_verdict: Record<string, number>
  attempts: IntegrityAttempt[]
}

// --- topic prediction --------------------------------------
export interface TopicSummary {
  id: string
  language: string
  title: string
  difficulty: string
  line_count: number
  function_count: number
}

export interface TopicFile {
  id: string
  language: string
  title: string
  filename: string
  code: string
  line_count: number
  function_count: number
  difficulty: string
  candidate_classes: string[]
  instructions: string
}

export interface TopicClassResult {
  defect_class: string
  present: boolean
  predicted: boolean
  outcome: 'true_positive' | 'false_positive' | 'true_negative' | 'false_negative'
  note: string
}

export interface TopicPredictResult {
  id: string
  predicted_classes: string[] // normalised: valid, deduped, canonical order
  ignored_classes: string[] // dropped tokens, input order
  present_classes: string[] // the reveal
  true_positives: string[]
  false_positives: string[]
  false_negatives: string[]
  precision: number
  recall: number
  f1: number
  exact_match: boolean
  verdict: 'perfect' | 'over_predicted' | 'under_predicted' | 'partial' | 'miss'
  passed: boolean
  near_miss: boolean
  summary: string
  classes: TopicClassResult[] // always 6, canonical order
  practice_exercise_ids: string[]
}
