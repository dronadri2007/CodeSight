import { api } from './client'
import type { ExerciseFile, ExerciseList, HintResponse, ReportResponse, Tier } from './types'

/**
 * GET /exercises · GET /exercises/{id} · GET /exercises/{id}/hints/{n} ·
 * POST /exercises/{id}/report
 */

export async function listExerciseSummaries(
  opts: {
    tier?: Tier
    source?: 'curated' | 'generated'
    limit?: number
    offset?: number
  } = {},
): Promise<ExerciseList> {
  return api.get<ExerciseList>('/exercises', {
    tier: opts.tier,
    source: opts.source,
    limit: opts.limit,
    offset: opts.offset,
  })
}

export async function getExerciseFile(id: string): Promise<ExerciseFile> {
  return api.get<ExerciseFile>(`/exercises/${id}`)
}

export async function getHint(exerciseId: string, index: number): Promise<HintResponse> {
  return api.get<HintResponse>(`/exercises/${exerciseId}/hints/${index}`)
}

export async function reportExercise(
  exerciseId: string,
  sessionId: string,
  reason = '',
): Promise<ReportResponse> {
  return api.post<ReportResponse>(`/exercises/${exerciseId}/report`, { session_id: sessionId, reason })
}
