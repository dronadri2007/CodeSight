import { api } from './client'
import { getSessionId } from '@/lib/session'
import type { WeaknessProfile, ProgressReport, SkillCard } from './types'

/** GET /profile/{id} · GET /progress/{id} · GET /profile/{id}/card */

export async function getProfile(sessionId = getSessionId()): Promise<WeaknessProfile> {
  return api.get<WeaknessProfile>(`/profile/${sessionId}`)
}

export async function getProgress(sessionId = getSessionId()): Promise<ProgressReport> {
  return api.get<ProgressReport>(`/progress/${sessionId}`)
}

export async function getSkillCard(sessionId = getSessionId()): Promise<SkillCard> {
  return api.get<SkillCard>(`/profile/${sessionId}/card`)
}
