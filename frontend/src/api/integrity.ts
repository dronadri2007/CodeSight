import { api, USE_MOCK, delay } from './client'
import { getSessionId } from '../lib/session'
import type { SessionIntegrity } from './types'

/** GET /session/{id}/integrity — mentor view of telemetry-carrying attempts. */
export async function getSessionIntegrity(
  opts: { sessionId?: string; verdict?: 'clean' | 'review' | 'flagged'; limit?: number } = {},
): Promise<SessionIntegrity> {
  const sid = opts.sessionId ?? getSessionId()
  if (USE_MOCK) {
    await delay(150)
    return {
      session_id: sid,
      total_attempts: 0,
      tracked: 0,
      untracked: 0,
      by_verdict: { clean: 0, review: 0, flagged: 0 },
      attempts: [],
    }
  }
  return api.get<SessionIntegrity>(`/session/${sid}/integrity`, {
    verdict: opts.verdict,
    limit: opts.limit,
  })
}
