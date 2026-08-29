export type UserLevel =
  | 'Student Beginner'
  | 'Student Intermediate'
  | 'Student Pro'
  | 'AI Engineer Beginner'
  | 'AI Engineer Intermediate'
  | 'AI Engineer Pro'

export type ProblemMode = 'student' | 'ai_engineer'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface DefectClass {
  id: string
  label: string
  shortTitle: string
  description: string
  icon: string
  color: string
}

export interface TestCase {
  id?: string
  input: string
  expected?: string
  expectedOutput?: string
  description?: string
}

export interface Problem {
  id: string
  number: number
  title: string
  mode: ProblemMode
  difficulty: Difficulty
  defectClassId: string
  defectClassName: string
  acceptanceRate: number
  estimatedMinutes: number
  description: string
  starterCode: string
  brokenAiCode?: string
  solutionCode: string
  optimalTC: string // e.g. 'O(n)'
  optimalSC: string // e.g. 'O(1)'
  brokenTC?: string // e.g. 'O(n^2)'
  brokenSC?: string // e.g. 'O(n)'
  testCases: TestCase[]
  weaknessPattern: string
  conceptId: string
  youtubeVideoId?: string
  examEligible?: boolean
  language?: string
  repo?: string
  buggyLines?: number[]
  isExamProblem?: boolean
}

export interface ComplexitySubmissionResult {
  problemId: string
  problemTitle: string
  mode: ProblemMode
  userCode: string
  userTC: string
  userSC: string
  optimalTC: string
  optimalSC: string
  tcScore: number // 0 to 50
  scScore: number // 0 to 50
  totalScore: number // 0 to 100
  efficiencyDelta?: number // For AI Eng mode
  isFalsePositive?: boolean
  pass: boolean
  aiFeedback: {
    summary: string
    timeAnalysis: string
    spaceAnalysis: string
    optimizationGuidance: string[]
    recommendedPattern: string
  }
  timestamp: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  level: UserLevel
  levelIndex: number // 1 to 6
  totalXP: number
  globalRank: number
  currentStreak: number
  problemsSolved: number
  eloRating: number
  weaknessCatchRates: Record<string, number> // defectClassId -> catch rate %
  recentSubmissions: ComplexitySubmissionResult[]
}

export interface PromotionExamState {
  examId: string
  targetLevel: UserLevel
  timeRemainingSeconds: number
  problems: Problem[]
  currentProblemIndex: number
  submissions: Record<string, string> // problemId -> code
  passed?: boolean
  completed?: boolean
}

export interface BattlePlayer {
  id: string
  name: string
  avatar: string
  isHost?: boolean
  score: number
  submitted: boolean
  submitTimeSeconds?: number
  rank?: number
  isCurrentUser?: boolean
}

export interface BattleRoomState {
  roomId: string
  roomCode: string
  type: 'friend' | 'ranked'
  hostId: string
  status: 'waiting' | 'in_progress' | 'completed'
  problemCount: number
  problems: Problem[]
  currentProblemIndex: number
  timeLimitSeconds: number
  timeRemainingSeconds: number
  players: BattlePlayer[]
  speedBonusRemaining: number
}

export interface ConceptDetail {
  id: string
  defectClassId: string
  title: string
  shortTitle: string
  description: string
  deepDive: string
  vulnerableCode: string
  saferCode: string
  language: string
  whyItMatters: string
  commonPatternsToWatch: string[]
  youtubeVideo: {
    id: string
    title: string
    channel: string
    duration: string
    embedUrl: string
  }
  miniCheckQuestions: {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
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

// Backward Compatibility Interfaces
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
  groundTruthFindings?: any[]
  groundTruthLines?: number[]
  groundTruthBugClass?: string
  groundTruthExplanation?: string
  fixDiff?: string
  architecturalOverview?: string
  hasDefect?: boolean
  explanationPrompt?: string
  status?: any
  referenceExplanation?: string
  buggyLines?: number[]
  teachingPoints?: string[]
  pattern?: string
  [key: string]: any
}

export interface StudentExercise {
  id: string
  number?: number
  title?: string
  difficulty?: any
  defectClass?: string
  defectClassId?: string
  language?: string
  estimatedMinutes?: number
  description?: string
  starterCode?: string
  solutionCode?: string
  testCases?: any[]
  weaknessPattern?: string
  conceptId?: string
  [key: string]: any
}

export interface ProExercise {
  id: string
  number?: number
  title?: string
  repo?: string
  language?: string
  linesOfCode?: number
  difficulty?: any
  primaryRisk?: string
  defectClassId?: string
  code?: string
  groundTruthFindings?: any[]
  fixDiff?: string
  architecturalOverview?: string
  [key: string]: any
}

export interface ProFinding {
  id?: string
  lines?: number[]
  riskCategory?: string
  severity?: any
  explanation?: string
  rule?: string
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
  players?: any[]
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
  confirmed?: boolean
  [key: string]: any
}

export interface Concept {
  id: string
  defectClassId?: string
  title?: string
  shortTitle?: string
  description?: string
  what?: string
  vulnerableCode?: string
  saferCode?: string
  language?: string
  whyItMatters?: string
  commonPattern?: string
  resourceTitle?: string
  resourceUrl?: string
  [key: string]: any
}

