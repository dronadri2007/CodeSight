import { api } from './client'
import type { Leaderboard, Tier } from './types'

/**
 * GET /leaderboard — sessions ranked by 0.7*catch_rate + 0.3*avg_explanation.
 *
 * Pass `session_id` to also get back a `you` row with that session's rank
 * (`null` when the session is not ranked).
 */
export async function getLeaderboard(
  opts: { limit?: number; min_attempts?: number; tier?: Tier; session_id?: string } = {},
): Promise<Leaderboard> {
  return api.get<Leaderboard>('/leaderboard', {
    limit: opts.limit,
    min_attempts: opts.min_attempts,
    tier: opts.tier,
    session_id: opts.session_id,
  })
}
