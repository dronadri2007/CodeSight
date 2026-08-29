import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, ArrowRight, RotateCcw, Sparkles, CheckCircle2,
  AlertTriangle, Zap, BookOpen, Compass, ChevronRight, Check
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { mockProblems } from '../../mock/problems'

export default function StudentResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const problem = mockProblems.find((p) => p.id === id) || mockProblems[0]
  const recentSub = (user?.recentSubmissions || []).find((s) => s.problemId === problem.id) || {
    totalScore: 90,
    tcScore: 45,
    scScore: 45,
    userTC: 'O(n)',
    userSC: 'O(n)',
    optimalTC: problem.optimalTC,
    optimalSC: problem.optimalSC,
    pass: true,
    aiFeedback: {
      summary: 'Optimal algorithmic efficiency achieved using single-pass hash lookup.',
      timeAnalysis: 'Time complexity matches optimal asymptotic bound.',
      spaceAnalysis: 'Memory usage is within constant auxiliary requirements.',
      optimizationGuidance: ['Consider defensive NoneType validation for empty payloads.'],
      recommendedPattern: 'Single-pass hash table compliment caching.',
    },
  }

  // Next problem
  const nextProblem = mockProblems.find((p) => p.id !== problem.id && p.mode === 'student') || mockProblems[1]

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Result Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3A2F1D] pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="navy" size="sm">EVALUATION COMPLETE</Badge>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <h1 className="text-2xl font-extrabold text-[#E5DFC9]">{problem.title}</h1>
                <p className="text-xs text-[#E5DFC9]/60 font-mono">Topic: {problem.defectClassName}</p>
              </div>

              {/* Score Gauge */}
              <div className="text-right">
                <span className="text-2xs font-mono uppercase text-[#E5DFC9]/60 font-bold block">
                  Overall Score
                </span>
                <span className="text-4xl font-extrabold text-[#E5DFC9] font-mono">
                  {recentSub.totalScore}<span className="text-lg text-[#E5DFC9]/50">/100</span>
                </span>
              </div>
            </div>

            {/* Complexity Gap Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold uppercase block">
                  Time Complexity (TC) — {recentSub.tcScore}/50 pts
                </span>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>Your Code: <strong className="text-[#E5DFC9]">{recentSub.userTC}</strong></span>
                  <span>Optimal: <strong className="text-[#E5DFC9]">{recentSub.optimalTC}</strong></span>
                </div>
                <div className="w-full bg-[#1A130D] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E5DFC9] h-full rounded-full transition-all"
                    style={{ width: `${(recentSub.tcScore / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold uppercase block">
                  Space Complexity (SC) — {recentSub.scScore}/50 pts
                </span>
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span>Your Code: <strong className="text-[#E5DFC9]">{recentSub.userSC}</strong></span>
                  <span>Optimal: <strong className="text-[#E5DFC9]">{recentSub.optimalSC}</strong></span>
                </div>
                <div className="w-full bg-[#1A130D] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E5DFC9] h-full rounded-full transition-all"
                    style={{ width: `${(recentSub.scScore / 50) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* YOUR PERFORMANCE Section */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-4">
              <span className="text-xs font-mono font-bold text-[#E5DFC9] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-[#E5DFC9]" /> YOUR PERFORMANCE &amp; DIAGNOSTICS
              </span>

              <p className="text-xs text-[#E5DFC9]/90 leading-relaxed">
                {recentSub.aiFeedback?.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-2xs font-mono text-emerald-400 font-bold uppercase block">
                    Strengths:
                  </span>
                  <div className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80">
                    {recentSub.aiFeedback?.timeAnalysis || 'Optimal algorithmic loop structure.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-2xs font-mono text-amber-400 font-bold uppercase block">
                    Weakness Detected:
                  </span>
                  <div className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80">
                    Boundary Conditions: Unhandled empty collection checks.
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3.5 rounded-xl bg-[#1A130D] border border-amber-800/30 text-2xs text-[#E5DFC9]/80 space-y-1">
                <span className="font-bold text-[#E5DFC9]">Recommendation:</span>
                <p>Practice 3 more problems involving edge cases and defensive bounds.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                size="md"
                variant="secondary"
                onClick={() => navigate(`/student/practice/${problem.id}`)}
                icon={<RotateCcw size={13} />}
                className="text-xs w-full sm:w-auto"
              >
                Retry Problem
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => navigate('/student/problems')}
                  className="text-xs w-full sm:w-auto"
                >
                  All Student Problems
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => navigate(`/student/practice/${nextProblem.id}`)}
                  iconRight={<ArrowRight size={14} />}
                  className="text-xs font-bold w-full sm:w-auto shadow-md"
                >
                  Next Problem
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
