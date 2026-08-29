import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Code2, CheckCircle2, Circle, Search, ArrowRight,
  GraduationCap, Zap, Sparkles, Filter, ChevronRight
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import { mockProblems } from '../../mock/problems'
import { defectClasses } from '../../tokens'

export default function StudentProblems() {
  const navigate = useNavigate()
  const { user, studentLevel } = useAuthStore()
  const { filters, setFilters } = useProblemStore()

  // Filter problems for Student Track
  const studentProblems = mockProblems.filter((p) => {
    if (filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false
    if (filters.defectClassId !== 'all' && p.defectClassId !== filters.defectClassId) return false
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      const matchesTitle = p.title.toLowerCase().includes(q)
      const matchesTopic = p.defectClassName.toLowerCase().includes(q)
      if (!matchesTitle && !matchesTopic) return false
    }
    return true
  })

  const solvedIds = new Set((user?.recentSubmissions || []).filter((s) => s.pass).map((s) => s.problemId))

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Track Banner */}
        <div className="p-6 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="navy" size="sm">STUDENT CODING TRACK</Badge>
              <Badge variant="gold" size="sm">LEVEL: {studentLevel?.toUpperCase() || 'INTERMEDIATE'}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#E5DFC9]">
              Algorithmic Problem Practice
            </h1>
            <p className="text-xs text-[#E5DFC9]/70">
              Write solutions from scratch. Click <strong>SOLVE</strong> to open the Monaco workspace and evaluate your Time &amp; Space Complexity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/student/level-select')}
              className="text-xs"
            >
              Change Level
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/student/practice/${studentProblems[0]?.id || 'prob-01'}`)}
              iconRight={<ArrowRight size={13} />}
              className="text-xs font-bold"
            >
              Next Problem
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#3A2F1D]">
          {/* Difficulty Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#1A130D] border border-[#3A2F1D]">
            {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilters({ difficulty: diff })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filters.difficulty === diff
                    ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                    : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
                }`}
              >
                {diff === 'all' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5DFC9]/40" />
            <input
              type="text"
              placeholder="Search problems or topics..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#1A130D] border border-[#3A2F1D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E5DFC9] placeholder-[#E5DFC9]/40 focus:outline-none focus:border-[#E5DFC9]/60"
            />
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setFilters({ defectClassId: 'all' })}
            className={`px-3 py-1 rounded-lg text-2xs font-mono font-semibold whitespace-nowrap transition-all ${
              filters.defectClassId === 'all'
                ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                : 'bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
            }`}
          >
            All Topics
          </button>
          {defectClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setFilters({ defectClassId: cls.id })}
              className={`px-3 py-1 rounded-lg text-2xs font-mono font-semibold whitespace-nowrap transition-all ${
                filters.defectClassId === cls.id
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              {cls.label}
            </button>
          ))}
        </div>

        {/* Problems Table */}
        <div className="rounded-2xl border border-[#3A2F1D] bg-[#1A130D] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#000000] border-b border-[#3A2F1D] font-mono text-2xs uppercase text-[#E5DFC9]/60">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-44">Topic</th>
                  <th className="py-3 px-4 w-32 font-mono">Optimal TC / SC</th>
                  <th className="py-3 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2F1D]/50">
                {studentProblems.map((prob) => {
                  const isSolved = solvedIds.has(prob.id)
                  return (
                    <tr
                      key={prob.id}
                      onClick={() => navigate(`/student/practice/${prob.id}`)}
                      className="hover:bg-[#3A2F1D]/30 transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isSolved ? (
                          <CheckCircle2 size={15} className="text-[#E5DFC9] mx-auto" />
                        ) : (
                          <Circle size={15} className="text-[#E5DFC9]/25 mx-auto" />
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#E5DFC9] group-hover:underline flex items-center gap-2">
                          <span>{prob.title}</span>
                          {prob.isExamProblem && (
                            <span className="text-3xs px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 font-mono border border-amber-800/40">
                              PROMOTION
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>

                      {/* Topic */}
                      <td className="py-3.5 px-4 text-[#E5DFC9]/70 font-mono text-2xs">
                        {prob.defectClassName}
                      </td>

                      {/* Optimal TC / SC */}
                      <td className="py-3.5 px-4 font-mono text-2xs text-[#E5DFC9]/60">
                        {prob.optimalTC} / {prob.optimalSC}
                      </td>

                      {/* Action: MUST SAY SOLVE */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/student/practice/${prob.id}`)
                          }}
                          className="font-bold text-xs px-3 shadow-sm"
                        >
                          SOLVE
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
