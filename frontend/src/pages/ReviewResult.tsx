import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, animate } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useReviewStore } from '../store/reviewStore'
import { mockExercises } from '../mock/exercises'

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const value = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(value, target, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [target, value])

  return <span style={{ color }}>{display}</span>
}

function CodeDiffLine({ line }: { line: string }) {
  const isAdd = line.startsWith('+')
  const isRemove = line.startsWith('-')
  return (
    <div className={clsx(
      'px-3 py-0.5 font-mono text-sm',
      isAdd && 'text-success bg-success/5 border-l-2 border-success',
      isRemove && 'text-danger bg-danger/5 border-l-2 border-danger',
      !isAdd && !isRemove && 'text-text-secondary',
    )}>
      {line}
    </div>
  )
}

export default function ReviewResult() {
  const navigate = useNavigate()
  const { gradingResult, exercise: storeExercise } = useReviewStore()

  // If no result (direct nav), use a demo
  const exercise = storeExercise ?? mockExercises.find(e => e.id === 'ex-08')!
  const result = gradingResult ?? {
    score: 78,
    localizationScore: 82,
    explanationScore: 75,
    falsePositives: 0,
    trueDefectLines: [15, 16],
    whyMissed: 'You focused on the database connection area, but the key issue was how the password comparison was performed on lines 15–16. The standard == operator compares strings in variable time, leaking timing information.',
    patternToWatch: 'Watch for secret values (passwords, tokens, API keys) compared with == instead of a constant-time function like hmac.compare_digest().',
    realFix: exercise.fixDiff,
    defectClass: exercise.defectClass,
    status: 'confirmed' as const,
    studentFoundLines: [14],
    studentExplanation: 'The password comparison looks like it could be vulnerable to timing attacks.',
  }

  const scoreColor = result.score >= 75 ? '#36D399' : result.score >= 50 ? '#F5B94C' : '#FF5C6C'

  const fixLines = result.realFix.split('\n')

  // Get a few lines around the defect for the "real defect" section
  const codeLines = exercise.code.split('\n')

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Review Complete</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-text-muted text-sm">{exercise.title}</span>
            <Badge variant="accent" size="sm">{exercise.defectClass}</Badge>
          </div>
        </div>
        <Badge variant={result.status === 'confirmed' ? 'success' : 'warning'} size="md">
          {result.status === 'confirmed' ? '✓ Confirmed by Fix' : '~ Plausible Finding'}
        </Badge>
      </div>

      {/* Score section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-bg-surface border border-border rounded-2xl p-6"
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Main score */}
          <div className="text-center lg:text-left flex-shrink-0">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Review Score</p>
            <div className="text-8xl font-bold tracking-tighter leading-none" style={{ color: scoreColor }}>
              <AnimatedScore target={result.score} color={scoreColor} />
            </div>
            <p className="text-text-muted text-sm mt-1">out of 100</p>
          </div>

          <div className="w-px h-16 bg-border hidden lg:block self-center" />

          {/* Sub scores */}
          <div className="flex flex-col gap-4 flex-1">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-text-primary">Localization</span>
                <span className="text-sm font-bold font-mono text-text-primary">{result.localizationScore}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.localizationScore}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <p className="text-2xs text-text-muted mt-1">How precisely you found the defect</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-text-primary">Explanation</span>
                <span className="text-sm font-bold font-mono text-text-primary">{result.explanationScore}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.explanationScore}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-full bg-accent-secondary rounded-full"
                />
              </div>
              <p className="text-2xs text-text-muted mt-1">Quality of your reasoning</p>
            </div>
          </div>

          {/* False positives */}
          {result.falsePositives > 0 && (
            <div className="flex flex-col items-center gap-1 p-3 bg-danger-subtle border border-danger/20 rounded-xl">
              <AlertCircle size={18} className="text-danger" />
              <span className="text-lg font-bold text-danger">{result.falsePositives}</span>
              <span className="text-2xs text-danger/80 text-center">False<br />Positive{result.falsePositives !== 1 ? 's' : ''}</span>
            </div>
          )}
          {result.falsePositives === 0 && (
            <div className="flex flex-col items-center gap-1 p-3 bg-success-subtle border border-success/20 rounded-xl">
              <CheckCircle size={18} className="text-success" />
              <span className="text-lg font-bold text-success">0</span>
              <span className="text-2xs text-success/80 text-center">False<br />Positives</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Teaching Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold text-text-primary">What Happened Here</h2>

        {/* WHERE THE REAL DEFECT WAS */}
        <Card>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Where the Real Defect Was</p>
          <div className="bg-bg-secondary rounded-lg overflow-hidden border border-border font-mono text-sm">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-bg-elevated">
              <span className="text-2xs text-text-muted">{exercise.repo}</span>
            </div>
            {codeLines.map((line, i) => {
              const lineNum = i + 1
              const isDefect = result.trueDefectLines.includes(lineNum)
              return (
                <div
                  key={lineNum}
                  className={clsx(
                    'flex gap-3 px-3 py-0.5',
                    isDefect && 'bg-accent-subtle border-l-2 border-accent'
                  )}
                >
                  <span className={clsx('text-text-muted select-none w-6 text-right flex-shrink-0', isDefect && 'text-accent')}>
                    {lineNum}
                  </span>
                  <span className={clsx(isDefect ? 'text-text-primary' : 'text-text-secondary')}>
                    {line}
                  </span>
                </div>
              )
            })}
          </div>
          {result.trueDefectLines.length > 0 && (
            <p className="text-xs text-text-muted mt-2">
              Defect line{result.trueDefectLines.length > 1 ? 's' : ''}: {result.trueDefectLines.map(l => `L${l}`).join(', ')}
            </p>
          )}
        </Card>

        {/* WHY YOU MISSED IT */}
        <Card>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Why You Missed It</p>
          <p className="text-sm text-text-secondary leading-relaxed">{result.whyMissed}</p>
        </Card>

        {/* PATTERN TO WATCH */}
        <div className="border-l-4 border-accent bg-accent-subtle rounded-r-xl p-4">
          <p className="text-xs text-accent uppercase tracking-wider mb-2">Pattern to Watch Next Time</p>
          <p className="text-sm text-text-primary font-medium">{result.patternToWatch}</p>
        </div>

        {/* THE REAL FIX */}
        <Card>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">The Real Fix</p>
          <div className="bg-bg-secondary rounded-lg overflow-hidden border border-border">
            {fixLines.map((line, i) => (
              <CodeDiffLine key={i} line={line} />
            ))}
          </div>
        </Card>

        {/* YOUR FINDING vs ACTUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Your Finding</p>
            <p className="text-xs text-text-muted mb-2">
              Lines selected: {result.studentFoundLines.length > 0
                ? result.studentFoundLines.map(l => `L${l}`).join(', ')
                : 'None'}
            </p>
            <p className="text-sm text-text-secondary italic">&ldquo;{result.studentExplanation}&rdquo;</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Actual Issue</p>
            <p className="text-xs text-text-muted mb-2">
              Lines: {result.trueDefectLines.map(l => `L${l}`).join(', ')}
            </p>
            <p className="text-sm text-text-secondary">{exercise.referenceExplanation}</p>
          </Card>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border"
      >
        <Button
          size="lg"
          icon={<BookOpen size={16} />}
          iconRight={<ArrowRight size={16} />}
          onClick={() => navigate(`/learn/${exercise.conceptId}`)}
        >
          Learn This Concept
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={<RotateCcw size={16} />}
          onClick={() => navigate('/practice')}
        >
          Try Another Exercise
        </Button>
      </motion.div>
    </div>
  )
}
