import { api, USE_MOCK, delay } from './client'
import { getSessionId } from '../lib/session'
import { getExerciseById } from '../mock/exercises'
import type { GradeRequest, GradeResponse, GradeTelemetry } from './types'

/**
 * POST /grade — submit a review for grading.
 *
 * `session_id` defaults to the browser's stored id. `telemetry` is optional
 * behavioural data (paste/keystroke/tab-blur/timing) used only for the
 * advisory integrity score — omit it and `integrity` comes back null.
 */
export async function submitGrade(input: {
  exerciseId: string
  selectedLines: number[]
  explanation: string
  hintsUsed?: number
  telemetry?: GradeTelemetry
  sessionId?: string
}): Promise<GradeResponse> {
  const body: GradeRequest = {
    session_id: input.sessionId ?? getSessionId(),
    exercise_id: input.exerciseId,
    selected_lines: input.selectedLines,
    explanation: input.explanation,
    hints_used: input.hintsUsed ?? 0,
    telemetry: input.telemetry,
  }

  if (USE_MOCK) {
    await delay(1400)
    const e = getExerciseById(input.exerciseId)
    const real: number[] = (e as unknown as { buggyLines?: number[] })?.buggyLines ?? []
    const hit = input.selectedLines.filter((l) => real.includes(l)).length
    const wrong = input.selectedLines.filter((l) => !real.includes(l)).length
    const locScore = real.length
      ? Math.max(0, hit / real.length - wrong * 0.25)
      : input.selectedLines.length === 0
        ? 1
        : 0
    const verdict = real.length === 0 && input.selectedLines.length ? 'false_positive' : locScore >= 0.99 ? 'hit' : locScore > 0 ? 'near' : 'miss'
    const mult = [1, 0.9, 0.75, 0.5][Math.min(input.hintsUsed ?? 0, 3)]
    const combined = (locScore + 0.5) / 2
    return {
      localisation: { score: Math.round(locScore * 100) / 100, verdict, real_lines: real, note: 'Offline mock scoring.' },
      explanation: { score: 0.5, verdict: 'partial', note: 'Explanation grading needs the live backend.' },
      teaching: {
        where: (e as unknown as { referenceExplanation?: string })?.referenceExplanation ?? 'See the reference.',
        why_missed: 'Compare your finding against the reference.',
        pattern: (e as unknown as { pattern?: string })?.pattern ?? '',
      },
      defect_class: (e as unknown as { defectClassId?: string })?.defectClassId ?? 'logic',
      reference_fix: (e as unknown as { fixDiff?: string })?.fixDiff ?? '',
      hints_used: input.hintsUsed ?? 0,
      hint_multiplier: mult,
      score_after_hints: Math.round(combined * mult * 100) / 100,
      integrity: input.telemetry ? { score: 1, verdict: 'clean', flags: [] } : null,
    }
  }

  return api.post<GradeResponse>('/grade', body)
}
