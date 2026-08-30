import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Bot, CheckCircle2, Filter, Search, ArrowRight,
  Flame, Clock, ChevronRight, Sparkles, BookOpen
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Badge, DifficultyBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useProblemStore } from '../store/problemStore'
import { useAuthStore } from '../store/authStore'
import type { ProblemMode, Difficulty } from '../types'

const DEFECT_CHIPS = [
  { id: 'all', label: 'All Classes' },
  { id: 'logic', label: 'Logic & Bounds' },
  { id: 'injection', label: 'Injection' },
  { id: 'auth', label: 'Auth & Access' },
  { id: 'concurrency', label: 'Concurrency' },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'resource', label: 'Resource & Perf' },
]

export default function ProblemListHome() {
  const navigate = useNavigate()
  const { problems, filters, setFilters } = useProblemStore()
  const { user, hasPassedPromotionalTest, selectedTrack } = useAuthStore()

  const solvedIds = new Set((user?.recentSubmissions || []).filter((s) => s.pass).map((s) => s.problemId))

  const filteredProblems = problems.filter((p) => {
    if (filters.mode !== 'all' && p.mode !== filters.mode) return false
    if (filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false
    if (filters.defectClassId !== 'all' && p.defectClassId !== filters.defectClassId) return false
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      const matchesTitle = p.title.toLowerCase().includes(q)
      const matchesClass = p.defectClassName.toLowerCase().includes(q)
      if (!matchesTitle && !matchesClass) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* LeetCode-style Navigation Bar */}
      <Navbar variant="app" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Control Bar: Mode Toggle & Quick Filter Chips */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#3A2F1D]">
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#1A130D] border border-[#3A2F1D]">
            <button
              onClick={() => setFilters({ mode: 'all' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.mode === 'all'
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              All Modes ({problems.length})
            </button>
            <button
              onClick={() => setFilters({ mode: 'student' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filters.mode === 'student'
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              <Code2 size={13} />
              <span>Student Scratch</span>
            </button>
            <button
              onClick={() => {
                if (!hasPassedPromotionalTest) {
                  navigate('/pro/entrance-test')
                } else {
                  setFilters({ mode: 'ai_engineer' })
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filters.mode === 'ai_engineer'
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              <Bot size={13} />
              <span>AI Code Fix</span>
              {!hasPassedPromotionalTest && (
                <span className="text-3xs px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-mono">Test Required</span>
              )}
            </button>
          </div>

          {/* Difficulty Filters */}
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

        {/* Defect Class Filter Chips */}
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

        {/* LeetCode-Style Problem List Table */}
        <div className="rounded-2xl border border-[#3A2F1D] bg-[#1A130D] overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-[#000000] border-b border-[#3A2F1D] text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60">
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-4">Title</span>
            <span className="col-span-2">Mode</span>
            <span className="col-span-1">Difficulty</span>
            <span className="col-span-2">Defect Class</span>
            <span className="col-span-1 text-center">Opt TC / SC</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#3A2F1D]">
            {filteredProblems.map((problem) => {
              const isSolved = solvedIds.has(problem.id)

              return (
                <div
                  key={problem.id}
                  onClick={() => {
                    if (problem.mode === 'ai_engineer') {
                      if (hasPassedPromotionalTest) {
                        navigate(`/pro/debug/${problem.id}`)
                      } else {
                        navigate('/pro/entrance-test')
                      }
                    } else {
                      navigate(`/student/practice/${problem.id}`)
                    }
                  }}
                  className="grid grid-cols-12 gap-3 px-6 py-4 items-center text-xs hover:bg-[#000000]/60 transition-colors cursor-pointer group"
                >
                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
                    {isSolved ? (
                      <CheckCircle2 size={16} className="text-[#E5DFC9]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#3A2F1D] group-hover:bg-[#E5DFC9]/40" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="font-mono text-2xs text-[#E5DFC9]/50">{problem.number}.</span>
                    <span className="font-bold text-[#E5DFC9] group-hover:text-[#F2EDDE] group-hover:underline">
                      {problem.title}
                    </span>
                  </div>

                  {/* Mode */}
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

                  {/* Difficulty */}
                  <div className="col-span-1">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>

                  {/* Defect Class */}
                  <div className="col-span-2">
                    <span className="text-2xs text-[#E5DFC9]/70 truncate block">
                      {problem.defectClassName}
                    </span>
                  </div>

                  {/* Optimal TC / SC */}
                  <div className="col-span-1 text-center font-mono text-2xs text-[#E5DFC9]/80">
                    <span>{problem.optimalTC}</span> / <span>{problem.optimalSC}</span>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-1 text-right">
                    <Button
                      size="sm"
                      variant={problem.mode === 'ai_engineer' ? 'gold' : 'primary'}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (problem.mode === 'ai_engineer') {
                          if (hasPassedPromotionalTest) {
                            navigate(`/pro/debug/${problem.id}`)
                          } else {
                            navigate('/pro/entrance-test')
                          }
                        } else {
                          navigate(`/student/practice/${problem.id}`)
                        }
                      }}
                      className="text-2xs py-1 px-2.5 font-bold"
                    >
                      {problem.mode === 'ai_engineer' ? 'DEBUG' : 'SOLVE'}
                    </Button>
                  </div>
                </div>
              )
            })}

            {filteredProblems.length === 0 && (
              <div className="p-12 text-center text-xs text-[#E5DFC9]/60 space-y-2">
                <p>No problems found matching your filters.</p>
                <button
                  onClick={() => setFilters({ mode: 'all', difficulty: 'all', defectClassId: 'all', searchQuery: '' })}
                  className="text-[#E5DFC9] underline font-bold"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
