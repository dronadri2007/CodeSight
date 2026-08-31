import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { Send, ArrowLeft, Shield, FileCode } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DraggableLayout } from '../../components/workspace/DraggableLayout'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import {
  getExerciseFile,
  submitGrade,
  getSessionId,
  type ExerciseFile,
  type GradeTelemetry,
} from '../../api'

export default function ProDebugWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recordSubmission, updateWeaknessCatchRate, hasPassedPromotionalTest } = useAuthStore()
  const { theme } = useThemeStore()

  const [file, setFile] = useState<ExerciseFile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [findingTitle, setFindingTitle] = useState('')
  const [findingExplanation, setFindingExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // --- integrity telemetry capture ---------------------------------
  const tel = useRef({ startedAt: Date.now(), paste_count: 0, pasted_chars: 0, keystroke_count: 0, tab_blur_count: 0, tab_blur_ms: 0 })
  const blurStart = useRef<number | null>(null)
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) blurStart.current = Date.now()
      else if (blurStart.current) {
        tel.current.tab_blur_count += 1
        tel.current.tab_blur_ms += Date.now() - blurStart.current
        blurStart.current = null
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  const onExplKeyDown = useCallback(() => { tel.current.keystroke_count += 1 }, [])
  const onExplPaste = useCallback((e: React.ClipboardEvent) => {
    tel.current.paste_count += 1
    tel.current.pasted_chars += (e.clipboardData?.getData('text') || '').length
  }, [])

  useEffect(() => {
    if (!hasPassedPromotionalTest) navigate('/pro/entrance-test')
  }, [hasPassedPromotionalTest, navigate])

  useEffect(() => {
    if (!id) return
    let dead = false
    setFile(null); setLoadError(null)
    tel.current = { startedAt: Date.now(), paste_count: 0, pasted_chars: 0, keystroke_count: 0, tab_blur_count: 0, tab_blur_ms: 0 }
    getExerciseFile(id)
      .then((f) => { if (!dead) setFile(f) })
      .catch((e) => { if (!dead) setLoadError(e instanceof Error ? e.message : 'failed to load') })
    return () => { dead = true }
  }, [id])

  const selectedLines = selectedText
    .split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n))

  const handleSubmit = async () => {
    if (!id || !file) return
    setIsSubmitting(true); setSubmitError(null)
    const t = tel.current
    const telemetry: GradeTelemetry = {
      time_to_submit_ms: Date.now() - t.startedAt,
      paste_count: t.paste_count,
      pasted_chars: t.pasted_chars,
      keystroke_count: t.keystroke_count,
      tab_blur_count: t.tab_blur_count,
      tab_blur_ms: t.tab_blur_ms,
    }
    const explanation = [findingTitle.trim(), findingExplanation.trim()].filter(Boolean).join(' — ')
    try {
      const grade = await submitGrade({ exerciseId: id, selectedLines, explanation, hintsUsed: 0, telemetry })
      const score = Math.round(grade.score_after_hints * 100)
      recordSubmission({
        problemId: id,
        problemTitle: file.title,
        mode: 'ai_engineer',
        userCode: file.code,
        userTC: '-', userSC: '-', optimalTC: '-', optimalSC: '-',
        tcScore: Math.round(grade.localisation.score * 50),
        scScore: Math.round(grade.explanation.score * 50),
        totalScore: score,
        pass: score >= 70,
        aiFeedback: {
          summary: grade.explanation.note,
          timeAnalysis: grade.teaching.where,
          spaceAnalysis: grade.teaching.why_missed,
          optimizationGuidance: [grade.teaching.pattern],
          recommendedPattern: grade.defect_class,
        },
        timestamp: 'Just now',
      })
      updateWeaknessCatchRate(grade.defect_class, grade.localisation.score >= 0.7)
      navigate(`/pro/results/${id}`, {
        state: { grade, exerciseTitle: file.title, defectClass: grade.defect_class, selectedLines },
      })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'submission failed')
      setIsSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex items-center justify-center p-8">
        <Card className="p-8 bg-[#1A130D] border-red-900/40 text-center space-y-3 max-w-md">
          <h2 className="text-sm font-bold text-red-400">Couldn't load this exercise</h2>
          <p className="text-2xs text-[#E5DFC9]/60 font-mono">{loadError}</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/pro/problems')}>Back to Reviews</Button>
        </Card>
      </div>
    )
  }
  if (!file) {
    return (
      <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex items-center justify-center">
        <p className="text-xs text-[#E5DFC9]/50 font-mono animate-pulse">Loading exercise…</p>
      </div>
    )
  }

  const leftPanel = (
    <div className="h-full overflow-y-auto p-5 space-y-4 bg-[#000000] text-[#E5DFC9] text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
        <span className="text-3xs px-2 py-0.5 rounded bg-[#E5DFC9] text-[#000000] font-bold font-mono uppercase">DEBUG / REVIEW</span>
        <span className="font-mono text-2xs text-[#E5DFC9]/60">{file.defect_class} · {file.difficulty}</span>
      </div>
      <div>
        <h1 className="text-base font-extrabold text-[#E5DFC9]">{file.title}</h1>
        <p className="text-2xs text-[#E5DFC9]/60 font-mono mt-0.5">{file.filename} · {file.line_count} lines</p>
      </div>
      <div className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] space-y-1 font-mono text-2xs text-[#E5DFC9]/70">
        <span className="font-bold text-[#E5DFC9] block">Review instructions</span>
        <p>1. Read the file in the editor.</p>
        <p>2. Enter the line number(s) of the defect (comma-separated).</p>
        <p>3. Name the defect and explain why it is exploitable / what it breaks.</p>
        <p>4. Submit — you get a localisation + explanation score and teaching feedback.</p>
      </div>
    </div>
  )

  const centerPanel = (
    <div className="h-full flex flex-col bg-[#000000]">
      <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs font-mono text-[#E5DFC9]/70">
        <span className="flex items-center gap-1.5 font-bold text-[#E5DFC9]"><FileCode size={13} /> {file.filename}</span>
        <span className="text-2xs text-[#E5DFC9]/50">read-only · {file.source}</span>
      </div>
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language={file.language || 'python'}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          value={file.code}
          options={{
            readOnly: true,
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
    </div>
  )

  const rightPanel = (
    <div className="h-full flex flex-col bg-[#1A130D] text-xs p-5 space-y-4 overflow-y-auto">
      <div className="pb-2 border-b border-[#3A2F1D] flex items-center justify-between">
        <span className="font-bold text-xs text-[#E5DFC9] flex items-center gap-1.5"><Shield size={14} /> Review Box</span>
        <span className="text-2xs text-[#E5DFC9]/50 font-mono">no answers pre-revealed</span>
      </div>

      <div className="space-y-1.5 font-mono text-2xs">
        <label className="text-[#E5DFC9]/70 font-bold block">Defect line(s):</label>
        <input
          type="text" placeholder="e.g. 2, 3"
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)}
          className="w-full p-2 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none"
        />
        <span className="text-3xs text-[#E5DFC9]/40">leave blank if you believe the file is clean</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">What is the defect?</label>
        <input
          type="text" value={findingTitle}
          onChange={(e) => setFindingTitle(e.target.value)}
          onKeyDown={onExplKeyDown}
          placeholder="e.g. SQL injection via string interpolation"
          className="w-full p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9]"
        />
      </div>

      <div className="space-y-1.5 flex-1 flex flex-col">
        <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">Why is it a problem, and how would you fix it?</label>
        <textarea
          rows={7} value={findingExplanation}
          onChange={(e) => setFindingExplanation(e.target.value)}
          onKeyDown={onExplKeyDown}
          onPaste={onExplPaste}
          placeholder="A crafted value like ' OR '1'='1 changes the query… bind it as a parameter instead."
          className="w-full p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9] resize-none flex-1"
        />
      </div>

      {submitError && <p className="text-2xs text-red-300 font-mono">{submitError}</p>}

      <Button
        fullWidth size="md" variant="gold"
        onClick={handleSubmit}
        disabled={isSubmitting || !findingExplanation.trim()}
        icon={<Send size={13} className="text-[#000000]" />}
        className="font-bold text-xs shadow-lg"
      >
        {isSubmitting ? 'Grading review…' : 'SUBMIT REVIEW'}
      </Button>
      <span className="text-3xs text-[#E5DFC9]/40 font-mono">session {getSessionId().slice(0, 12)}</span>
    </div>
  )

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pro/problems')} className="flex items-center gap-1 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]">
            <ArrowLeft size={14} /> Back to Reviews
          </button>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <span className="font-bold text-[#E5DFC9] hidden sm:inline">{file.title}</span>
        </div>
        <Button
          size="sm" variant="gold"
          onClick={handleSubmit}
          disabled={isSubmitting || !findingExplanation.trim()}
          icon={<Send size={12} className="text-[#000000]" />}
          className="text-xs font-bold shadow-md"
        >
          Submit Review
        </Button>
      </header>

      <div className="flex-1 w-full overflow-hidden">
        <DraggableLayout leftPanel={leftPanel} centerPanel={centerPanel} rightPanel={rightPanel} showOutputPanel={true} />
      </div>
    </div>
  )
}
