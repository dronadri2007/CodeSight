// frontend/src/lib/profile.ts
export type UserLevel =
  | 'Student Beginner' | 'Student Intermediate' | 'Student Pro'
  | 'AI Engineer Beginner' | 'AI Engineer Intermediate' | 'AI Engineer Pro'

export type DefectClass =
  | 'SQL Injection' | 'Unchecked Returns' | 'Race Conditions'
  | 'Infinite Loops' | 'Resource Leaks' | 'Type Mismatches'

export interface SubmissionRecord {
  id: string
  problemId: string
  title: string
  score: number
  date: string
  mode: 'student' | 'engineer'
  userTimeComplexity: string
  userSpaceComplexity: string
  optimalTimeComplexity: string
  optimalSpaceComplexity: string
  feedback: string
  defectClass: DefectClass
}

export interface UserProfile {
  name: string
  handle: string
  avatar: string
  level: UserLevel
  levelIndex: number
  xp: number
  globalRank: number
  streakDays: number
  solvedCount: number
  history: SubmissionRecord[]
  defectStats: Record<DefectClass, { successful: number; total: number }>
}

type BackendClass =
  | 'injection' | 'auth' | 'error-handling'
  | 'concurrency' | 'logic' | 'resource' | 'clean'

export const CLASS_LABEL: Record<BackendClass, DefectClass> = {
  injection: 'SQL Injection',
  auth: 'Unchecked Returns',            // best-fit label; the frontend's 6 labels
  'error-handling': 'Unchecked Returns',
  concurrency: 'Race Conditions',
  logic: 'Type Mismatches',
  resource: 'Resource Leaks',
  clean: 'Type Mismatches',
}
// NOTE: the frontend has 6 cosmetic labels, the backend 6 real classes + clean.
// The mapping above is lossy by design (auth+error-handling → same label). B/C
// may replace the frontend labels with the real taxonomy; for A this keeps
// defectStats renderable. Document this in the report.

export const DEFECT_CLASSES: DefectClass[] = [
  'SQL Injection', 'Unchecked Returns', 'Race Conditions',
  'Infinite Loops', 'Resource Leaks', 'Type Mismatches',
]

export function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
}

export function userLevelOf(track: string, level: string): UserLevel {
  const t = track === 'engineer' ? 'AI Engineer' : 'Student'
  const l = level === 'pro' ? 'Pro' : level === 'intermediate' ? 'Intermediate' : 'Beginner'
  return `${t} ${l}` as UserLevel
}

export function mapProfile(
  uid: string,
  doc: Record<string, unknown>,
  rank: number | null,
): UserProfile {
  const name = String(doc.displayName || doc.email || 'Reviewer')
  const subs = (Array.isArray(doc.recentSubmissions)
    ? doc.recentSubmissions
    : []) as Array<Record<string, unknown>>
  const rates = (typeof doc.weaknessCatchRates === 'object' && doc.weaknessCatchRates !== null
    ? doc.weaknessCatchRates
    : {}) as Record<string, number>

  const history: SubmissionRecord[] = subs.map((s, i) => ({
    id: `sub-${i}`,
    problemId: String(s.exerciseId ?? ''),
    title: String(s.exerciseId ?? 'Exercise'),
    score: Math.round(Number(s.scoreAfterHints ?? 0) * 100),
    date: String(s.timestamp ?? '').slice(0, 10),
    mode: 'engineer',
    userTimeComplexity: '—',
    userSpaceComplexity: '—',
    optimalTimeComplexity: '—',
    optimalSpaceComplexity: '—',
    feedback: `Localisation ${Math.round(Number(s.localisationScore ?? 0) * 100)}%, explanation ${Math.round(Number(s.explanationScore ?? 0) * 100)}%.`,
    defectClass: CLASS_LABEL[(s.defectClass as BackendClass) ?? 'logic'] ?? 'Type Mismatches',
  }))

  const perClassTotal: Record<string, number> = {}
  for (const s of subs) {
    const label = CLASS_LABEL[(s.defectClass as BackendClass) ?? 'logic'] ?? 'Type Mismatches'
    perClassTotal[label] = (perClassTotal[label] ?? 0) + 1
  }
  const defectStats = Object.fromEntries(
    DEFECT_CLASSES.map(label => {
      const total = perClassTotal[label] ?? 0
      // rates are keyed by BACKEND class; find any backend class that maps to this label
      const backendKeys = (Object.keys(CLASS_LABEL) as BackendClass[]).filter(k => CLASS_LABEL[k] === label)
      const rate = backendKeys.reduce((acc, k) => rates[k] != null ? Math.max(acc, rates[k]) : acc, 0)
      return [label, { successful: Math.round((rate / 100) * total), total }]
    }),
  ) as Record<DefectClass, { successful: number; total: number }>

  return {
    name,
    handle: '@' + name.toLowerCase().replace(/\s+/g, ''),
    avatar: String(doc.photoURL ?? ''),
    level: userLevelOf(String(doc.track ?? 'student'), String(doc.level ?? 'beginner')),
    levelIndex: Number(doc.levelIndex ?? 0),
    xp: Number(doc.totalXP ?? 0),
    globalRank: rank ?? 0,
    streakDays: Number(doc.streakDays ?? 0),
    solvedCount: Number(doc.problemsSolved ?? 0),
    history,
    defectStats,
  }
}
