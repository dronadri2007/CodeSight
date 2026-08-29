import { api, USE_MOCK, mockUnavailable, delay } from './client'
import type { TopicSummary, TopicFile, TopicPredictResult } from './types'

/**
 * Large-code topic prediction:
 *   GET  /topics                — metadata list
 *   GET  /topic/{id}            — the file + candidate_classes, no answers
 *   POST /topic/{id}/predict    — {predicted_classes} → set-overlap scoring + reveal
 */

export async function listTopics(): Promise<TopicSummary[]> {
  if (USE_MOCK) {
    await delay(150)
    return []
  }
  return api.get<TopicSummary[]>('/topics')
}

export async function getTopic(id: string): Promise<TopicFile> {
  if (USE_MOCK) return mockUnavailable('getTopic')
  return api.get<TopicFile>(`/topic/${id}`)
}

export async function predictTopic(
  id: string,
  predictedClasses: string[],
): Promise<TopicPredictResult> {
  if (USE_MOCK) return mockUnavailable('predictTopic')
  return api.post<TopicPredictResult>(`/topic/${id}/predict`, { predicted_classes: predictedClasses })
}
