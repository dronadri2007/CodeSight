import { api } from './client'
import { getSessionId } from '@/lib/session'
import type { SessionInfo, PromotionTest, PromotionResult } from './types'

/**
 * GET /session/{id} · GET /promotion-test/{id} · POST /promotion-test/{id}/evaluate
 * The session row is created on the backend at `beginner` on first GET.
 */

export async function getSession(sessionId = getSessionId()): Promise<SessionInfo> {
  return api.get<SessionInfo>(`/session/${sessionId}`)
}

export async function getPromotionTest(sessionId = getSessionId()): Promise<PromotionTest> {
  return api.get<PromotionTest>(`/promotion-test/${sessionId}`)
}

export async function evaluatePromotion(sessionId = getSessionId()): Promise<PromotionResult> {
  return api.post<PromotionResult>(`/promotion-test/${sessionId}/evaluate`)
}
