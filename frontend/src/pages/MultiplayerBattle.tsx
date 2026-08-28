import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Timer, Send, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { mockBattleRoom } from '../mock/battle'
import { getExerciseById } from '../mock/exercises'

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-accent/20 text-accent',
  'bg-success/20 text-success',
  'bg-warning/20 text-warning',
  'bg-danger/20 text-danger',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Syntax highlighter (simple span-based) ───────────────────────────────────

const KEYWORDS = /\b(import|from|def|return|if|else|elif|for|while|in|and|or|not|None|True|False|class|with|as|try|except|raise|lambda|is)\b/g
const STRINGS  = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g
const COMMENTS = /(#.*)$/gm
const DECORATORS = /(@\w+)/g

function highlightPython(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(STRINGS,    m => `<span class="text-warning/80">${m}</span>`)
    .replace(KEYWORDS,   m => `<span class="text-accent font-semibold">${m}</span>`)
    .replace(DECORATORS, m => `<span class="text-success/80">${m}</span>`)
    .replace(COMMENTS,   m => `<span class="text-text-muted italic">${m}</span>`)
}

// ─── Animated dots ────────────────────────────────────────────────────────────

function AnimatedDots() {
  const [dots, setDots] = useState(1)
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d % 3) + 1), 500)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono">{'.'.repeat(dots)}</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MultiplayerBattle() {
  useParams<{ roomId: string }>()

  const room     = mockBattleRoom
  const exercise = getExerciseById('ex-08')!
  const codeLines = exercise.code.split('\n')

  const [timeLeft,       setTimeLeft]       = useState(180)
  const [selectedLines,  setSelectedLines]  = useState<number[]>([])
  const [finding,        setFinding]        = useState('')
  const [submitted,      setSubmitted]      = useState(false)
  const [timesUp,        setTimesUp]        = useState(false)
  const [submittedCount, setSubmittedCount] = useState(2)

  // Countdown
  useEffect(() => {
    if (submitted || timesUp) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t)
          setTimesUp(true)
          setSubmitted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [submitted, timesUp])

  const handleLineClick = useCallback((lineIdx: number) => {
    if (submitted) return
    setSelectedLines(prev =>
      prev.includes(lineIdx)
        ? prev.filter(l => l !== lineIdx)
        : [...prev, lineIdx]
    )
  }, [submitted])

  const handleSubmit = useCallback(() => {
    setSubmitted(true)
    setSubmittedCount(3)
  }, [])

  const isWarning = timeLeft < 30

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Top bar */}
      <div className="h-14 border-b border-border bg-bg-secondary flex items-center px-6 gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">Room #{room.id}</span>
        </div>
        <Badge variant="warning">Flask Auth Patch</Badge>
        <Badge variant="muted">Python · Medium</Badge>

        <div className="flex-1" />

        {/* Timer */}
        <div className={clsx(
          'flex items-center gap-2 font-mono text-lg font-bold tabular-nums',
          isWarning ? 'text-warning' : 'text-text-primary'
        )}>
          <Timer size={16} className={isWarning ? 'text-warning' : 'text-text-muted'} />
          {timesUp ? "Time's up!" : formatTime(timeLeft)}
        </div>

        {/* Player avatars */}
        <div className="flex items-center gap-1.5">
          {room.players.map((p, idx) => (
            <div
              key={p.id}
              title={`${p.name} — ${idx < submittedCount ? 'submitted' : 'reviewing'}`}
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-2xs font-bold border-2 transition-all',
                idx < submittedCount
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border bg-bg-elevated text-text-muted'
              )}
            >
              {p.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Code panel */}
        <div className="flex-1 overflow-auto bg-bg-surface">
          <div className="p-6">
            <div className="text-xs text-text-muted mb-3 font-mono flex items-center gap-2">
              <span className="text-success/70">●</span>
              flask_auth_service.py
            </div>
            <pre className="font-mono text-sm leading-relaxed select-none">
              {codeLines.map((line, idx) => {
                const lineNo = idx + 1
                const isSelected = selectedLines.includes(lineNo)
                return (
                  <div
                    key={lineNo}
                    onClick={() => handleLineClick(lineNo)}
                    className={clsx(
                      'flex gap-4 px-3 py-0.5 rounded cursor-pointer group transition-colors duration-75',
                      isSelected
                        ? 'bg-accent/15 border-l-2 border-accent'
                        : 'hover:bg-bg-elevated/60 border-l-2 border-transparent'
                    )}
                  >
                    <span className="w-6 shrink-0 text-right text-text-muted text-xs pt-0.5 select-none">
                      {lineNo}
                    </span>
                    <span
                      className="text-text-secondary"
                      dangerouslySetInnerHTML={{ __html: highlightPython(line || ' ') }}
                    />
                  </div>
                )
              })}
            </pre>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 border-l border-border bg-bg-secondary flex flex-col">

          <div className="flex-1 overflow-auto p-4 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Your Review</h2>

            {/* Selected lines */}
            <div className="space-y-1.5">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Flagged lines
              </p>
              {selectedLines.length === 0 ? (
                <p className="text-xs text-text-muted italic py-2">
                  Click a line in the code to flag it
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedLines.sort((a, b) => a - b).map(l => (
                    <Badge key={l} variant="accent">Line {l}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Finding textarea */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted uppercase tracking-wider font-medium">
                What did you find?
              </label>
              <textarea
                rows={6}
                value={finding}
                onChange={e => setFinding(e.target.value)}
                disabled={submitted}
                placeholder="Describe the issue you found and why it's a problem…"
                className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent/60 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Player status */}
            <div className="space-y-1.5">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                {submittedCount}/{room.players.length} submitted
              </p>
              <div className="flex gap-1.5">
                {room.players.map((p, idx) => (
                  <div
                    key={p.id}
                    title={p.name}
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold',
                      idx < submittedCount
                        ? 'bg-success/15 text-success'
                        : 'bg-bg-elevated text-text-muted'
                    )}
                  >
                    {p.avatar.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit / waiting */}
          <div className="p-4 border-t border-border">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<Send size={15} />}
                    disabled={selectedLines.length === 0 || !finding.trim()}
                    onClick={handleSubmit}
                  >
                    Submit Review
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {timesUp ? "Time's up! Review submitted." : 'Review submitted!'}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Waiting for other reviewers
                      <AnimatedDots />
                    </p>
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {room.players.map((p, idx) => (
                      <div
                        key={p.id}
                        title={p.name}
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                          idx < submittedCount
                            ? 'border-success/40 bg-success/10 text-success'
                            : 'border-border bg-bg-elevated text-text-muted'
                        )}
                      >
                        {idx < submittedCount
                          ? <CheckCircle2 size={13} />
                          : <Clock size={13} />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
