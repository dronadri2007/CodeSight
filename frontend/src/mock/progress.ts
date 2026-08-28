import type { SkillProfile } from '../types'

export const mockSkillProfile: SkillProfile = {
  overall: 72,
  streak: 4,
  exercisesCompleted: 18,
  improvement: 14,
  catchRates: {
    injection: { rate: 78, trend: 12, attempts: 5, history: [45, 50, 60, 72, 78] },
    auth: { rate: 61, trend: -4, attempts: 4, history: [70, 65, 68, 61] },
    'error-handling': { rate: 43, trend: 12, attempts: 6, history: [20, 28, 35, 38, 43] },
    concurrency: { rate: 55, trend: 8, attempts: 3, history: [40, 48, 55] },
    logic: { rate: 82, trend: 9, attempts: 6, history: [60, 68, 74, 78, 80, 82] },
    resource: { rate: 67, trend: 5, attempts: 4, history: [55, 60, 65, 67] },
  },
}

export const mockRecentAttempts = [
  {
    exerciseId: 'ex-01',
    title: 'Flask Login Endpoint',
    defectClass: 'Injection',
    score: 85,
    date: '2026-08-27',
    caught: true,
  },
  {
    exerciseId: 'ex-02',
    title: 'JWT Token Verification',
    defectClass: 'Auth',
    score: 42,
    date: '2026-08-26',
    caught: false,
  },
  {
    exerciseId: 'ex-09',
    title: 'Array Bounds Validator',
    defectClass: 'Logic',
    score: 91,
    date: '2026-08-25',
    caught: true,
  },
  {
    exerciseId: 'ex-05',
    title: 'Async Task Queue Worker',
    defectClass: 'Error Handling',
    score: 38,
    date: '2026-08-24',
    caught: false,
  },
]

export const mockImprovementData = [
  { period: 'Week 1', score: 48 },
  { period: 'Week 2', score: 55 },
  { period: 'Week 3', score: 61 },
  { period: 'Week 4', score: 68 },
  { period: 'This week', score: 72 },
]
