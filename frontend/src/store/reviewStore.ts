import { create } from 'zustand'
import type { Exercise, GradingResult } from '../types'

interface ReviewState {
  exercise: Exercise | null
  selectedLines: number[]
  explanation: string
  timerSeconds: number
  submissionStatus: 'idle' | 'submitting' | 'graded' | 'error'
  gradingResult: GradingResult | null
  hintsUsed: number
  hintPenalty: number

  setExercise: (exercise: Exercise) => void
  toggleLine: (lineNumber: number) => void
  setExplanation: (text: string) => void
  decrementTimer: () => void
  resetTimer: () => void
  setSubmitting: () => void
  setGradingResult: (result: GradingResult) => void
  setError: () => void
  useHint: () => void
  reset: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  exercise: null,
  selectedLines: [],
  explanation: '',
  timerSeconds: 0,
  submissionStatus: 'idle',
  gradingResult: null,
  hintsUsed: 0,
  hintPenalty: 0,

  setExercise: (exercise) =>
    set({ exercise, selectedLines: [], explanation: '', submissionStatus: 'idle', gradingResult: null, hintsUsed: 0, hintPenalty: 0, timerSeconds: exercise.estimatedMinutes * 60 }),

  toggleLine: (lineNumber) =>
    set((state) => ({
      selectedLines: state.selectedLines.includes(lineNumber)
        ? state.selectedLines.filter((l) => l !== lineNumber)
        : [...state.selectedLines, lineNumber].sort((a, b) => a - b),
    })),

  setExplanation: (text) => set({ explanation: text }),

  decrementTimer: () =>
    set((state) => ({
      timerSeconds: Math.max(0, state.timerSeconds - 1),
    })),

  resetTimer: () =>
    set((state) => ({
      timerSeconds: state.exercise ? state.exercise.estimatedMinutes * 60 : 0,
    })),

  setSubmitting: () => set({ submissionStatus: 'submitting' }),

  setGradingResult: (result) =>
    set({ submissionStatus: 'graded', gradingResult: result }),

  setError: () => set({ submissionStatus: 'error' }),

  useHint: () =>
    set((state) => {
      const penalties = [10, 25, 50]
      const penalty = penalties[state.hintsUsed] ?? 50
      return { hintsUsed: state.hintsUsed + 1, hintPenalty: state.hintPenalty + penalty }
    }),

  reset: () =>
    set({
      exercise: null,
      selectedLines: [],
      explanation: '',
      timerSeconds: 0,
      submissionStatus: 'idle',
      gradingResult: null,
      hintsUsed: 0,
      hintPenalty: 0,
    }),
}))
