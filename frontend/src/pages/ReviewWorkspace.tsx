import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor, { type Monaco } from '@monaco-editor/react'
import {
  Timer, X, ChevronRight, ChevronDown, Eye, Lightbulb,
  Minus, Plus, AlertCircle, Code2
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge, DifficultyBadge } from '../components/ui/Badge'
import { GradingLoader } from '../components/ui/LoadingSkeleton'
import { useReviewStore } from '../store/reviewStore'
import { useProgressStore } from '../store/progressStore'
import { useUIStore } from '../store/uiStore'
import { getExercise, submitReview } from '../api/exercises'
import type { editor as MonacoEditor } from 'monaco-editor'

const HINTS: Record<string, string[]> = {
  injection: [
    'Look at how user input reaches a sensitive operation.',
    'Focus on where request data is used without transformation.',
    'Trace the username and password variables through the function.',
  ],
  auth: [
    'Consider how the authentication comparison is performed.',
    'Think about timing attacks in authentication code.',
    'The comparison function matters, not just what is compared.',
  ],
  'error-handling': [
    'Look for async operations without error handling.',
    'Check every await call — what happens if it rejects?',
    'A missing try/catch in an async worker can cause silent failures.',
  ],
  concurrency: [
    'Look for variables shared across concurrent operations.',
    'Consider what happens when two goroutines run simultaneously.',
    'Check for mutation of shared state without synchronization.',
  ],
  logic: [
    'Check every loop boundary condition carefully.',
    'Off-by-one errors are often in loop conditions.',
    'What happens when the index equals the length?',
  ],
  resource: [
    'Look for acquired resources that might never be released.',
    'Check for data structures that can grow without bound.',
    'Where is the cleanup or eviction logic?',
  ],
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function SelectedLineTag({ line, onRemove }: { line: number; onRemove: (l: number) => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent-subtle border border-accent/30 text-accent text-xs font-mono"
    >
      L{line}
      <button onClick={() => onRemove(line)} className="hover:text-danger transition-colors ml-0.5">
        <X size={10} />
      </button>
    </motion.span>
  )
}

function HintPanel({ defectClassId, hintsUsed, onUseHint }: {
  defectClassId: string
  hintsUsed: number
  onUseHint: () => void
}) {
  const [open, setOpen] = useState(false)
  const hints = HINTS[defectClassId] || HINTS['injection']
  const penalties = [10, 25, 50]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
      >
        <span className="flex items-center gap-2">
          <Lightbulb size={14} />
          Need a hint?
          {hintsUsed > 0 && (
            <Badge variant="warning" size="sm">{hintsUsed} used</Badge>
          )}
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border space-y-2 pt-2">
              {hints.slice(0, hintsUsed).map((hint, i) => (
                <div key={i} className="text-xs text-text-secondary bg-bg-elevated rounded px-2 py-1.5 border border-border">
                  <span className="text-text-muted">Hint {i + 1}: </span>{hint}
                </div>
              ))}
              {hintsUsed < hints.length && (
                <button
                  onClick={onUseHint}
                  className="w-full text-left text-xs text-warning bg-warning-subtle border border-warning/20 rounded px-2 py-1.5 hover:bg-warning/20 transition-colors"
                >
                  Reveal Hint {hintsUsed + 1}
                  <span className="ml-1 opacity-70">
                    (−{penalties[hintsUsed]}% score impact)
                  </span>
                </button>
              )}
              {hintsUsed >= hints.length && (
                <p className="text-xs text-text-muted text-center">All hints revealed.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ReviewWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsRef = useRef<string[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    exercise, selectedLines, explanation, timerSeconds, submissionStatus,
    setExercise, toggleLine, setExplanation, decrementTimer,
    setSubmitting, setGradingResult, setError, useHint, hintsUsed,
  } = useReviewStore()

  const { updateCatchRate, completeExercise } = useProgressStore()
  const { showToast } = useUIStore()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  // Load exercise
  useEffect(() => {
    if (!id) return
    setLoading(true)
    getExercise(id)
      .then((ex) => {
        setExercise(ex)
        setLoading(false)
      })
      .catch((err) => {
        setLoadError(err.message)
        setLoading(false)
      })
  }, [id, setExercise])

  // Timer
  useEffect(() => {
    if (!exercise || submissionStatus !== 'idle') return
    timerRef.current = setInterval(decrementTimer, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [exercise, submissionStatus, decrementTimer])

  // Stop timer on submission
  useEffect(() => {
    if (submissionStatus !== 'idle' && timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [submissionStatus])

  // Navigate to result when graded
  useEffect(() => {
    if (submissionStatus === 'graded') {
      navigate(`/practice/${id}/result`)
    }
  }, [submissionStatus, id, navigate])

  // Update Monaco decorations when selectedLines or hoveredLine changes
  const updateDecorations = useCallback(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const newDecorations = [
      ...selectedLines.map((line) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'selected-line-decoration',
          linesDecorationsClassName: 'selected-line-gutter',
        },
      })),
      ...(hoveredLine && !selectedLines.includes(hoveredLine) ? [{
        range: new monaco.Range(hoveredLine, 1, hoveredLine, 1),
        options: {
          isWholeLine: true,
          className: 'hovered-line-decoration',
        },
      }] : []),
    ]

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations)
  }, [selectedLines, hoveredLine])

  useEffect(() => {
    updateDecorations()
  }, [updateDecorations])

  const handleEditorDidMount = (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.onMouseDown((e) => {
      if (e.target.position) {
        const line = e.target.position.lineNumber
        toggleLine(line)
      }
    })

    editor.onMouseMove((e) => {
      if (e.target.position) {
        setHoveredLine(e.target.position.lineNumber)
      } else {
        setHoveredLine(null)
      }
    })

    editor.onMouseLeave(() => setHoveredLine(null))

    // Disable text selection (we want line selection mode)
    editor.updateOptions({ readOnly: false, domReadOnly: true })
    updateDecorations()
  }

  const handleSubmit = async () => {
    if (!exercise || !id) return
    if (selectedLines.length === 0) {
      showToast('Please select at least one suspicious line.', 'error')
      return
    }
    if (explanation.trim().length < 10) {
      showToast('Please explain what you found before submitting.', 'error')
      return
    }

    setSubmitting()

    try {
      const timeTaken = exercise.estimatedMinutes * 60 - timerSeconds
      const result = await submitReview({
        exerciseId: id,
        selectedLines,
        explanation,
        timeTaken,
        hintsUsed,
      })
      setGradingResult(result)
      updateCatchRate(exercise.defectClassId, result.localizationScore >= 60)
      completeExercise()
    } catch (err) {
      setError()
      showToast('Submission failed. Please try again.', 'error')
    }
  }

  const timerColor = timerSeconds < 30 ? 'text-danger' : timerSeconds < 60 ? 'text-warning' : 'text-text-secondary'
  const isSubmitting = submissionStatus === 'submitting'
  const canSubmit = selectedLines.length > 0 && explanation.trim().length >= 10

  const langMap: Record<string, string> = {
    Python: 'python',
    JavaScript: 'javascript',
    TypeScript: 'typescript',
    Go: 'go',
    Java: 'java',
    Ruby: 'ruby',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (loadError || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <AlertCircle size={32} className="text-danger" />
        <p className="text-text-primary font-medium">Exercise not found</p>
        <p className="text-text-muted text-sm">{loadError}</p>
        <Button onClick={() => navigate('/practice')} variant="secondary">Back to Practice</Button>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center h-full">
        <GradingLoader />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 h-12 border-b border-border bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <Eye size={11} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">CodeSight</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-text-secondary font-medium">Exercise {String(exercise.number).padStart(2, '0')}</span>
        <Badge variant="muted" size="sm">{exercise.language}</Badge>
        <DifficultyBadge difficulty={exercise.difficulty} />
        <div className="flex-1" />
        {/* Timer */}
        <div className={clsx('flex items-center gap-1.5 font-mono text-sm font-medium', timerColor)}>
          <Timer size={13} />
          {formatTime(timerSeconds)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={13} />}
          onClick={() => navigate('/practice')}
        >
          Exit
        </Button>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Code editor - LEFT */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-border">
          {/* Editor header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-bg-surface flex-shrink-0">
            <Code2 size={13} className="text-text-muted" />
            <span className="text-xs font-mono text-text-muted">{exercise.repo}</span>
            <div className="flex-1" />
            <span className="text-xs text-text-muted">Click a line to select it as suspicious</span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              defaultLanguage={langMap[exercise.language] || 'plaintext'}
              value={exercise.code}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                renderLineHighlight: 'none',
                selectionHighlight: false,
                occurrencesHighlight: 'off',
                contextmenu: false,
                folding: false,
                lineNumbersMinChars: 3,
                padding: { top: 16, bottom: 24 },
                renderWhitespace: 'none',
                scrollbar: { useShadows: false, verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
              }}
            />
          </div>

          {/* Instruction hint at bottom */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-bg-secondary flex-shrink-0">
            <span className="text-2xs text-text-muted">
              {selectedLines.length === 0
                ? 'Click any line to mark it as suspicious. You can select multiple lines.'
                : `${selectedLines.length} line${selectedLines.length !== 1 ? 's' : ''} selected — explain your reasoning in the panel →`
              }
            </span>
          </div>
        </div>

        {/* Review panel - RIGHT */}
        <div className="w-[340px] flex-shrink-0 flex flex-col bg-bg-secondary overflow-y-auto hide-scrollbar max-lg:hidden">
          <div className="flex-1 p-4 space-y-4">
            {/* Panel header */}
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Your Review</h2>
              <p className="text-xs text-text-muted mt-0.5">You are the reviewer. Explain what you found.</p>
            </div>

            {/* Selected lines */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Selected Lines</p>
              {selectedLines.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-text-muted border border-dashed border-border rounded-lg p-3">
                  <Minus size={12} />
                  No lines selected. Click lines in the editor.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {selectedLines.map((line) => (
                      <SelectedLineTag key={line} line={line} onRemove={toggleLine} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                What did you find?
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="In your own words, explain what is wrong and why. Be specific about the risk."
                rows={8}
                className={clsx(
                  'w-full bg-bg-surface border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted',
                  'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20',
                  'resize-none transition-colors duration-150',
                  explanation.length > 0 ? 'border-border-strong' : 'border-border'
                )}
              />
              <div className="flex justify-between mt-1">
                <span className="text-2xs text-text-muted">
                  {explanation.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                {explanation.length > 0 && explanation.trim().length < 10 && (
                  <span className="text-2xs text-warning">Write more to submit</span>
                )}
              </div>
            </div>

            {/* Hints */}
            <HintPanel
              defectClassId={exercise.defectClassId}
              hintsUsed={hintsUsed}
              onUseHint={useHint}
            />
          </div>

          {/* Submit CTA */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-bg-secondary">
            <Button
              fullWidth
              size="lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
              icon={<ChevronRight size={16} />}
            >
              Submit Review
            </Button>
            {!canSubmit && (
              <p className="text-center text-2xs text-text-muted mt-2">
                {selectedLines.length === 0 ? 'Select at least one line' : 'Add your explanation'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Review panel below editor */}
      <div className="lg:hidden flex-shrink-0 border-t border-border bg-bg-secondary p-4 space-y-3">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Selected Lines</p>
          {selectedLines.length === 0 ? (
            <p className="text-xs text-text-muted">Tap a line above to select it.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedLines.map((line) => (
                <SelectedLineTag key={line} line={line} onRemove={toggleLine} />
              ))}
            </div>
          )}
        </div>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain what you found and why…"
          rows={4}
          className="w-full bg-bg-surface border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
        />
        <Button fullWidth onClick={handleSubmit} disabled={!canSubmit}>
          Submit Review
        </Button>
      </div>
    </div>
  )
}
