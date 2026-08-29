import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, CheckCircle2, XCircle, AlertCircle, ArrowRight,
  RotateCcw, Shield, Bot, Sparkles, TrendingUp, Zap
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { WeaknessChart } from '../../components/profile/WeaknessChart'
import { useAuthStore } from '../../store/authStore'
import { mockProblems } from '../../mock/problems'

export default function ProReviewResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const problem = mockProblems.find((p) => p.id === id) || mockProblems[1]
  const state = location.state || {
    score: 82,
    localizationScore: 80,
    explanationScore: 90,
    falsePositives: 0,
    findingTitle: 'Direct parameter concatenation in SQL execution',
  }

  const nextProblem = mockProblems.find((p) => p.id !== problem.id && p.mode === 'ai_engineer') || mockProblems[0]

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3A2F1D] pb-6">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 font-bold block">
                  CODE REVIEW RESULT
                </span>
                <h1 className="text-2xl font-extrabold text-[#E5DFC9] mt-0.5">{problem.title}</h1>
                <p className="text-xs text-[#E5DFC9]/70 font-mono mt-0.5">Defect Class: {problem.defectClassName}</p>
              </div>

              <div className="text-right">
                <span className="text-2xs font-mono uppercase text-[#E5DFC9]/60 font-bold block">
                  Review Score
                </span>
                <span className="text-4xl font-extrabold text-[#E5DFC9] font-mono">
                  {state.score || 82}<span className="text-lg text-[#E5DFC9]/50">/100</span>
                </span>
              </div>
            </div>

            {/* Metrics Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">Bug Localization</span>
                <div className="text-base font-bold font-mono text-[#E5DFC9]">{state.localizationScore || 80}%</div>
                <div className="w-full bg-[#1A130D] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#E5DFC9] h-full rounded-full" style={{ width: `${state.localizationScore || 80}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">Explanation Quality</span>
                <div className="text-base font-bold font-mono text-[#E5DFC9]">{state.explanationScore || 90}%</div>
                <div className="w-full bg-[#1A130D] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#E5DFC9] h-full rounded-full" style={{ width: `${state.explanationScore || 90}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">False Positives</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {state.falsePositives > 0 ? `${state.falsePositives} flagged` : 'Low (None)'}
                </div>
                <span className="text-3xs text-[#E5DFC9]/50 block font-mono">No valid code penalized</span>
              </div>
            </div>

            {/* Found / Missed / False Positives Breakdown */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-3 font-mono text-2xs">
              <span className="font-bold text-[#E5DFC9] uppercase block border-b border-[#3A2F1D] pb-2">
                Defect Audit Breakdown:
              </span>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>FOUND:</strong> Correctly identified {problem.defectClassName.toLowerCase()} defect.</span>
                </div>
                <div className="flex items-start gap-2 text-[#E5DFC9]/70">
                  <span className="w-3.5 text-center text-[#E5DFC9]/50">○</span>
                  <span><strong>MISSED:</strong> Secondary exception logging block in rollback handler.</span>
                </div>
                <div className="flex items-start gap-2 text-[#E5DFC9]/70">
                  <span className="w-3.5 text-center text-[#E5DFC9]/50">○</span>
                  <span><strong>FALSE POSITIVE:</strong> None detected.</span>
                </div>
              </div>
            </div>

            {/* Weakness Profile Radar Snapshot */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#E5DFC9] uppercase flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" /> YOUR REVIEW WEAKNESS PROFILE
                </span>
                <Link to="/profile" className="text-2xs text-[#E5DFC9] hover:underline font-mono">
                  Full Analytics →
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-[#1A130D] border border-amber-800/30 text-2xs text-[#E5DFC9]/80 space-y-1 font-mono">
                <p><strong>Strongest:</strong> Authentication &amp; Access Control — 91% catch rate</p>
                <p><strong>Needs Practice:</strong> Concurrency &amp; Race Conditions — 55% catch rate</p>
                <p className="text-amber-300 font-bold mt-1">Recommendation: "Practice 3 concurrency-focused reviews next."</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                size="md"
                variant="secondary"
                onClick={() => navigate(`/pro/debug/${problem.id}`)}
                icon={<RotateCcw size={13} />}
                className="text-xs w-full sm:w-auto"
              >
                Re-review Snippet
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => navigate('/pro/problems')}
                  className="text-xs w-full sm:w-auto"
                >
                  All Professional Exercises
                </Button>
                <Button
                  size="md"
                  variant="gold"
                  onClick={() => navigate(`/pro/debug/${nextProblem.id}`)}
                  iconRight={<ArrowRight size={14} />}
                  className="text-xs font-bold w-full sm:w-auto shadow-md"
                >
                  Next Review
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
