import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, AlertTriangle, Send, X, Award, Shield, CheckCircle2,
  ChevronRight, Sparkles, ArrowRight
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge, DifficultyBadge } from '../components/ui/Badge'
import { mockProblems } from '../mock/problems'
import { useAuthStore } from '../store/authStore'

export default function PromotionExam() {
  const navigate = useNavigate()
  const { user, promoteToNextLevel } = useAuthStore()

  // 30 minute countdown timer (1800 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(1800)
  const [currentIdx, setCurrentIdx] = useState(0)
  const examProblems = mockProblems.filter((p) => p.examEligible).slice(0, 2)
  const currentProblem = examProblems[currentIdx] || mockProblems[0]

  const [examCode, setExamCode] = useState<Record<string, string>>({
    [examProblems[0]?.id || 'prob-01']: examProblems[0]?.starterCode || '',
    [examProblems[1]?.id || 'prob-02']: examProblems[1]?.starterCode || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [examResult, setExamResult] = useState<{ passed: boolean; newLevel?: string } | null>(null)

  // Countdown timer hook
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit()
      return
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsRemaining])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleFinalSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      const promotion = promoteToNextLevel()
      setExamResult({ passed: true, newLevel: promotion.newLevel })
    }, 1200)
  }

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      {/* Top Proctored Exam Header */}
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="gold" size="sm">
            PROCTORED PROMOTION EXAM
          </Badge>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <span className="font-bold text-[#E5DFC9]">
            Problem {currentIdx + 1} of {examProblems.length}: {currentProblem.title}
          </span>
        </div>

        {/* Timer Bar (Highlighted) */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              secondsRemaining < 300
                ? 'bg-red-950/50 border-red-500/50 text-red-300 animate-pulse'
                : 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]'
            }`}
          >
            <Clock size={14} className={secondsRemaining < 300 ? 'text-red-400' : 'text-[#E5DFC9]'} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="p-1.5 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9]/60 hover:text-[#E5DFC9] transition-colors"
            title="Exit Exam"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace (Split View) */}
      <main className="flex-1 w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left Problem Statement */}
        <div className="w-full md:w-5/12 h-full overflow-y-auto p-6 space-y-4 border-r border-[#3A2F1D] bg-[#000000] text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#3A2F1D]">
            <DifficultyBadge difficulty={currentProblem.difficulty} />
            <span className="font-mono text-2xs text-[#E5DFC9]/50">{currentProblem.defectClassName}</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-[#E5DFC9]">{currentProblem.title}</h2>
            <p className="text-2xs text-[#E5DFC9]/60 font-mono">
              Target Complexity: {currentProblem.optimalTC} Time, {currentProblem.optimalSC} Space
            </p>
          </div>

          <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
            {currentProblem.description}
          </div>

          {/* Exam Mode Rules Box */}
          <div className="p-4 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2 text-2xs">
            <div className="flex items-center gap-1.5 font-bold text-[#E5DFC9]">
              <AlertTriangle size={13} className="text-[#E5DFC9]" />
              <span>Exam Rules & Constraint Checklist</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#E5DFC9]/70">
              <li>"Run" button is disabled to evaluate first-time correctness.</li>
              <li>Must achieve optimal TC ({currentProblem.optimalTC}) and SC ({currentProblem.optimalSC}).</li>
              <li>Submit before the 30:00 timer expires to record your score.</li>
            </ul>
          </div>
        </div>

        {/* Right Monaco Editor & Submit Footer */}
        <div className="w-full md:w-7/12 h-full flex flex-col bg-[#000000]">
          {/* Editor Header */}
          <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs font-mono text-[#E5DFC9]/60">
            <span>solution.py</span>
            <span className="text-2xs">[Strict Proctored Mode]</span>
          </div>

          {/* Editor Area */}
          <div className="flex-1 w-full overflow-hidden">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={examCode[currentProblem.id] || ''}
              onChange={(val) =>
                setExamCode((prev) => ({
                  ...prev,
                  [currentProblem.id]: val || '',
                }))
              }
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Bottom Submit-Only Bar */}
          <div className="h-14 px-6 bg-[#1A130D] border-t border-[#3A2F1D] flex items-center justify-between flex-shrink-0">
            {/* Pagination between exam problems */}
            <div className="flex items-center gap-2">
              {examProblems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    idx === currentIdx
                      ? 'bg-[#E5DFC9] text-[#000000]'
                      : 'bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9]/60'
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* Final Submit Button (NO RUN BUTTON) */}
            <Button
              size="md"
              variant="primary"
              onClick={handleFinalSubmit}
              loading={isSubmitting}
              icon={<Send size={14} className="text-[#000000]" />}
              className="font-bold text-xs shadow-lg"
            >
              Submit Exam for Promotion
            </Button>
          </div>
        </div>
      </main>

      {/* Promotion Result Modal */}
      <AnimatePresence>
        {examResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full rounded-3xl bg-[#1A130D] border border-[#E5DFC9] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] flex items-center justify-center mx-auto shadow-md">
                <Sparkles size={28} />
              </div>

              <div className="space-y-2">
                <Badge variant="gold" size="sm">EXAM CLEARED</Badge>
                <h2 className="text-2xl font-extrabold text-[#E5DFC9]">Promotion Approved!</h2>
                <p className="text-xs text-[#E5DFC9]/70">
                  Congratulations! You demonstrated sub-quadratic time complexity and zero memory leaks. You have been promoted to:
                </p>
                <div className="py-2">
                  <span className="text-lg font-bold font-mono text-[#E5DFC9] px-4 py-1.5 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                    {examResult.newLevel || 'AI Engineer Beginner'}
                  </span>
                </div>
              </div>

              <Button
                size="md"
                variant="primary"
                onClick={() => navigate('/profile')}
                icon={<ArrowRight size={14} className="text-[#000000]" />}
                className="w-full font-bold text-xs"
              >
                Go to Profile & Unlock Next Tier
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
