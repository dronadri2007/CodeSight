import { api, USE_MOCK, delay } from './client'
import type { ExerciseSummary, ExerciseFile, HintResponse, ReportResponse } from './types'
import { mockExercises, getExerciseById } from '../mock/exercises'
import type { Exercise, GradingResult } from '../types'

/**
 * GET /exercises · GET /exercises/{id} · GET /exercises/{id}/hints/{n} ·
 * POST /exercises/{id}/report
 *
 * When VITE_API_BASE_URL is unset (USE_MOCK) these fall back to the local
 * fixtures in ../mock/exercises so the app still runs offline.
 */

const TIER_ORDER = ['beginner', 'intermediate', 'pro'] as const
type Tier = (typeof TIER_ORDER)[number]

function summaryFromMock(e: Exercise): ExerciseSummary {
  return {
    id: e.id,
    language: e.language ?? 'python',
    title: e.title,
    defect_class: e.defectClassId ?? e.defectClass ?? 'logic',
    line_count: (e.code ?? '').split('\n').length,
    difficulty: (e as unknown as { difficulty?: string }).difficulty ?? 'beginner',
    source: 'curated',
  }
}

export async function listExerciseSummaries(
  opts: { tier?: Tier; source?: 'curated' | 'generated' } = {},
): Promise<ExerciseSummary[]> {
  if (USE_MOCK) {
    await delay(200)
    let out = mockExercises.map(summaryFromMock)
    if (opts.tier) {
      const allowed = new Set(TIER_ORDER.slice(0, TIER_ORDER.indexOf(opts.tier) + 1))
      out = out.filter((e) => allowed.has(e.difficulty as Tier))
    }
    if (opts.source) out = out.filter((e) => e.source === opts.source)
    return out
  }
  return api.get<ExerciseSummary[]>('/exercises', { tier: opts.tier, source: opts.source })
}

export async function getExerciseFile(id: string): Promise<ExerciseFile> {
  if (USE_MOCK) {
    await delay(150)
    const e = getExerciseById(id)
    if (!e) throw new Error(`exercise ${id} not found`)
    return {
      id: e.id,
      language: e.language ?? 'python',
      filename: (e as unknown as { filename?: string }).filename ?? 'snippet.py',
      code: e.code ?? '',
      line_count: (e.code ?? '').split('\n').length,
      hint_count: (e.hints ?? []).length,
      difficulty: (e as unknown as { difficulty?: string }).difficulty ?? 'beginner',
      source: 'curated',
    }
  }
  return api.get<ExerciseFile>(`/exercises/${id}`)
}

export async function getHint(exerciseId: string, index: number): Promise<HintResponse> {
  if (USE_MOCK) {
    await delay(120)
    const e = getExerciseById(exerciseId)
    const hints: string[] = (e as unknown as { hints?: string[] })?.hints ?? []
    if (index < 1 || index > hints.length) throw new Error('no such hint')
    const mult = [1, 0.9, 0.75, 0.5][Math.min(index, 3)]
    return { index, text: hints[index - 1], total: hints.length, score_multiplier: mult }
  }
  return api.get<HintResponse>(`/exercises/${exerciseId}/hints/${index}`)
}

export async function reportExercise(
  exerciseId: string,
  sessionId: string,
  reason = '',
): Promise<ReportResponse> {
  if (USE_MOCK) {
    await delay(100)
    return { exercise_id: exerciseId, reports: 1, hidden: false }
  }
  return api.post<ReportResponse>(`/exercises/${exerciseId}/report`, { session_id: sessionId, reason })
}

// ---------------------------------------------------------------------------
// Legacy shims — kept so the pre-rewrite pages (ExerciseLibrary, ReviewWorkspace)
// still compile. New code should use the functions above + api/grade.ts.
// ---------------------------------------------------------------------------

export interface SubmitReviewPayload {
  exerciseId: string
  selectedLines: number[]
  explanation: string
  timeTaken: number
  hintsUsed: number
}

/** @deprecated use listExerciseSummaries */
export async function listExercises(classFilter?: string): Promise<Exercise[]> {
  await delay(200)
  if (classFilter && classFilter !== 'all') {
    return mockExercises.filter((e) => e.defectClassId === classFilter)
  }
  return mockExercises
}

/** @deprecated use getExerciseFile */
export async function getExercise(id: string): Promise<Exercise> {
  await delay(150)
  const e = getExerciseById(id)
  if (!e) throw new Error(`Exercise ${id} not found`)
  return e
}

/** @deprecated use submitGrade from api/grade.ts */
export async function submitReview(payload: SubmitReviewPayload): Promise<GradingResult> {
  await delay(1200)
  const e = getExerciseById(payload.exerciseId)
  if (!e) throw new Error('Exercise not found')
  const buggy = e.buggyLines ?? []
  const hit = payload.selectedLines.filter((l) => buggy.includes(l)).length
  const wrong = payload.selectedLines.filter((l) => !buggy.includes(l)).length
  const loc = buggy.length ? Math.round((hit / buggy.length) * 100) : payload.selectedLines.length ? 50 : 100
  const words = payload.explanation.trim().split(/\s+/).length
  const expl = Math.min(100, Math.round((Math.min(words, 80) / 80) * 100))
  return {
    score: Math.max(0, Math.min(100, Math.round(loc * 0.5 + expl * 0.5 - wrong * 8))),
    localizationScore: loc,
    explanationScore: expl,
    falsePositives: wrong,
    trueDefectLines: buggy,
    whyMissed: loc < 60 ? `The key issue was on line(s) ${buggy.join(', ')}. ${e.referenceExplanation ?? ''}` : 'Good localisation.',
    patternToWatch: e.pattern ?? '',
    realFix: e.fixDiff ?? '',
    defectClass: e.defectClass ?? '',
    status: loc >= 60 ? 'confirmed' : 'plausible',
    studentFoundLines: payload.selectedLines,
    studentExplanation: payload.explanation,
  }
}
