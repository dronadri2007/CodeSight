import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useProgressStore } from '../store/progressStore'

interface Question {
  q: string
  options: string[]
  correct: number
}

const questionBank: Record<string, Question[]> = {
  injection: [
    {
      q: 'Which version creates the SQL injection vulnerability?',
      options: [
        'query = "SELECT * FROM users WHERE id = " + user_id',
        'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
        'db.query("SELECT * FROM users").filter(id=user_id)',
      ],
      correct: 0,
    },
    {
      q: 'What is the risk of string-concatenated SQL queries?',
      options: [
        'The query runs slower',
        'Attackers can inject SQL syntax to manipulate the database',
        'It breaks on special characters in names',
      ],
      correct: 1,
    },
    {
      q: 'What is the correct fix for SQL injection?',
      options: [
        'Validate that input is a number',
        'Use parameterized queries with database driver escaping',
        'Remove special characters with a regex',
      ],
      correct: 1,
    },
  ],
  auth: [
    {
      q: 'What makes a timing attack possible on authentication?',
      options: [
        'The server uses an old SSL version',
        'String comparison returns faster when a mismatch is found early',
        'The password is stored in plaintext',
      ],
      correct: 1,
    },
    {
      q: 'Which Python function provides constant-time comparison?',
      options: [
        'str.__eq__()',
        'hashlib.compare()',
        'hmac.compare_digest()',
      ],
      correct: 2,
    },
    {
      q: 'Why is a timing attack dangerous on a login endpoint?',
      options: [
        'It causes database corruption',
        'It allows attackers to enumerate valid usernames via response time differences',
        'It logs users out unexpectedly',
      ],
      correct: 1,
    },
  ],
  'error-handling': [
    {
      q: 'What happens when an async function rejects without a catch in Node.js 15+?',
      options: [
        'The error is silently ignored',
        'The entire process crashes with an unhandledRejection error',
        'The function retries automatically',
      ],
      correct: 1,
    },
    {
      q: 'Which pattern is the most dangerous in a worker loop?',
      options: [
        'Using try/catch inside the task handler',
        'Calling an async function without await or .catch()',
        'Awaiting a promise that resolves immediately',
      ],
      correct: 1,
    },
    {
      q: 'What is the safest pattern for async task processing?',
      options: [
        'Wrap all async operations in try/catch and log failures explicitly',
        'Use synchronous code instead',
        'Add a global unhandledRejection listener and ignore it',
      ],
      correct: 0,
    },
  ],
}

const fallbackQuestions: Question[] = [
  {
    q: 'What is the first step when you spot a potential defect?',
    options: [
      'Ignore it if it looks minor',
      'Select the suspicious lines and explain your reasoning',
      'Rewrite the entire function',
    ],
    correct: 1,
  },
  {
    q: 'What makes a code review finding high-quality?',
    options: [
      'Finding as many issues as possible',
      'Precise line identification with a clear explanation of impact',
      'Copying a generic description from documentation',
    ],
    correct: 1,
  },
  {
    q: 'Why is understanding defect patterns important?',
    options: [
      'It makes code faster',
      'Pattern recognition helps you spot similar defects in unfamiliar codebases',
      'It is only useful for compilers',
    ],
    correct: 1,
  },
]

export default function MicroCheck() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const { markCheckComplete } = useProgressStore()

  const questions = (conceptId && questionBank[conceptId]) ? questionBank[conceptId] : fallbackQuestions

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [scores, setScores] = useState<boolean[]>([])
  const [done, setDone] = useState(false)

  const current = questions[currentIdx]
  const totalCorrect = scores.filter(Boolean).length

  const handleSubmit = () => {
    if (selectedOption === null) return
    const correct = selectedOption === current.correct
    setSubmitted(true)
    setScores(prev => [...prev, correct])
  }

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      if (conceptId) markCheckComplete(conceptId)
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
      setSelectedOption(null)
      setSubmitted(false)
    }
  }

  const progressPct = ((currentIdx) / questions.length) * 100

  if (done) {
    const perfect = totalCorrect === questions.length
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          {/* Score */}
          <div className={clsx(
            'w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold border-4',
            perfect
              ? 'border-success text-success bg-success/10'
              : totalCorrect >= 2
              ? 'border-warning text-warning bg-warning/10'
              : 'border-danger text-danger bg-danger/10'
          )}>
            {totalCorrect}/{questions.length}
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {perfect ? 'Perfect score!' : totalCorrect >= 2 ? 'Good work!' : 'Keep practicing!'}
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Ready for the real challenge? Apply what you've learned on an actual exercise.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/practice?class=${conceptId ?? ''}`)}
            >
              Review a Similar Exercise
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate('/practice')}
            >
              Back to Practice
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top progress bar */}
      <div className="w-full h-0.5 bg-bg-surface">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-16">
        <div className="max-w-xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs uppercase tracking-widest font-semibold text-text-muted">
              Concept Check
            </span>
            <span className="text-xs text-text-muted font-mono">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Question */}
              <h2 className="text-xl font-semibold text-text-primary mb-6 leading-snug">
                {current.q}
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3 mb-8">
                {current.options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === current.correct
                  const isWrong = submitted && isSelected && !isCorrect
                  const isRight = submitted && isCorrect

                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setSelectedOption(idx)}
                      className={clsx(
                        'w-full text-left p-4 rounded-xl border text-sm transition-all duration-200',
                        'flex items-center gap-3',
                        !submitted && !isSelected && 'bg-bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text-primary',
                        !submitted && isSelected && 'bg-accent-subtle border-accent text-text-primary',
                        submitted && isRight && 'bg-success/10 border-success text-success',
                        submitted && isWrong && 'bg-danger/10 border-danger text-danger',
                        submitted && !isSelected && !isCorrect && 'bg-bg-surface border-border text-text-muted opacity-50',
                      )}
                    >
                      <span className={clsx(
                        'w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors',
                        !submitted && !isSelected && 'border-border text-text-muted',
                        !submitted && isSelected && 'border-accent text-accent',
                        submitted && isRight && 'border-success',
                        submitted && isWrong && 'border-danger',
                        submitted && !isSelected && !isCorrect && 'border-border opacity-50',
                      )}>
                        {submitted && isRight ? (
                          <CheckCircle size={14} className="text-success" />
                        ) : submitted && isWrong ? (
                          <XCircle size={14} className="text-danger" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="font-mono leading-relaxed">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    'p-4 rounded-xl mb-6 text-sm',
                    selectedOption === current.correct
                      ? 'bg-success/10 border border-success/30 text-success'
                      : 'bg-danger/10 border border-danger/30 text-danger'
                  )}
                >
                  {selectedOption === current.correct
                    ? "✓ Correct! That's the key insight."
                    : `✗ Not quite. The correct answer is: "${current.options[current.correct]}"`}
                </motion.div>
              )}

              {/* Actions */}
              {!submitted ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedOption === null}
                  onClick={handleSubmit}
                  fullWidth
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  fullWidth
                >
                  {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
