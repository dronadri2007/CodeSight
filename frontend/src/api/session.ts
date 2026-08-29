import { api, USE_MOCK, delay } from './client'
import { getSessionId } from '../lib/session'
import type { SessionInfo, PromotionTest, PromotionResult } from './types'

/**
 * GET /session/{id} · GET /promotion-test/{id} · POST /promotion-test/{id}/evaluate
 * The session row is created on the backend at `beginner` on first GET.
 */

export async function getSession(sessionId = getSessionId()): Promise<SessionInfo> {
  if (USE_MOCK) {
    await delay(120)
    return { session_id: sessionId, tier: 'beginner', next_tier: 'intermediate', promotion_test_available: true }
  }
  return api.get<SessionInfo>(`/session/${sessionId}`)
}

export async function getPromotionTest(sessionId = getSessionId()): Promise<PromotionTest> {
  if (USE_MOCK) {
    await delay(150)
    return { session_id: sessionId, eligible: true, from_tier: 'beginner', to_tier: 'intermediate', exercise_ids: [], reason: 'Offline mock — connect the backend for the real test.' }
  }
  return api.get<PromotionTest>(`/promotion-test/${sessionId}`)
}

export async function evaluatePromotion(sessionId = getSessionId()): Promise<PromotionResult> {
  if (USE_MOCK) {
    await delay(300)
    return { session_id: sessionId, passed: false, from_tier: 'beginner', to_tier: 'intermediate', tier_after: 'beginner', scores: [], mean_score: 0, needed: 0.7, missing: [] }
  }
  return api.post<PromotionResult>(`/promotion-test/${sessionId}/evaluate`)
}
