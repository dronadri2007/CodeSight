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
      userCode: 'def two_sum(nums, target): ...',
      userTC: 'O(n)',
      userSC: 'O(n)',
      optimalTC: 'O(n)',
      optimalSC: 'O(n)',
      tcScore: 50,
      scScore: 50,
      totalScore: 100,
      pass: true,
      aiFeedback: {
        summary: 'Optimal algorithmic efficiency achieved using single-pass hash lookup.',
        timeAnalysis: 'Time complexity is O(n) which matches optimal time bound.',
        spaceAnalysis: 'Space complexity is O(n) for the complement lookup dictionary.',
        optimizationGuidance: ['Keep utilizing hash maps for sub-quadratic pair matching.'],
        recommendedPattern: 'Single-pass hash table compliment caching.',
      },
      timestamp: '2 hours ago',
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

      promoteToNextLevel: () => {
        const user = get().user
        if (!user) return { success: false, newLevel: 'Student Beginner' }
        const nextIndex = Math.min(user.levelIndex + 1, 6)
        const nextLevelName = LEVELS[nextIndex - 1]

        set({
          user: {
            ...user,
            levelIndex: nextIndex,
            level: nextLevelName,
            totalXP: user.totalXP + 300,
          },
        })
        return { success: true, newLevel: nextLevelName }
      },

      recordSubmission: (result: ComplexitySubmissionResult) => {
        const user = get().user
        if (!user) return

        const updatedXP = user.totalXP + result.totalScore
        const updatedSolved = result.pass ? user.problemsSolved + 1 : user.problemsSolved
        const updatedSubmissions = [result, ...(user.recentSubmissions || [])].slice(0, 10)

        set({
          user: {
            ...user,
            totalXP: updatedXP,
            problemsSolved: updatedSolved,
            recentSubmissions: updatedSubmissions,
          },
        })
      },

      updateWeaknessCatchRate: (defectClassId: string, success: boolean) => {
        const user = get().user
        if (!user) return

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
      name: 'codesight-auth-v2',
    }
  )
)
