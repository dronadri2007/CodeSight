import { api } from './client'
import { getSessionId } from '@/lib/session'
import type { SessionIntegrity } from './types'

/** GET /session/{id}/integrity — mentor view of telemetry-carrying attempts. */
export async function getSessionIntegrity(
  opts: { sessionId?: string; verdict?: 'clean' | 'review' | 'flagged'; limit?: number } = {},
): Promise<SessionIntegrity> {
  const sid = opts.sessionId ?? getSessionId()
  return api.get<SessionIntegrity>(`/session/${sid}/integrity`, {
    verdict: opts.verdict,
    limit: opts.limit,
  })
}
