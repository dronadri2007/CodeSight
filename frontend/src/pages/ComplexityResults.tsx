import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, ArrowRight, BookOpen, RotateCcw,
  Sparkles, Bot, Gauge, Zap, ChevronRight, Check, Award
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useProblemStore } from '../store/problemStore'
import { useAuthStore } from '../store/authStore'
import { mockProblems } from '../mock/problems'

export default function ComplexityResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lastResult, getProblemById } = useProblemStore()
  const problem = getProblemById(id || 'prob-01') || mockProblems[0]

  // Fallback if accessed directly
  const result = lastResult || {
    problemId: problem.id,
    problemTitle: problem.title,
    mode: problem.mode,
    userCode: problem.starterCode,
    userTC: problem.optimalTC,
    userSC: problem.optimalSC,
    optimalTC: problem.optimalTC,
    optimalSC: problem.optimalSC,
    tcScore: 50,
    scScore: 50,
    totalScore: 100,
    pass: true,
    aiFeedback: {
      summary: 'Optimal algorithmic efficiency achieved using single-pass hash lookup.',
      timeAnalysis: `Your submission achieved ${problem.optimalTC} time complexity.`,
      spaceAnalysis: `Your submission utilized ${problem.optimalSC} auxiliary memory.`,
      optimizationGuidance: ['Clean implementation meeting production performance requirements.'],
      recommendedPattern: problem.weaknessPattern,
    },
    timestamp: 'Just now',
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top Header Card */}
        <Card className="p-8 border-[#3A2F1D] bg-[#1A130D] shadow-2xl relative overflow-hidden text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge variant={result.pass ? 'gold' : 'default'} size="sm">
                  {result.pass ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
                </Badge>
                <span className="text-2xs font-mono text-[#E5DFC9]/60">{problem.defectClassName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
                {problem.title}
              </h1>
              <p className="text-xs text-[#E5DFC9]/70">
                Evaluation results relative to optimal achievable time and space bounds.
              </p>
            </div>

            {/* Score Pill */}
            <div className="p-6 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-center min-w-[140px] shadow-lg">
              <div className="text-4xl font-extrabold font-mono text-[#E5DFC9]">
                {result.totalScore}
              </div>
              <div className="text-2xs font-mono text-[#E5DFC9]/60 uppercase tracking-wider mt-0.5">
                Score / 100
              </div>
            </div>
          </div>
        </Card>

        {/* Complexity Gap Visual Comparison (50% TC + 50% SC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Time Complexity Card */}
          <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#E5DFC9]" />
                <h3 className="font-bold text-xs text-[#E5DFC9]">Time Complexity (50% Weight)</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#E5DFC9]">{result.tcScore} / 50 pts</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5DFC9]/60">Your Solution:</span>
                <span className="font-mono font-bold text-[#E5DFC9] px-2 py-0.5 rounded bg-[#000000] border border-[#3A2F1D]">
                  {result.userTC}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5DFC9]/60">Optimal Achievable:</span>
                <span className="font-mono font-bold text-[#E5DFC9] px-2 py-0.5 rounded bg-[#000000] border border-[#3A2F1D]">
                  {result.optimalTC}
                </span>
              </div>
              <p className="text-2xs text-[#E5DFC9]/70 pt-1 leading-relaxed">
                {result.aiFeedback.timeAnalysis}
              </p>
            </div>
          </Card>

          {/* Space Complexity Card */}
          <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#E5DFC9]" />
                <h3 className="font-bold text-xs text-[#E5DFC9]">Space Complexity (50% Weight)</h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#E5DFC9]">{result.scScore} / 50 pts</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5DFC9]/60">Your Solution:</span>
                <span className="font-mono font-bold text-[#E5DFC9] px-2 py-0.5 rounded bg-[#000000] border border-[#3A2F1D]">
                  {result.userSC}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#E5DFC9]/60">Optimal Achievable:</span>
                <span className="font-mono font-bold text-[#E5DFC9] px-2 py-0.5 rounded bg-[#000000] border border-[#3A2F1D]">
                  {result.optimalSC}
                </span>
              </div>
              <p className="text-2xs text-[#E5DFC9]/70 pt-1 leading-relaxed">
                {result.aiFeedback.spaceAnalysis}
              </p>
            </div>
          </Card>
        </div>

        {/* Claude AI Pedagogical Teaching Critique */}
        <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#3A2F1D] pb-3">
            <Bot size={18} className="text-[#E5DFC9]" />
            <h3 className="font-bold text-xs text-[#E5DFC9]">Claude AI Architectural Critique</h3>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-[#E5DFC9] font-semibold">{result.aiFeedback.summary}</p>
            <div className="space-y-1.5 pt-1">
              <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 block font-bold">
                Optimization Recommendations:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#E5DFC9]/80 text-2xs">
                {result.aiFeedback.optimizationGuidance.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1 text-2xs">
              <span className="font-bold text-[#E5DFC9]">Pattern to Practice Next:</span>
              <p className="text-[#E5DFC9]/70">{result.aiFeedback.recommendedPattern}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            size="md"
            variant="secondary"
            onClick={() => navigate('/problems')}
            className="text-xs w-full sm:w-auto"
          >
            Back to Problems
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              size="md"
              variant="secondary"
              onClick={() => navigate(`/learn/${problem.conceptId}`)}
              icon={<BookOpen size={14} />}
              className="text-xs w-full sm:w-auto"
            >
              Learn the Concept
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate(`/practice/${mockProblems[(problem.number % mockProblems.length)]?.id || 'prob-01'}`)}
              icon={<ArrowRight size={14} className="text-[#000000]" />}
              className="font-bold text-xs w-full sm:w-auto shadow-md"
            >
              Next Exercise
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
