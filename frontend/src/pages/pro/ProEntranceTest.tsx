import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, ArrowRight } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

export type EntranceResultState = {
  score: number
  maxScore: number
  eligible: boolean
  tier: LevelTier
}

const MAX_SCORE = 15
const ELIGIBLE_MIN = 6

type Question = {
  id: number
  title: string
  code: string
  prompt: string
  options: { text: string; score: number }[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Snippet 1: Query building',
    code: 'query = "SELECT * FROM users WHERE id = " + str(user_id)\ncursor.execute(query)',
    prompt: 'This AI-generated snippet builds a SQL query. What is the main defect?',
    options: [
      { text: 'Nothing — wrapping the value in str() makes it safe', score: 0 },
      { text: 'SQL injection — the value is concatenated into the query instead of passed as a parameterised placeholder', score: 3 },
      { text: 'SELECT * is slower than naming the columns', score: 1 },
      { text: 'The query is missing a LIMIT clause', score: 0 },
    ],
  },
  {
    id: 2,
    title: 'Snippet 2: Row access',
    code: 'def get_user_email(user_id):\n    row = db.query("SELECT email FROM users WHERE id = ?", user_id).fetchone()\n    return row[0]',
    prompt: 'What happens when the id does not exist in the table?',
    options: [
      { text: 'fetchone() raises StopIteration', score: 0 },
      { text: 'row is None, so row[0] raises "TypeError: NoneType object is not subscriptable"', score: 3 },
      { text: 'It returns an empty string', score: 0 },
      { text: 'The query raises a KeyError', score: 0 },
    ],
  },
  {
    id: 3,
    title: 'Snippet 3: Config loading',
    code: "def read_config(path):\n    f = open(path)\n    return json.load(f)",
    prompt: 'Which review comment is correct?',
    options: [
      { text: 'The file handle is never closed — use "with open(path) as f:"', score: 3 },
      { text: 'json.load cannot take a file object', score: 0 },
      { text: 'open() needs mode="rb" for JSON', score: 0 },
      { text: 'It is fine; CPython closes the file on return', score: 1 },
    ],
  },
  {
    id: 4,
    title: 'Snippet 4: API key check',
    code: 'def check_api_key(supplied, expected):\n    return supplied == expected',
    prompt: 'Best finding for a security reviewer?',
    options: [
      { text: '== is fine for comparing strings', score: 0 },
      { text: 'String "==" returns as soon as it hits a mismatching byte, leaking length and prefix via timing — use hmac.compare_digest', score: 3 },
      { text: 'Both sides should be md5-hashed first', score: 1 },
      { text: 'It needs a try/except around the comparison', score: 0 },
    ],
  },
  {
    id: 5,
    title: 'Snippet 5: Balance transfer',
    code: 'def transfer(a, b, amount):\n    if balances[a] >= amount:\n        balances[a] -= amount\n        balances[b] += amount',
    prompt: 'What is the highest-severity issue?',
    options: [
      { text: 'The parameters have no type hints', score: 0 },
      { text: 'The check-then-act on balances[a] is not atomic — two concurrent transfers can both pass the guard and overdraw the account', score: 3 },
      { text: 'KeyError if b is not already in balances', score: 1 },
      { text: 'It should return the new balance', score: 0 },
    ],
  },
]

function tierFor(score: number): LevelTier {
  if (score >= 13) return 'Pro'
  if (score >= 10) return 'Intermediate'
  return 'Beginner'
}

export default function ProEntranceTest() {
  const navigate = useNavigate()
  const { setSelectedTrack, setProLevel, setPassedPromotionalTest, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const q = QUESTIONS[currentIdx]
  const selection = answers[currentIdx]
  const isLast = currentIdx === QUESTIONS.length - 1

  const select = (optIdx: number) => {
    const next = [...answers]
    next[currentIdx] = optIdx
    setAnswers(next)
  }

  const finish = () => {
    const score = answers.reduce((sum, optIdx, i) => sum + (QUESTIONS[i].options[optIdx]?.score ?? 0), 0)
    const eligible = score >= ELIGIBLE_MIN
    const tier = tierFor(score)

    if (eligible) {
      setPassedPromotionalTest(true)
      setSelectedTrack('pro')
      setProLevel(tier)
      setFilters({
        mode: 'ai_engineer',
        difficulty: tier === 'Beginner' ? 'Easy' : tier === 'Intermediate' ? 'Medium' : 'Hard',
      })
      setOnboarded(true)
    }

    const state: EntranceResultState = { score, maxScore: MAX_SCORE, eligible, tier }
    navigate('/pro/entrance-result', { state })
  }

  const next = () => {
    if (isLast) finish()
    else setCurrentIdx(currentIdx + 1)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">AI ENGINEER ENTRANCE TEST</Badge>
              <span className="text-xs font-mono text-[#E5DFC9]/60 font-bold">
                Question {currentIdx + 1} of {QUESTIONS.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i === currentIdx ? 'bg-[#E5DFC9]' : i < currentIdx ? 'bg-[#E5DFC9]/50' : 'bg-[#3A2F1D]'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="p-6 sm:p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-[#E5DFC9]/60 uppercase tracking-wider block font-bold mb-1">
                {q.title}
              </span>
              <pre className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] font-mono text-xs text-[#E5DFC9] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {q.code}
              </pre>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#E5DFC9] mb-3">{q.prompt}</h2>
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selection === oIdx
                  return (
                    <button
                      key={oIdx}
                      onClick={() => select(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 text-xs ${
                        isSelected
                          ? 'bg-[#000000] border-[#E5DFC9] text-[#E5DFC9] shadow-md ring-1 ring-[#E5DFC9]/40 font-semibold'
                          : 'bg-[#000000]/60 border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/40 hover:bg-[#000000]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#E5DFC9] border-[#E5DFC9] text-[#000000]' : 'border-[#3A2F1D] text-[#E5DFC9]/60'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#E5DFC9]/45 font-mono">
                <Bot size={13} /> Score ≥ {ELIGIBLE_MIN} / {MAX_SCORE} unlocks the track
              </span>
              <Button
                size="md"
                variant="gold"
                onClick={next}
                disabled={selection === undefined}
                iconRight={<ArrowRight size={14} />}
                className="font-bold text-xs"
              >
                {isLast ? 'Submit entrance test' : 'Next question'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
