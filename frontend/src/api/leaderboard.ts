import { api, USE_MOCK, delay } from './client'
import type { Leaderboard, Tier } from './types'

/** GET /leaderboard — sessions ranked by 0.7*catch_rate + 0.3*avg_explanation. */
export async function getLeaderboard(
  opts: { limit?: number; minAttempts?: number; tier?: Tier; sessionId?: string } = {},
): Promise<Leaderboard> {
  if (USE_MOCK) {
    await delay(150)
    return {
      generated_at: new Date().toISOString(),
      min_attempts: opts.minAttempts ?? 3,
      total_ranked: 0,
      entries: [],
      you: null,
    }
  }
  return api.get<Leaderboard>('/leaderboard', {
    limit: opts.limit,
    min_attempts: opts.minAttempts,
    tier: opts.tier,
    session_id: opts.sessionId,
  })
}
