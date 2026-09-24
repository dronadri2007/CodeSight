import { api } from './client'
import { getSessionId } from '@/lib/session'
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
  return api.post<GradeResponse>('/grade', body)
}
