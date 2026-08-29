import { api, USE_MOCK, delay } from './client'
import type { AiReviewResponse } from './types'

/** POST /ai-review — blind AI review of the same file, diffed against you + ground truth. */
export async function getAiReview(
  exerciseId: string,
  selectedLines: number[],
): Promise<AiReviewResponse> {
  if (USE_MOCK) {
    await delay(1600)
    return {
      exercise_id: exerciseId,
      ai_available: false,
      ai_error: 'AI review needs the live backend.',
      real_lines: [],
      you_found: selectedLines,
      ai_lines: [],
      ai_findings: [],
      both_found: [],
      you_caught_ai_missed: [],
      ai_caught_you_missed: [],
      both_missed: [],
      headline: 'Connect the backend to compare against the AI reviewer.',
    }
  }
  return api.post<AiReviewResponse>('/ai-review', {
    exercise_id: exerciseId,
    selected_lines: selectedLines,
  })
}
