export interface Exercise {
  id: string
  number: number
  title: string
  repo: string
  language: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  defectClass: string
  defectClassId: string
  estimatedMinutes: number
  status: 'not-started' | 'completed' | 'needs-practice' | 'in-progress'
  code: string
  buggyLines: number[]
  fixDiff: string
  referenceExplanation: string
  teachingPoints: string[]
  pattern: string
  conceptId: string
}

export interface GradingResult {
  score: number
  localizationScore: number
  explanationScore: number
  falsePositives: number
  trueDefectLines: number[]
  whyMissed: string
  patternToWatch: string
  realFix: string
  defectClass: string
  status: 'confirmed' | 'plausible'
  studentFoundLines: number[]
  studentExplanation: string
}

export interface SkillProfile {
  overall: number
  streak: number
  exercisesCompleted: number
  improvement: number
  catchRates: Record<string, { rate: number; trend: number; attempts: number; history: number[] }>
}

export interface Concept {
  id: string
  defectClassId: string
  title: string
  shortTitle: string
  description: string
  what: string
  vulnerableCode: string
  saferCode: string
  language: string
  whyItMatters: string
  commonPattern: string
  resourceTitle: string
  resourceUrl: string
}

export interface BattleRoom {
  id: string
  code: string
  phase: 'lobby' | 'battle' | 'results'
  players: Player[]
  timeRemaining: number
  exerciseId: string
}

export interface Player {
  id: string
  name: string
  avatar: string
  submitted: boolean
  score?: number
  breakdown?: ScoreBreakdown
}

export interface ScoreBreakdown {
  correctFindings: number
  explanation: number
  falsePenalty: number
  timebonus: number
  total: number
}

export interface LeaderboardEntry {
  rank: number
  player: Player
  score: number
  breakdown: ScoreBreakdown
  badge?: string
}
