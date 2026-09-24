import { api } from './client'
import type { AiReviewResponse } from './types'

/** POST /ai-review — blind AI review of the same file, diffed against you + ground truth. */
export async function getAiReview(
  exerciseId: string,
  selectedLines: number[],
): Promise<AiReviewResponse> {
  return api.post<AiReviewResponse>('/ai-review', {
    exercise_id: exerciseId,
    selected_lines: selectedLines,
  })
}
