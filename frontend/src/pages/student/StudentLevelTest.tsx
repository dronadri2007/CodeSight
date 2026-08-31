import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Check, ArrowRight, Award, Sparkles, HelpCircle,
  Clock, Shield, ArrowLeft, RefreshCw
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const QUESTIONS = [
  {
    id: 1,
    title: 'Time Complexity Optimization',
    prompt: 'What is the optimal theoretical Time Complexity to find two numbers in an unsorted array of size N that add up to a target sum?',
    options: [
      { text: 'O(N²) using nested loops over all pairs', score: 1 },
      { text: 'O(N log N) by sorting the array first and using two pointers', score: 2 },
      { text: 'O(N) using a single-pass Hash Map for complement lookup', score: 3 },
      { text: 'O(1) using binary bitwise operations', score: 0 },
    ],
    explanation: 'A single-pass hash map achieves O(N) linear time by caching complements during a single traversal.',
  },
  {
    id: 2,
    title: 'Defensive Exception Handling',
    prompt: 'When fetching a database row in Python with `row = cursor.fetchone()`, what is the most robust way to access the first column?',
    options: [
      { text: 'Directly return `row[0]` without checking', score: 0 },
      { text: 'Check `if row is not None:` before indexing `row[0]`, otherwise raise a domain exception', score: 3 },
      { text: 'Wrap the entire file in a bare `try...except:` block', score: 1 },
      { text: 'Rely on database defaults to always return a row', score: 0 },
    ],
    explanation: 'Checking if the result is None prevents unhandled TypeError: NoneType object is not subscriptable runtime exceptions.',
  },
  {
    id: 3,
    title: 'Space Complexity Tradeoff',
    prompt: 'How do you stream a 10 GB log file in Python to search for an error keyword without running out of memory (OOM)?',
    options: [
      { text: '`lines = f.readlines()` to load all lines into a list', score: 1 },
      { text: '`for line in f:` to iterate line-by-line using generators in O(1) memory', score: 3 },
      { text: 'Read the file into a global string variable', score: 0 },
      { text: 'Copy the file to a temporary directory first', score: 0 },
    ],
    explanation: 'Iterating line-by-line streams records on-demand with constant O(1) RAM allocation.',
  },
]

export default function StudentLevelTest() {
  const navigate = useNavigate()
  const { setStudentLevel, setSelectedTrack, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = QUESTIONS[currentIdx]
  const currentSelection = selectedAnswers[currentIdx]

  const handleSelectOption = (optIdx: number) => {
    const updated = [...selectedAnswers]
    updated[currentIdx] = optIdx
    setSelectedAnswers(updated)
  }

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      setIsCompleted(true)
    }
  }

  // Calculate recommendation
  const totalScore = selectedAnswers.reduce((sum, optIdx, qIdx) => {
    const q = QUESTIONS[qIdx]
    const opt = q.options[optIdx]
    return sum + (opt ? opt.score : 0)
  }, 0)

  let recommendedLevel: LevelTier = 'Beginner'
  let rationale = ''

  if (totalScore >= 8) {
    recommendedLevel = 'Pro'
    rationale = 'You demonstrated strong grasp of sub-quadratic hash lookups, generator streaming, and defensive boundary guards.'
  } else if (totalScore >= 5) {
    recommendedLevel = 'Intermediate'
    rationale = 'You have a solid algorithmic foundation with good instincts, but there are a few boundary patterns worth mastering before advanced problem sets.'
  } else {
    recommendedLevel = 'Beginner'
    rationale = 'We recommend starting with fundamentals to strengthen syntax mechanics, array traversals, and exception boundaries.'
  }

  const handleStartTrack = () => {
    setStudentLevel(recommendedLevel)
    setSelectedTrack('student')
    setFilters({
      mode: 'student',
      difficulty: recommendedLevel === 'Beginner' ? 'Easy' : recommendedLevel === 'Intermediate' ? 'Medium' : 'Hard',
    })
    setOnboarded(true)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        {!isCompleted ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            {/* Header / Progress Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
              <div className="flex items-center gap-2">
                <Badge variant="navy" size="sm">KNOW YOUR LEVEL ASSESSMENT</Badge>
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold">
                  Question {currentIdx + 1} of {QUESTIONS.length}
                </span>
              </div>

              <div className="flex gap-1.5">
                {QUESTIONS.map((_, i) => (
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

            {/* Question Card */}
            <Card className="p-6 sm:p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
              <div>
                <span className="text-2xs font-mono text-[#E5DFC9]/60 uppercase tracking-wider block font-bold mb-1">
                  Topic: {currentQ.title}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#E5DFC9]">
                  {currentQ.prompt}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = currentSelection === oIdx
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 text-xs ${
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

              {/* Next / Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleNext}
                  disabled={currentSelection === undefined}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs"
                >
                  {currentIdx === QUESTIONS.length - 1 ? 'Calculate Recommendation' : 'Next Question'}
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
                  ASSESSMENT COMPLETE
                </span>
                <span className="text-xs font-mono text-[#E5DFC9]/70 uppercase">
                  YOUR RECOMMENDED LEVEL
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
                  {recommendedLevel.toUpperCase()}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed bg-[#000000] p-4 rounded-xl border border-[#3A2F1D]">
                {rationale}
              </p>

              <div className="pt-2 space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  onClick={handleStartTrack}
                  iconRight={<ArrowRight size={16} />}
                  className="font-bold text-xs shadow-lg"
                >
                  Start {recommendedLevel} Track
                </Button>

                <button
                  onClick={() => {
                    setIsCompleted(false)
                    setCurrentIdx(0)
                    setSelectedAnswers([])
                  }}
                  className="text-2xs text-[#E5DFC9]/60 hover:text-[#E5DFC9] font-mono inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={11} /> Retake Assessment
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
