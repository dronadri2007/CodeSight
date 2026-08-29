import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserLevel, UserProfile, ComplexitySubmissionResult } from '../types'

export const LEVELS: UserLevel[] = [
  'Student Beginner',
  'Student Intermediate',
  'Student Pro',
  'AI Engineer Beginner',
  'AI Engineer Intermediate',
  'AI Engineer Pro',
]

export type TrackType = 'student' | 'pro'
export type LevelTier = 'Beginner' | 'Intermediate' | 'Pro'

interface AuthState {
  isAuthenticated: boolean
  user: UserProfile | null
  selectedTrack: TrackType
  studentLevel: LevelTier
  proLevel: LevelTier
  hasPassedPromotionalTest: boolean
  
  login: (name?: string, email?: string) => void
  logout: () => void
  setRole: (role: any) => void
  setSelectedTrack: (track: TrackType) => void
  setStudentLevel: (level: LevelTier) => void
  setProLevel: (level: LevelTier) => void
  setPassedPromotionalTest: (passed: boolean) => void
  resetPromotionalQualification: () => void
  promoteToNextLevel: () => { success: boolean; newLevel: UserLevel }
  recordSubmission: (result: ComplexitySubmissionResult) => void
  updateWeaknessCatchRate: (defectClassId: string, success: boolean) => void
}

const defaultProfile: UserProfile = {
  id: 'usr_afrid',
  name: 'Afrid Shaik',
  email: 'afrid@codesight.dev',
  avatar: 'AF',
  level: 'Student Intermediate',
  levelIndex: 2,
  totalXP: 2847,
  globalRank: 1,
  currentStreak: 4,
  problemsSolved: 18,
  eloRating: 1480,
  weaknessCatchRates: {
    'logic': 82,
    'injection': 78,
    'resource': 67,
    'auth': 61,
    'concurrency': 55,
    'error-handling': 43,
  },
  recentSubmissions: [
    {
      problemId: 'prob-01',
      problemTitle: 'Two Sum Sub-Quadratic Target',
      mode: 'student',
      userCode: 'def twoSum(nums, target): ...',
      userTC: 'O(n)',
      userSC: 'O(n)',
      optimalTC: 'O(n)',
      optimalSC: 'O(n)',
      tcScore: 50,
      scScore: 50,
      totalScore: 100,
      pass: true,
      aiFeedback: {
        summary: 'Optimal linear hash map solution.',
        timeAnalysis: 'O(n) single pass',
        spaceAnalysis: 'O(n) auxiliary hash map',
        optimizationGuidance: [],
        recommendedPattern: 'Hash map complement lookup',
      },
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      problemId: 'prob-02',
      problemTitle: 'Validate Binary Search Tree Invariants',
      mode: 'student',
      userCode: 'def isValidBST(root): ...',
      userTC: 'O(n)',
      userSC: 'O(n)',
      optimalTC: 'O(n)',
      optimalSC: 'O(h)',
      tcScore: 50,
      scScore: 35,
      totalScore: 85,
      pass: true,
      aiFeedback: {
        summary: 'Valid traversal with recursive stack space.',
        timeAnalysis: 'O(n) node visitation',
        spaceAnalysis: 'O(n) recursion stack in skewed tree',
        optimizationGuidance: [],
        recommendedPattern: 'Bounded range recursion',
      },
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true,
      user: defaultProfile,
      selectedTrack: 'student',
      studentLevel: 'Intermediate',
      proLevel: 'Beginner',
      hasPassedPromotionalTest: false,

      login: (name = 'Afrid Shaik', email = 'afrid@codesight.dev') => {
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'AF'

        set({
          isAuthenticated: true,
          user: {
            ...defaultProfile,
            name,
            email,
            avatar: initials,
          },
        })
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          hasPassedPromotionalTest: false,
        })
      },

      setRole: (role: any) => {
        if (role === 'student' || role === 'pro' || role === 'professional') {
          set({ selectedTrack: role === 'student' ? 'student' : 'pro' })
        }
      },

      setSelectedTrack: (track: TrackType) => {
        set({ selectedTrack: track })
      },

      setStudentLevel: (level: LevelTier) => {
        set({ studentLevel: level })
      },

      setProLevel: (level: LevelTier) => {
        set({ proLevel: level })
      },

      setPassedPromotionalTest: (passed: boolean) => {
        set({ hasPassedPromotionalTest: passed })
      },

      resetPromotionalQualification: () => {
        set({ hasPassedPromotionalTest: false })
      },

      promoteToNextLevel: () => {
        const { user } = get()
        if (!user) return { success: false, newLevel: LEVELS[0] }

        const nextIndex = Math.min(user.levelIndex + 1, LEVELS.length - 1)
        const newLevel = LEVELS[nextIndex]

        set({
          user: {
            ...user,
            levelIndex: nextIndex,
            level: newLevel,
          },
        })

        return { success: true, newLevel }
      },

      recordSubmission: (result: ComplexitySubmissionResult) => {
        const { user } = get()
        if (!user) return

        const updatedSubmissions = [result, ...(user.recentSubmissions || [])].slice(0, 20)
        const problemsSolved = result.pass ? user.problemsSolved + 1 : user.problemsSolved
        const xpGain = result.totalScore * 5
        const eloGain = result.pass ? Math.round(result.totalScore / 10) : -5

        set({
          user: {
            ...user,
            recentSubmissions: updatedSubmissions,
            problemsSolved,
            totalXP: user.totalXP + xpGain,
            eloRating: Math.max(800, user.eloRating + eloGain),
          },
        })
      },

      updateWeaknessCatchRate: (defectClassId: string, success: boolean) => {
        const { user } = get()
        if (!user || !user.weaknessCatchRates) return

        const currentRate = user.weaknessCatchRates[defectClassId] || 50
        const newRate = success
          ? Math.min(100, currentRate + 5)
          : Math.max(0, currentRate - 4)

        set({
          user: {
            ...user,
            weaknessCatchRates: {
              ...user.weaknessCatchRates,
              [defectClassId]: newRate,
            },
          },
        })
      },
    }),
    {
      name: 'codesight-auth-v4',
    }
  )
)
