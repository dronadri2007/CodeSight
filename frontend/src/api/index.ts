/**
 * CodeSight API — one place to import from.
 *
 *   import { submitGrade, getSession, listExerciseSummaries } from '@/api'
 *
 * Every function hits the FastAPI backend when VITE_API_BASE_URL is set, and
 * falls back to local fixtures/stubs otherwise (USE_MOCK). Response shapes
 * mirror ../../CONTRACT.md and live in ./types.
 */
export { api, USE_MOCK, ApiError } from './client'
export { getSessionId, resetSessionId } from '../lib/session'

export * from './types'

export {
  listExerciseSummaries,
  getExerciseFile,
  getHint,
  reportExercise,
} from './exercises'

export { submitGrade } from './grade'
export { getAiReview } from './aiReview'
export { getProfile, getProgress, getSkillCard } from './profile'
export { getSession, getPromotionTest, evaluatePromotion } from './session'
export { getLeaderboard } from './leaderboard'
export { getSessionIntegrity } from './integrity'
export { listTopics, getTopic, predictTopic } from './topics'
export {
  getConcepts,
  getConcept,
  getMicroCheck,
  submitMicroCheck,
} from './concepts'

export {
  ADMIN_OFFLINE,
  adminLogin,
  adminStats,
  adminListExercises,
  adminGetExercise,
  adminCreateExercise,
  adminUpdateExercise,
  adminDeleteExercise,
  adminSetReview,
} from './admin'
export type { AdminExerciseQuery } from './admin'
