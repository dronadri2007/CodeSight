import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bot, CheckCircle2, Circle, Search, ArrowRight,
  Shield, Zap, Sparkles, Filter, ChevronRight, AlertTriangle, Eye
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import { mockProblems } from '../../mock/problems'
import { defectClasses } from '../../tokens'

export default function ProProblems() {
  const navigate = useNavigate()
  const { user, proLevel, hasPassedPromotionalTest } = useAuthStore()
  const { filters, setFilters } = useProblemStore()

  useEffect(() => {
    if (!hasPassedPromotionalTest) {
      navigate('/pro/promotional-test')
    }
  }, [hasPassedPromotionalTest, navigate])

  // Filter problems for Professional Track (AI Code Fix exercises)
  const proProblems = mockProblems.filter((p) => {
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

  const reviewedIds = new Set((user?.recentSubmissions || []).map((s) => s.problemId))

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Track Banner */}
        <div className="p-6 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">AI-ASSISTED PROFESSIONAL TRACK</Badge>
              <Badge variant="navy" size="sm">LEVEL: {proLevel?.toUpperCase() || 'BEGINNER'}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#E5DFC9]">
              Code Review &amp; Defect Auditing
            </h1>
            <p className="text-xs text-[#E5DFC9]/70">
              You are reviewing existing AI-generated code, not writing the solution. Click <strong>DEBUG</strong> to highlight suspicious lines and submit your findings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/pro/level-select')}
              className="text-xs"
            >
              Review Level
            </Button>
            <Button
              size="sm"
              variant="gold"
              onClick={() => navigate(`/pro/debug/${proProblems[0]?.id || 'prob-02'}`)}
              iconRight={<ArrowRight size={13} />}
              className="text-xs font-bold"
            >
              Next Review
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
              placeholder="Search code review exercises..."
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
            All Classes
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
                  <th className="py-3 px-4">Pull Request / Snippet Title</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-44">Defect Class</th>
                  <th className="py-3 px-4 w-32 font-mono">Source</th>
                  <th className="py-3 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2F1D]/50">
                {proProblems.map((prob) => {
                  const isReviewed = reviewedIds.has(prob.id)
                  return (
                    <tr
                      key={prob.id}
                      onClick={() => navigate(`/pro/debug/${prob.id}`)}
                      className="hover:bg-[#3A2F1D]/30 transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isReviewed ? (
                          <CheckCircle2 size={15} className="text-[#E5DFC9] mx-auto" />
                        ) : (
                          <Circle size={15} className="text-[#E5DFC9]/25 mx-auto" />
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#E5DFC9] group-hover:underline flex items-center gap-2">
                          <span>{prob.title}</span>
                          <span className="text-3xs px-1.5 py-0.5 rounded bg-[#000000] text-[#E5DFC9]/70 font-mono border border-[#3A2F1D]">
                            AI-GEN
                          </span>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>

                      {/* Defect Class */}
                      <td className="py-3.5 px-4 text-[#E5DFC9]/70 font-mono text-2xs">
                        {prob.defectClassName}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 font-mono text-2xs text-[#E5DFC9]/60">
                        {prob.repo || 'codesight/api'}
                      </td>

                      {/* Action: MUST SAY DEBUG */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/pro/debug/${prob.id}`)
                          }}
                          className="font-bold text-xs px-3 shadow-sm"
                        >
                          DEBUG
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
