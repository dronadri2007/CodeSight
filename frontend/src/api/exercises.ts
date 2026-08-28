import { api } from './client'
import { mockExercises, getExerciseById } from '../mock/exercises'
import type { Exercise, GradingResult } from '../types'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export interface SubmitReviewPayload {
  exerciseId: string
  selectedLines: number[]
  explanation: string
  timeTaken: number
  hintsUsed: number
}

export async function listExercises(classFilter?: string): Promise<Exercise[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    if (classFilter && classFilter !== 'all') {
      return mockExercises.filter((e) => e.defectClassId === classFilter)
    }
    return mockExercises
  }
  return api.get<Exercise[]>(`/exercises${classFilter ? `?class=${classFilter}` : ''}`)
}

export async function getExercise(id: string): Promise<Exercise> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    const ex = getExerciseById(id)
    if (!ex) throw new Error(`Exercise ${id} not found`)
    return ex
  }
  return api.get<Exercise>(`/exercises/${id}`)
}

// Simulates Claude grading locally when no backend is available
function simulateGrading(payload: SubmitReviewPayload, exercise: Exercise): GradingResult {
  const { selectedLines, explanation } = payload
  const buggyLines = exercise.buggyLines

  const selectedCorrect = selectedLines.filter((l) => buggyLines.includes(l))
  const selectedWrong = selectedLines.filter((l) => !buggyLines.includes(l))

  const localizationScore = buggyLines.length > 0
    ? Math.round((selectedCorrect.length / buggyLines.length) * 100)
    : selectedLines.length === 0 ? 100 : 50

  const wordCount = explanation.trim().split(/\s+/).length
  const hasKeywords = exercise.teachingPoints.some((tp) =>
    explanation.toLowerCase().includes(tp.toLowerCase().slice(0, 10))
  )
  const explanationScore = Math.min(100, Math.round(
    (Math.min(wordCount, 80) / 80) * 60 + (hasKeywords ? 40 : 0)
  ))

  const falsePositives = selectedWrong.length
  const score = Math.round(
    (localizationScore * 0.5 + explanationScore * 0.5) - falsePositives * 8
  )

  return {
    score: Math.max(0, Math.min(100, score)),
    localizationScore,
    explanationScore,
    falsePositives,
    trueDefectLines: buggyLines,
    whyMissed: localizationScore < 60
      ? `You focused on nearby code but the key issue was on line${buggyLines.length > 1 ? 's' : ''} ${buggyLines.join(', ')}. ${exercise.referenceExplanation}`
      : `Your localization was good. The explanation could have been more specific about why this creates a security risk.`,
    patternToWatch: exercise.pattern,
    realFix: exercise.fixDiff,
    defectClass: exercise.defectClass,
    status: localizationScore >= 60 ? 'confirmed' : 'plausible',
    studentFoundLines: selectedLines,
    studentExplanation: explanation,
  }
}

export async function submitReview(payload: SubmitReviewPayload): Promise<GradingResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2200)) // simulate AI thinking time
    const exercise = getExerciseById(payload.exerciseId)
    if (!exercise) throw new Error('Exercise not found')
    return simulateGrading(payload, exercise)
  }
  return api.post<GradingResult>('/review/submit', payload)
}
