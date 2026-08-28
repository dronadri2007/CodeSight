import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'

const questionsMap: Record<string, { q: string; options: string[]; correctIdx: number; explanation: string }[]> = {
  'error-handling': [
    {
      q: 'Why is accessing row[0] immediately after cursor.fetchone() problematic?',
      options: [
        'fetchone() consumes too much memory for single rows',
        'If the user is not found, fetchone() returns None and raises a TypeError on subscripting',
        'Database cursors must be converted to JSON first',
      ],
      correctIdx: 1,
      explanation: 'When no records match the WHERE clause, cursor.fetchone() returns None. Accessing None[0] throws a fatal runtime exception.',
    },
    {
      q: 'What is the best practice when handling database lookups that might return nothing?',
      options: [
        'Wrap the whole application in a global try/except pass block',
        'Explicitly check `if row is None:` and raise a domain exception or return a clean fallback',
        'Always execute a SELECT COUNT(*) query first before fetching',
      ],
      correctIdx: 1,
      explanation: 'Checking for None upfront provides clean domain exception handling and prevents silent data corruption.',
    },
    {
      q: 'What happens when an async worker swallows an unhandled promise rejection or error?',
      options: [
        'The database automatically retries the operation',
        'The task fails silently without notifications, leaving resources in an orphaned state',
        'The client receives an immediate 200 OK with cached data',
      ],
      correctIdx: 1,
      explanation: 'Swallowed exceptions hide failures from metrics monitors and cause silent data desynchronization.',
    },
  ],
  default: [
    {
      q: 'What creates a SQL injection flaw in a database query?',
      options: [
        'Using raw string interpolation instead of driver parameter bindings',
        'Using VARCHAR instead of TEXT in database schemas',
        'Executing queries on indexed columns',
      ],
      correctIdx: 0,
      explanation: 'String concatenation enables user input to escape quotes and inject arbitrary SQL syntax.',
    },
    {
      q: 'How does parameter binding protect queries?',
      options: [
        'It converts all strings to SHA-256 hashes',
        'The database engine treats the input strictly as a literal data parameter, never executable syntax',
        'It caches the query results in Redis',
      ],
      correctIdx: 1,
      explanation: 'The query template is pre-compiled; parameters are bound safely without modifying the syntax tree.',
    },
    {
      q: 'Which comparison method prevents timing side-channel attacks on secret tokens?',
      options: [
        'Standard `==` equality comparison',
        'Constant-time digest comparison (`hmac.compare_digest`)',
        'Regex pattern matching',
      ],
      correctIdx: 1,
      explanation: 'Standard `==` exits on the first mismatched character, allowing attackers to measure timing deltas.',
    },
  ],
}

export default function StudentMicroCheck() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const questions = questionsMap[conceptId || ''] || questionsMap.default

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const currentQ = questions[currentIdx]

  const handleSelect = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
  }

  const handleCheck = () => {
    if (selectedOption === null) return
    setIsAnswered(true)
    if (selectedOption === currentQ.correctIdx) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setCompleted(true)
    }
  }

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {!completed ? (
          <Card dark className="p-8 border-navy-border space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-aqua font-semibold">
                MICRO-CHECK QUESTION {currentIdx + 1} OF {questions.length}
              </span>
              <ProgressBar
                dark
                value={((currentIdx + 1) / questions.length) * 100}
                className="w-32"
              />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.q}
            </h2>

            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i
                const isCorrect = i === currentQ.correctIdx

                let optionStyle = 'bg-navy-midnight border-navy-border text-slate hover:border-aqua/40 hover:text-white'
                if (isAnswered) {
                  if (isCorrect) optionStyle = 'bg-success/15 border-success text-success font-semibold'
                  else if (isSelected) optionStyle = 'bg-danger/15 border-danger text-danger'
                } else if (isSelected) {
                  optionStyle = 'bg-aqua/10 border-aqua text-white font-semibold'
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-2xs font-mono flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>
                )
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-navy-midnight border border-navy-border text-xs text-slate space-y-1"
              >
                <p className="font-semibold text-white">Explanation:</p>
                <p>{currentQ.explanation}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-navy-border">
              <button
                onClick={() => navigate('/student/practice')}
                className="text-xs text-slate hover:text-white"
              >
                Skip Check
              </button>

              {!isAnswered ? (
                <Button
                  size="md"
                  disabled={selectedOption === null}
                  onClick={handleCheck}
                  className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
                >
                  Verify Answer
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={handleNext}
                  iconRight={<ArrowRight size={14} />}
                  className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
                >
                  {currentIdx + 1 < questions.length ? 'Next Question' : 'View Summary'}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card dark className="p-8 border-aqua/30 text-center space-y-6 shadow-aqua-glow">
            <div className="w-16 h-16 rounded-2xl bg-aqua/20 text-aqua flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-aqua font-semibold">
                CHECK COMPLETE
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                You scored {score} / {questions.length}!
              </h2>
              <p className="text-xs text-slate max-w-md mx-auto leading-relaxed">
                You've locked in the theoretical foundation. Now apply it to real code in the practice library.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/student/practice/stu-01')}
                className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
              >
                Practice Similar Challenge
              </Button>
              <Button
                size="lg"
                variant="dark"
                onClick={() => navigate('/student/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
