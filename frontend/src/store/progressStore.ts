import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SkillProfile } from '../types'
import { mockSkillProfile } from '../mock/progress'

interface ProgressState {
  profile: SkillProfile
  conceptsCompleted: string[]
  checksCompleted: string[]

  updateCatchRate: (classId: string, caught: boolean) => void
  completeExercise: () => void
  updateStreak: (streak: number) => void
  markConceptComplete: (conceptId: string) => void
  markCheckComplete: (conceptId: string) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      profile: mockSkillProfile,
      conceptsCompleted: [],
      checksCompleted: [],

      updateCatchRate: (classId, caught) =>
        set((state) => {
          const current = state.profile.catchRates[classId]
          if (!current) return state
          const newRate = caught
            ? Math.min(100, current.rate + 5)
            : Math.max(0, current.rate - 3)
          const newHistory = [...current.history, newRate].slice(-10)
          const trend = newHistory.length > 1
            ? newRate - newHistory[newHistory.length - 2]
            : 0
          return {
            profile: {
              ...state.profile,
              catchRates: {
                ...state.profile.catchRates,
                [classId]: { ...current, rate: newRate, trend, history: newHistory, attempts: current.attempts + 1 },
              },
            },
          }
        }),

      completeExercise: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            exercisesCompleted: state.profile.exercisesCompleted + 1,
          },
        })),

      updateStreak: (streak) =>
        set((state) => ({
          profile: { ...state.profile, streak },
        })),

      markConceptComplete: (conceptId) =>
        set((state) => ({
          conceptsCompleted: state.conceptsCompleted.includes(conceptId)
            ? state.conceptsCompleted
            : [...state.conceptsCompleted, conceptId],
        })),

      markCheckComplete: (conceptId) =>
        set((state) => ({
          checksCompleted: state.checksCompleted.includes(conceptId)
            ? state.checksCompleted
            : [...state.checksCompleted, conceptId],
        })),
    }),
    { name: 'codesight-progress' }
  )
)
