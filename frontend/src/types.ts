export type UserRole = 'student' | 'professional'

export interface StudentExercise {
  id: string
  number: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  defectClass: string
  defectClassId: string
  language: string
  estimatedMinutes: number
  description: string
  starterCode: string
  solutionCode: string
  testCases: { input: string; expected: string; description: string }[]
  weaknessPattern: string
  conceptId: string
  [key: string]: any
}

export interface StudentAnalysis {
  score: number
  strengths: { category: string; description: string }[]
  weaknesses: { category: string; description: string; severity: 'high' | 'medium' | 'low' }[]
  patternsNoticed: string[]
  whyItMatters: string
  recommendedConceptId: string
  recommendedConceptTitle: string
  [key: string]: any
}

export interface ProExercise {
  id: string
  number: number
  title: string
  repo: string
  language: string
  linesOfCode: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  primaryRisk: string
  defectClassId: string
  code: string
  groundTruthFindings: ProFinding[]
  fixDiff: string
  architecturalOverview: string
  [key: string]: any
}

export interface ProFinding {
  id: string
  lines: number[]
  riskCategory: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  explanation: string
  rule: string
  [key: string]: any
}

export interface ProReviewSubmission {
  exerciseId: string
  findings: {
    lines: number[]
    riskCategory: string
    severity: string
    explanation: string
  }[]
  selectedRiskAreas: string[]
  timeTakenSeconds: number
  [key: string]: any
}

export interface ProReviewResult {
  overallScore: number
  correctFindingsCount: number
  missedFindingsCount: number
  falsePositivesCount: number
  categoryScores: Record<string, number>
  whatYouCaught: string[]
  whatYouMissed: string[]
  whyItMattered: string
  patternToWatch: string
  fixDiff: string
  [key: string]: any
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
  [key: string]: any
}

// Backward compatibility types for legacy stores and mock modules
export interface Exercise {
  id: string
  number?: number
  title?: string
  repo?: string
  language?: string
  linesOfCode?: number
  difficulty?: any
  defectClass?: string
  defectClassId?: string
  conceptId?: string
  estimatedMinutes?: number
  code?: string
  groundTruthLines?: number[]
  groundTruthBugClass?: string
  groundTruthExplanation?: string
  fixDiff?: string
  hasDefect?: boolean
  explanationPrompt?: string
  status?: any
  referenceExplanation?: string
  buggyLines?: number[]
  teachingPoints?: string[]
  pattern?: string
  [key: string]: any
}

export interface GradingResult {
  score?: number
  localizationScore?: number
  explanationScore?: number
  falsePositives?: number
  verdict?: string
  status?: string
  realDefectLines?: number[]
  trueDefectLines?: number[]
  studentFoundLines?: number[]
  studentExplanation?: string
  realDefectExplanation?: string
  whyMissed?: string
  patternToWatch?: string
  realFix?: string
  defectClass?: string
  [key: string]: any
}

export interface BattleRoom {
  id: string
  code?: string
  name?: string
  exerciseId?: string
  status?: any
  timeLimit?: number
  phase?: string
  timeRemaining?: number
  players?: {
    id: string
    name: string
    avatar: string
    status?: any
    isHost?: boolean
    submitted?: boolean
    [key: string]: any
  }[]
  [key: string]: any
}

export interface LeaderboardEntry {
  rank: number
  name?: string
  handle?: string
  player?: {
    id: string
    name: string
    avatar: string
    submitted?: boolean
    [key: string]: any
  }
  score?: number
  correctFindings?: number
  explanationScore?: number
  falsePositives?: number
  timeBonus?: number
  badge?: string
  isCurrentUser?: boolean
  exercisesCount?: number
  catchRate?: number
  streak?: number
  breakdown?: {
    correctFindings?: number
    explanationQuality?: number
    explanation?: number
    falsePositives?: number
    falsePenalty?: number
    timeBonus?: number
    timebonus?: number
    total?: number
    [key: string]: any
  }
  [key: string]: any
}

export interface SkillProfile {
  overall?: number
  overallScore?: number
  exercisesCompleted?: number
  exercisesReviewed?: number
  streak?: number
  improvement?: number
  improvementPercentage?: number
  focusDefectClass?: string
  focusReason?: string
  catchRates?: {
    [key: string]: any
  } | any
  [key: string]: any
}
