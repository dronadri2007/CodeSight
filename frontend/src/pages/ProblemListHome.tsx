import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code2, Bot, CheckCircle2,
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { DifficultyBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useProblemStore } from '../store/problemStore'
import { useAuthStore } from '../store/authStore'
import { defectClasses } from '../tokens'
import { listExerciseSummaries, type ExerciseSummary, ApiError } from '../api'

const DEFECT_CHIPS = [
  { id: 'all', label: 'All Classes' },
  { id: 'logic', label: 'Logic & Bounds' },
  { id: 'injection', label: 'Injection' },
  { id: 'auth', label: 'Auth & Access' },
  { id: 'concurrency', label: 'Concurrency' },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'resource', label: 'Resource & Perf' },
]

const SOURCES = ['all', 'curated', 'generated'] as const
const PAGE = 60

const TIER_LABEL: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  pro: 'Hard',
}
const classLabel = (id: string) => defectClasses.find((c) => c.id === id)?.label ?? id

/** Normalised row shape the table renders — mock student problems and live
 *  review exercises both map into this. */
type Row = {
  id: string
  number: number
  title: string
  mode: 'student' | 'ai_engineer'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  defectClassId: string
  defectClassName: string
  optimalTC: string
  optimalSC: string
  source?: 'curated' | 'generated'
}

function fromExercise(e: ExerciseSummary, i: number): Row {
  return {
    id: e.id,
    number: i + 1,
    title: e.title,
    mode: 'ai_engineer',
    difficulty: TIER_LABEL[e.difficulty] ?? 'Medium',
    defectClassId: e.defect_class,
    defectClassName: classLabel(e.defect_class),
    optimalTC: '—',
    optimalSC: '—',
    source: e.source,
  }
}

export default function ProblemListHome() {
  const navigate = useNavigate()
  const { problems, filters, setFilters } = useProblemStore()
  const { user, hasPassedPromotionalTest } = useAuthStore()

  const [apiRows, setApiRows] = useState<ExerciseSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<(typeof SOURCES)[number]>('all')
  const [visible, setVisible] = useState(PAGE)

  useEffect(() => {
    let dead = false
    listExerciseSummaries()
      .then((r) => { if (!dead) setApiRows(r) })
      .catch((e) => { if (!dead) setError(e instanceof ApiError ? `${e.status}` : String(e)) })
    return () => { dead = true }
  }, [])

  useEffect(() => {
    setVisible(PAGE)
  }, [filters.mode, filters.difficulty, filters.defectClassId, filters.searchQuery, source, apiRows])

  const solvedIds = new Set(
    (user?.recentSubmissions || []).filter((s) => s.pass).map((s) => s.problemId),
  )

  const studentRows: Row[] = problems.filter((p) => p.mode === 'student') as unknown as Row[]
  const reviewRows: Row[] = (apiRows || []).map(fromExercise)

  // which set feeds the table for the current mode tab
  const base: Row[] =
    filters.mode === 'student' ? studentRows
    : filters.mode === 'ai_engineer' ? reviewRows
    : [...studentRows, ...reviewRows]

  const matched = base.filter((p) => {
    if (source !== 'all' && p.mode === 'ai_engineer' && p.source !== source) return false
    if (filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false
    if (filters.defectClassId !== 'all' && p.defectClassId !== filters.defectClassId) return false
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      if (!p.title.toLowerCase().includes(q) && !p.defectClassName.toLowerCase().includes(q)) return false
    }
    return true
  })
  const shown = matched.slice(0, visible)

  const openRow = (p: Row) => {
    if (p.mode === 'ai_engineer') {
      navigate(hasPassedPromotionalTest ? `/pro/debug/${p.id}` : '/pro/entrance-test')
    } else {
      navigate(`/student/practice/${p.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Mode toggle + difficulty */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#3A2F1D]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[#1A130D] border border-[#3A2F1D]">
              <button
                onClick={() => setFilters({ mode: 'all' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.mode === 'all' ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm' : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
                }`}
              >
                All Modes ({(studentRows.length + reviewRows.length).toLocaleString()})
              </button>
              <button
                onClick={() => setFilters({ mode: 'student' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filters.mode === 'student' ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm' : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
                }`}
              >
                <Code2 size={13} />
                <span>Student Scratch ({studentRows.length})</span>
              </button>
              <button
                onClick={() => {
                  if (!hasPassedPromotionalTest) navigate('/pro/entrance-test')
                  else setFilters({ mode: 'ai_engineer' })
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filters.mode === 'ai_engineer' ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm' : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
                }`}
              >
                <Bot size={13} />
                <span>AI Code Fix ({reviewRows.length.toLocaleString()})</span>
                {!hasPassedPromotionalTest && (
                  <span className="text-3xs px-1.5 py-0.5 bg-[#3A2F1D] text-[#E5DFC9] rounded font-mono">Test</span>
                )}
              </button>
            </div>

            {filters.mode !== 'student' && (
              <div className="flex items-center p-1 rounded-xl bg-[#1A130D] border border-[#3A2F1D]">
                {SOURCES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      source === s ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm' : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
                    }`}
                  >
                    {s === 'all' ? 'All Sources' : s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilters({ difficulty: diff })}
                className={`px-3 py-1 rounded-xl text-2xs font-bold transition-all border ${
                  filters.difficulty === diff
                    ? 'bg-[#3A2F1D] border-[#E5DFC9] text-[#E5DFC9]'
                    : 'bg-[#1A130D] border-[#3A2F1D] text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
                }`}
              >
                {diff === 'all' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Defect class chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DEFECT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilters({ defectClassId: chip.id })}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                filters.defectClassId === chip.id
                  ? 'bg-[#E5DFC9] text-[#000000] border-[#E5DFC9] font-bold'
                  : 'bg-[#1A130D] border-[#3A2F1D] text-[#E5DFC9]/70 hover:border-[#E5DFC9]/40'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="font-mono text-xs text-red-300">Couldn't load exercises ({error}). Is the backend reachable?</p>
        )}
        {!error && apiRows === null && (
          <p className="font-mono text-xs text-[#E5DFC9]/50 animate-pulse">Loading exercises…</p>
        )}
        {!error && apiRows !== null && (
          <p className="font-mono text-2xs text-[#E5DFC9]/45">
            {matched.length.toLocaleString()} match{matched.length === 1 ? '' : 'es'}
            {matched.length > shown.length && ` · showing ${shown.length}`}
          </p>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-[#3A2F1D] bg-[#1A130D] overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-[#000000] border-b border-[#3A2F1D] text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60">
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-4">Title</span>
            <span className="col-span-2">Mode</span>
            <span className="col-span-1">Difficulty</span>
            <span className="col-span-2">Defect Class</span>
            <span className="col-span-1 text-center">Opt TC / SC</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          <div className="divide-y divide-[#3A2F1D]">
            {shown.map((problem) => {
              const isSolved = solvedIds.has(problem.id)
              return (
                <div
                  key={problem.id}
                  onClick={() => openRow(problem)}
                  className="grid grid-cols-12 gap-3 px-6 py-4 items-center text-xs hover:bg-[#000000]/60 transition-colors cursor-pointer group"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    {isSolved ? (
                      <CheckCircle2 size={16} className="text-[#E5DFC9]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#3A2F1D] group-hover:bg-[#E5DFC9]/40" />
                    )}
                  </div>

                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <span className="font-mono text-2xs text-[#E5DFC9]/50">{problem.number}.</span>
                    <span className="font-bold text-[#E5DFC9] group-hover:text-[#F2EDDE] group-hover:underline truncate">
                      {problem.title}
                    </span>
                    {problem.mode === 'ai_engineer' && (
                      <span className="text-3xs px-1.5 py-0.5 rounded bg-[#000000] text-[#E5DFC9]/60 font-mono border border-[#3A2F1D] flex-shrink-0">
                        {problem.source === 'generated' ? 'GEN' : 'CURATED'}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center gap-1.5">
                    {problem.mode === 'student' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#000000] border border-[#3A2F1D] text-2xs font-medium text-[#E5DFC9]/80">
                        <Code2 size={11} className="text-[#E5DFC9]" /> Scratch
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3A2F1D]/50 border border-[#3A2F1D] text-2xs font-medium text-[#E5DFC9]">
                        <Bot size={11} className="text-[#E5DFC9]" /> AI Fix
                      </span>
                    )}
                  </div>

                  <div className="col-span-1">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>

                  <div className="col-span-2">
                    <span className="text-2xs text-[#E5DFC9]/70 truncate block">{problem.defectClassName}</span>
                  </div>

                  <div className="col-span-1 text-center font-mono text-2xs text-[#E5DFC9]/80">
                    <span>{problem.optimalTC}</span> / <span>{problem.optimalSC}</span>
                  </div>

                  <div className="col-span-1 text-right">
                    <Button
                      size="sm"
                      variant={problem.mode === 'ai_engineer' ? 'gold' : 'primary'}
                      onClick={(e) => {
                        e.stopPropagation()
                        openRow(problem)
                      }}
                      className="text-2xs py-1 px-2.5 font-bold"
                    >
                      {problem.mode === 'ai_engineer' ? 'DEBUG' : 'SOLVE'}
                    </Button>
                  </div>
                </div>
              )
            })}

            {!shown.length && (
              <div className="p-12 text-center text-xs text-[#E5DFC9]/60 space-y-2">
                <p>No problems found matching your filters.</p>
                <button
                  onClick={() => {
                    setFilters({ mode: 'all', difficulty: 'all', defectClassId: 'all', searchQuery: '' })
                    setSource('all')
                  }}
                  className="text-[#E5DFC9] underline font-bold"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {matched.length > shown.length && (
            <div className="border-t border-[#3A2F1D] p-4 text-center">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => setVisible((v) => v + PAGE)}
              >
                Show more ({(matched.length - shown.length).toLocaleString()} left)
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
