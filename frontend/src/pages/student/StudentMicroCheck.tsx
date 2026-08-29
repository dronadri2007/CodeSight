import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import {
  getMicroCheck,
  submitMicroCheck,
  type MicroCheckAnswer,
  type MicroCheckQuestion,
  type MicroCheckQuestionResult,
  type MicroCheckResult,
} from '../../api/concepts'

export default function StudentMicroCheck() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<MicroCheckQuestion[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answers, setAnswers] = useState<MicroCheckAnswer[]>([])
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<MicroCheckQuestionResult | null>(null)
  const [finalResult, setFinalResult] = useState<MicroCheckResult | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!conceptId) return
    let cancelled = false
    setQuestions(null)
    setLoadError(null)
    getMicroCheck(conceptId)
      .then((d) => {
        if (!cancelled) setQuestions(d.questions)
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load the check')
      })
    return () => {
      cancelled = true
    }
  }, [conceptId])

  const currentQ = questions?.[currentIdx]

  const handleSelect = (idx: number) => {
    if (feedback || checking) return
    setSelectedOption(idx)
  }

  const handleCheck = async () => {
    if (selectedOption === null || !currentQ || !conceptId) return
    const nextAnswers: MicroCheckAnswer[] = [
      ...answers.filter((a) => a.question_id !== currentQ.id),
      { question_id: currentQ.id, choice_index: selectedOption },
    ]
    setAnswers(nextAnswers)
    setChecking(true)
    try {
      const res = await submitMicroCheck(conceptId, nextAnswers)
      setFeedback(res.results.find((r) => r.question_id === currentQ.id) ?? null)
      if (questions && currentIdx + 1 >= questions.length) setFinalResult(res)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not grade the answer')
    } finally {
      setChecking(false)
    }
  }

  const handleNext = () => {
    if (questions && currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1)
      setSelectedOption(null)
      setFeedback(null)
    } else {
      setCompleted(true)
    }
  }

  // --- loading / error --------------------------------------------------
  if (loadError && !questions) {
    return (
      <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
        <Navbar variant="student" />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <Card dark className="p-8 border-danger/40 text-center space-y-4">
            <h2 className="text-lg font-bold text-danger">Couldn’t load this check</h2>
            <p className="text-xs text-slate">{loadError}</p>
            <Button size="md" variant="dark" onClick={() => navigate(`/student/learn/${conceptId ?? ''}`)}>
              Back to the concept
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  if (!questions || !currentQ) {
    return (
      <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
        <Navbar variant="student" />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <Card dark className="p-8 border-navy-border text-center">
            <p className="text-sm text-slate animate-pulse">Loading check…</p>
          </Card>
        </main>
      </div>
    )
  }

  // --- summary --------------------------------------------------------
  if (completed && !finalResult) {
    return (
      <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
        <Navbar variant="student" />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <Card dark className="p-8 border-danger/40 text-center space-y-4">
            <h2 className="text-lg font-bold text-danger">Couldn’t score the check</h2>
            <p className="text-xs text-slate">{loadError ?? 'Please try again.'}</p>
            <Button size="md" variant="dark" onClick={() => navigate('/student/practice')}>
              Back to practice
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  if (completed && finalResult) {
    const { correct, total, passed, results, practice_exercise_ids } = finalResult
    return (
      <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
        <Navbar variant="student" />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
          <Card dark className={`p-8 text-center space-y-6 ${passed ? 'border-aqua/30 shadow-aqua-glow' : 'border-warning/30'}`}>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                passed ? 'bg-aqua/20 text-aqua' : 'bg-warning/20 text-warning'
              }`}
            >
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-aqua font-semibold">
                {passed ? 'CHECK PASSED' : 'CHECK COMPLETE'}
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                You scored {correct} / {total}
              </h2>
              <p className="text-xs text-slate max-w-md mx-auto leading-relaxed">
                {passed
                  ? 'Solid grasp of the concept. Now apply it to real code in the practice library.'
                  : 'Not quite there — re-read the concept, then try applying it on a real exercise.'}
              </p>
            </div>

            <div className="text-left space-y-3">
              {results.map((r, i) => (
                <div
                  key={r.question_id}
                  className={`p-4 rounded-xl border text-xs ${
                    r.correct ? 'border-success/40 bg-success/10' : 'border-danger/40 bg-danger/10'
                  }`}
                >
                  <p className={`font-semibold ${r.correct ? 'text-success' : 'text-danger'}`}>
                    {r.correct ? '✓' : '✗'} Question {i + 1}
                  </p>
                  <p className="text-slate mt-1 leading-relaxed">{r.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() =>
                  navigate(
                    practice_exercise_ids.length
                      ? `/student/practice/${practice_exercise_ids[0]}`
                      : '/student/practice',
                  )
                }
                className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
              >
                Practice Similar Challenge
              </Button>
              <Button size="lg" variant="dark" onClick={() => navigate('/student/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // --- question ------------------------------------------------------
  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      <Navbar variant="student" />

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <Card dark className="p-8 border-navy-border space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-aqua font-semibold">
              MICRO-CHECK QUESTION {currentIdx + 1} OF {questions.length}
            </span>
            <ProgressBar dark value={((currentIdx + 1) / questions.length) * 100} className="w-32" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">{currentQ.prompt}</h2>

          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === i
              const isCorrect = feedback ? i === feedback.correct_index : false
              const isWrongPick = feedback ? i === feedback.your_index && !feedback.correct : false

              let optionStyle =
                'bg-navy-midnight border-navy-border text-slate hover:border-aqua/40 hover:text-white'
              if (feedback) {
                if (isCorrect) optionStyle = 'bg-success/15 border-success text-success font-semibold'
                else if (isWrongPick) optionStyle = 'bg-danger/15 border-danger text-danger'
              } else if (isSelected) {
                optionStyle = 'bg-aqua/10 border-aqua text-white font-semibold'
              }

              return (
                <div
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`p-4 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                    feedback ? 'cursor-default' : 'cursor-pointer'
                  } ${optionStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-2xs font-mono flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </div>
              )
            })}
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-navy-midnight border border-navy-border text-xs text-slate space-y-1"
            >
              <p className={`font-semibold ${feedback.correct ? 'text-success' : 'text-danger'}`}>
                {feedback.correct ? 'Correct' : 'Not quite'}
              </p>
              <p>{feedback.explanation}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-navy-border">
            <button
              onClick={() => navigate('/student/practice')}
              className="text-xs text-slate hover:text-white"
            >
              Skip Check
            </button>

            {!feedback ? (
              <Button
                size="md"
                disabled={selectedOption === null || checking}
                onClick={handleCheck}
                className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
              >
                {checking ? 'Checking…' : 'Verify Answer'}
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
      </main>
    </div>
  )
}
