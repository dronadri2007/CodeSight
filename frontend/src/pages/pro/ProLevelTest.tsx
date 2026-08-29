import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bot, Check, ArrowRight, Award, HelpCircle, Shield,
  RefreshCw, CheckCircle2
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const PRO_SNIPPETS = [
  {
    id: 1,
    title: 'Snippet 1: Authentication & Side-Channels',
    code: `def verify_token(user_token, secret_token):\n    # Compare tokens\n    return user_token == secret_token`,
    question: 'What vulnerability exists in this password/token comparison code?',
    options: [
      { text: 'String length mismatch exception', score: 0 },
      { text: 'Timing attack vulnerability due to non-constant time string equality (==)', score: 3 },
      { text: 'Memory leak from unclosed token buffer', score: 0 },
      { text: 'None, this is the standard Python equality operator', score: 0 },
    ],
  },
  {
    id: 2,
    title: 'Snippet 2: Database Concurrency',
    code: `def transfer(acc_from, acc_to, amount):\n    b1 = get_balance(acc_from)\n    b2 = get_balance(acc_to)\n    set_balance(acc_from, b1 - amount)\n    set_balance(acc_to, b2 + amount)`,
    question: 'What defect is present in this financial transfer function?',
    options: [
      { text: 'Non-atomic race condition between read and write operations without transaction lock', score: 3 },
      { text: 'Syntax error in argument list', score: 0 },
      { text: 'Division by zero on empty balances', score: 0 },
      { text: 'TypeError on integer subtraction', score: 0 },
    ],
  },
  {
    id: 3,
    title: 'Snippet 3: Resource Management',
    code: `def export_logs(filename):\n    f = open(filename, 'r')\n    data = f.readlines()\n    return process(data)`,
    question: 'What issue does this file reading code introduce?',
    options: [
      { text: 'File descriptor leak (unclosed file) and high memory allocation from readlines()', score: 3 },
      { text: 'Invalid Python indentation', score: 0 },
      { text: 'None, the OS automatically frees the file immediately', score: 0 },
      { text: 'Slow CPU performance', score: 1 },
    ],
  },
]

export default function ProLevelTest() {
  const navigate = useNavigate()
  const { setProLevel, setSelectedTrack, hasPassedPromotionalTest } = useAuthStore()
  const { setFilters } = useProblemStore()

  useEffect(() => {
    if (!hasPassedPromotionalTest) {
      navigate('/pro/promotional-test')
    }
  }, [hasPassedPromotionalTest, navigate])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentSnippet = PRO_SNIPPETS[currentIdx]
  const currentSelection = selectedAnswers[currentIdx]

  const handleSelectOption = (optIdx: number) => {
    const updated = [...selectedAnswers]
    updated[currentIdx] = optIdx
    setSelectedAnswers(updated)
  }

  const handleNext = () => {
    if (currentIdx < PRO_SNIPPETS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const totalScore = selectedAnswers.reduce((sum, optIdx, qIdx) => {
    const q = PRO_SNIPPETS[qIdx]
    const opt = q.options[optIdx]
    return sum + (opt ? opt.score : 0)
  }, 0)

  let recommendedLevel: LevelTier = 'Beginner'
  let rationale = ''

  if (totalScore >= 8) {
    recommendedLevel = 'Pro'
    rationale = 'You demonstrated sharp instincts for detecting timing side-channels, non-atomic concurrency races, and resource leaks.'
  } else if (totalScore >= 5) {
    recommendedLevel = 'Intermediate'
    rationale = 'You have a solid eye for code review, with strong awareness of resource management and input sanitization.'
  } else {
    recommendedLevel = 'Beginner'
    rationale = 'We recommend starting with Beginner Reviewer exercises to build intuition for common web vulnerabilities and exception handling.'
  }

  const handleStartTrack = () => {
    setProLevel(recommendedLevel)
    setSelectedTrack('pro')
    setFilters({
      mode: 'ai_engineer',
      difficulty: recommendedLevel === 'Beginner' ? 'Easy' : recommendedLevel === 'Intermediate' ? 'Medium' : 'Hard',
    })
    navigate('/pro/problems')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        {!isCompleted ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="sm">REVIEW LEVEL DIAGNOSTIC</Badge>
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold">
                  Snippet {currentIdx + 1} of {PRO_SNIPPETS.length}
                </span>
              </div>

              <div className="flex gap-1.5">
                {PRO_SNIPPETS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-1.5 rounded-full transition-all ${
                      i === currentIdx
                        ? 'bg-[#E5DFC9]'
                        : i < currentIdx
                        ? 'bg-[#E5DFC9]/50'
                        : 'bg-[#3A2F1D]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card className="p-6 sm:p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
              <div>
                <span className="text-2xs font-mono text-[#E5DFC9]/60 uppercase tracking-wider block font-bold mb-1">
                  {currentSnippet.title}
                </span>
                <pre className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] font-mono text-xs text-[#E5DFC9] overflow-x-auto leading-relaxed">
                  {currentSnippet.code}
                </pre>
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#E5DFC9] mb-3">
                  {currentSnippet.question}
                </h2>

                <div className="space-y-2.5">
                  {currentSnippet.options.map((opt, oIdx) => {
                    const isSelected = currentSelection === oIdx
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 text-xs ${
                          isSelected
                            ? 'bg-[#000000] border-[#E5DFC9] text-[#E5DFC9] shadow-md ring-1 ring-[#E5DFC9]/40 font-semibold'
                            : 'bg-[#000000]/60 border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/40 hover:bg-[#000000]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-2xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#E5DFC9] border-[#E5DFC9] text-[#000000]' : 'border-[#3A2F1D] text-[#E5DFC9]/60'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span>{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="gold"
                  onClick={handleNext}
                  disabled={currentSelection === undefined}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs"
                >
                  {currentIdx === PRO_SNIPPETS.length - 1 ? 'Determine Review Level' : 'Next Snippet'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Result Screen */
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] flex items-center justify-center mx-auto shadow-md">
                <Award size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-2xs font-mono uppercase tracking-widest text-[#E5DFC9]/60 font-bold block">
                  REVIEW DIAGNOSTIC COMPLETE
                </span>
                <span className="text-xs font-mono text-[#E5DFC9]/70 uppercase">
                  RECOMMENDED REVIEW LEVEL
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
                  {recommendedLevel.toUpperCase()} REVIEWER
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed bg-[#000000] p-4 rounded-xl border border-[#3A2F1D]">
                {rationale}
              </p>

              <div className="pt-2 space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="gold"
                  onClick={handleStartTrack}
                  iconRight={<ArrowRight size={16} />}
                  className="font-bold text-xs shadow-lg"
                >
                  Start {recommendedLevel} Reviews
                </Button>

                <button
                  onClick={() => {
                    setIsCompleted(false)
                    setCurrentIdx(0)
                    setSelectedAnswers([])
                  }}
                  className="text-2xs text-[#E5DFC9]/60 hover:text-[#E5DFC9] font-mono inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={11} /> Retake Diagnostic
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
