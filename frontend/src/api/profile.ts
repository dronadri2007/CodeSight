import { api, USE_MOCK, mockUnavailable, delay } from './client'
import { getSessionId } from '../lib/session'
import type { WeaknessProfile, ProgressReport, SkillCard } from './types'

/** GET /profile/{id} · GET /progress/{id} · GET /profile/{id}/card */

export async function getProfile(sessionId = getSessionId()): Promise<WeaknessProfile> {
  if (USE_MOCK) {
    await delay(150)
    return { session_id: sessionId, total_attempts: 0, by_class: [], weakest_class: null, recommendation: 'Do a few exercises to build a profile.' }
  }
  return api.get<WeaknessProfile>(`/profile/${sessionId}`)
}

export async function getProgress(sessionId = getSessionId()): Promise<ProgressReport> {
  if (USE_MOCK) {
    await delay(150)
    return { session_id: sessionId, total_attempts: 0, timeline: [], by_class: [] }
  }
  return api.get<ProgressReport>(`/progress/${sessionId}`)
}

export async function getSkillCard(sessionId = getSessionId()): Promise<SkillCard> {
  if (USE_MOCK) return mockUnavailable('getSkillCard')
  return api.get<SkillCard>(`/profile/${sessionId}/card`)
}
