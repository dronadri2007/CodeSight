import { create } from 'zustand'
import type { Problem, ProblemMode, Difficulty, ComplexitySubmissionResult } from '../types'
import { mockProblems } from '../mock/problems'
import { useAuthStore } from './authStore'

interface ProblemFilter {
  mode: 'all' | ProblemMode
  difficulty: 'all' | Difficulty
  defectClassId: string
  searchQuery: string
}

interface ProblemState {
  problems: Problem[]
  filters: ProblemFilter
  currentProblem: Problem | null
  lastResult: ComplexitySubmissionResult | null
  setFilters: (filters: Partial<ProblemFilter>) => void
  getProblemById: (id: string) => Problem | undefined
  submitSolution: (problemId: string, userCode: string) => Promise<ComplexitySubmissionResult>
}

// Complexity order helper: 0: O(1), 1: O(log n), 2: O(n), 3: O(n log n), 4: O(n^2), 5: O(2^n)
const TC_ORDER: Record<string, number> = {
  'O(1)': 0,
  'O(log n)': 1,
  'O(n)': 2,
  'O(n log n)': 3,
  'O(n^2)': 4,
  'O(2^n)': 5,
}

const SC_ORDER: Record<string, number> = {
  'O(1)': 0,
  'O(log n)': 1,
  'O(n)': 2,
  'O(n^2)': 3,
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: mockProblems,
  filters: {
    mode: 'all',
    difficulty: 'all',
    defectClassId: 'all',
    searchQuery: '',
  },
  currentProblem: mockProblems[0],
  lastResult: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  getProblemById: (id: string) => {
    return get().problems.find((p) => p.id === id) || mockProblems.find((p) => p.id === id)
  },

  submitSolution: async (problemId: string, userCode: string): Promise<ComplexitySubmissionResult> => {
    const problem = get().getProblemById(problemId) || mockProblems[0]

    // Simulate backend analysis delay
    await new Promise((res) => setTimeout(res, 500))

    // Analyze code heuristics
    const hasNestedLoop = /(for|while).*\n\s+(for|while)/.test(userCode)
    const hasHashMap = /(lookup|seen|dict|\{\}|Map|dict\(\)|count)/.test(userCode)
    const hasNoneCheck = /(is None|not |UserNotFoundError|if row|row is None)/.test(userCode)
    const hasHmac = /(hmac\.compare_digest|secrets\.compare_digest)/.test(userCode)
    const hasParamQuery = /(%s|\?|\$1|params=)/.test(userCode) && !/f"SELECT|f'SELECT|\+.*username/.test(userCode)
    const hasLockOrdering = /(if.*<.*lock|first_lock|sorted)/.test(userCode)
    const hasStream = /(for line in|readline\(\)|yield)/.test(userCode) && !/readlines\(\)/.test(userCode)

    let userTC = problem.optimalTC
    let userSC = problem.optimalSC
    let pass = true
    let isFalsePositive = false
    let efficiencyDelta = 100

    if (problem.mode === 'student') {
      if (problem.id === 'prob-01') {
        if (hasNestedLoop && !hasHashMap) {
          userTC = 'O(n^2)'
          userSC = 'O(1)'
        } else {
          userTC = 'O(n)'
          userSC = 'O(n)'
        }
      } else if (problem.id === 'prob-02') {
        if (!hasNoneCheck) {
          pass = false
        }
      } else if (problem.id === 'prob-03') {
        if (!hasHmac) {
          userTC = 'O(k)'
        }
      } else if (problem.id === 'prob-06') {
        if (!hasStream) {
          userSC = 'O(N)'
        }
      }
    } else {
      // AI Engineer mode
      if (problem.id === 'prob-04') {
        if (!hasParamQuery) {
          pass = false
          efficiencyDelta = 0
        }
      } else if (problem.id === 'prob-05') {
        if (!hasLockOrdering) {
          pass = false
          efficiencyDelta = 0
        }
      }
    }

    // Compute TC score (50 points)
    const userTcRank = TC_ORDER[userTC] ?? 2
    const optTcRank = TC_ORDER[problem.optimalTC] ?? 2
    const tcDiff = Math.max(0, userTcRank - optTcRank)
    let tcScore = 50
    if (tcDiff === 1) tcScore = 25
    else if (tcDiff >= 2) tcScore = 0

    // Compute SC score (50 points)
    const userScRank = SC_ORDER[userSC] ?? 2
    const optScRank = SC_ORDER[problem.optimalSC] ?? 2
    const scDiff = Math.max(0, userScRank - optScRank)
    let scScore = 50
    if (scDiff === 1) scScore = 25
    else if (scDiff >= 2) scScore = 0

    let totalScore = pass ? tcScore + scScore : 0

    const result: ComplexitySubmissionResult = {
      problemId: problem.id,
      problemTitle: problem.title,
      mode: problem.mode,
      userCode,
      userTC,
      userSC,
      optimalTC: problem.optimalTC,
      optimalSC: problem.optimalSC,
      tcScore,
      scScore,
      totalScore,
      efficiencyDelta,
      isFalsePositive,
      pass,
      aiFeedback: {
        summary: pass
          ? totalScore === 100
            ? 'Optimal algorithmic efficiency achieved!'
            : 'Solution passes functional tests but has sub-optimal complexity.'
          : 'Solution failed verification tests or safety invariants.',
        timeAnalysis: `Your submission runs in ${userTC}. The optimal achievable time complexity is ${problem.optimalTC}.`,
        spaceAnalysis: `Your submission utilizes ${userSC} auxiliary space. Optimal achievable space complexity is ${problem.optimalSC}.`,
        optimizationGuidance:
          totalScore === 100
            ? ['Clean implementation meeting production performance requirements.']
            : [
                `Refactor quadratic operations into linear lookups.`,
                `Ensure auxiliary memory bounds remain within ${problem.optimalSC}.`,
              ],
        recommendedPattern: problem.weaknessPattern,
      },
      timestamp: 'Just now',
    }

    set({ lastResult: result })

    // Update global user stats & weakness profile
    useAuthStore.getState().recordSubmission(result)
    useAuthStore.getState().updateWeaknessCatchRate(problem.defectClassId, pass && totalScore >= 75)

    return result
  },
}))
