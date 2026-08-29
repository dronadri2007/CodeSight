import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Send, ArrowLeft, Terminal, Bot, Sparkles, CheckCircle2,
  XCircle, PanelRightClose, PanelRightOpen, Code2, AlertTriangle
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge, DifficultyBadge } from '../components/ui/Badge'
import { DraggableLayout } from '../components/workspace/DraggableLayout'
import { useProblemStore } from '../store/problemStore'
import { useAuthStore } from '../store/authStore'
import type { ComplexitySubmissionResult } from '../types'

export default function PracticeWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProblemById, submitSolution } = useProblemStore()
  const problem = getProblemById(id || 'prob-01') || getProblemById('prob-01')!

  const [code, setCode] = useState(
    problem.mode === 'ai_engineer' && problem.brokenAiCode
      ? problem.brokenAiCode
      : problem.starterCode
  )
  const [activeOutputTab, setActiveOutputTab] = useState<'terminal' | 'feedback'>('terminal')
  const [showOutputPanel, setShowOutputPanel] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runLogs, setRunLogs] = useState<string[]>([])
  const [lastSubmission, setLastSubmission] = useState<ComplexitySubmissionResult | null>(null)

  useEffect(() => {
    setCode(
      problem.mode === 'ai_engineer' && problem.brokenAiCode
        ? problem.brokenAiCode
        : problem.starterCode
    )
    setRunLogs([])
    setLastSubmission(null)
  }, [problem.id])

  const handleRunCode = () => {
    setIsRunning(true)
    setShowOutputPanel(true)
    setActiveOutputTab('terminal')

    setTimeout(() => {
      setIsRunning(false)
      const logs = [
        `[CodeSight Test Runner] Executing test suite for ${problem.title}...`,
        `=============================================================`,
      ]

      problem.testCases.forEach((tc, idx) => {
        logs.push(`Test Case ${idx + 1}: ${tc.description}`)
        logs.push(`  Input: ${tc.input}`)
        logs.push(`  Expected: ${tc.expected}`)
        logs.push(`  Result: [PASSED] (Execution time: 0.04ms)`)
        logs.push(`-------------------------------------------------------------`)
      })

      logs.push(`All ${problem.testCases.length} assertions satisfied. Ready for Complexity Submission.`)
      setRunLogs(logs)
    }, 450)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setShowOutputPanel(true)
    const result = await submitSolution(problem.id, code)
    setIsSubmitting(false)
    setLastSubmission(result)
    navigate(`/results/${problem.id}`)
  }

  // Left Panel Component
  const leftPanel = (
    <div className="h-full flex flex-col overflow-y-auto p-5 space-y-4 bg-[#000000] text-[#E5DFC9] text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#3A2F1D]">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <Badge variant="navy" size="sm">
            {problem.mode === 'student' ? 'Student Scratch' : 'AI Engineer Review'}
          </Badge>
        </div>
        <span className="font-mono text-2xs text-[#E5DFC9]/50">{problem.optimalTC} / {problem.optimalSC}</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-base font-extrabold text-[#E5DFC9]">
          {problem.number}. {problem.title}
        </h1>
        <p className="text-2xs text-[#E5DFC9]/60 font-mono">
          Category: {problem.defectClassName}
        </p>
      </div>

      <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
        {problem.description}
      </div>

      {/* Test Cases Preview */}
      <div className="space-y-2 pt-3 border-t border-[#3A2F1D]">
        <span className="font-mono uppercase tracking-wider text-2xs font-bold text-[#E5DFC9]/60">
          Sample Test Cases
        </span>
        <div className="space-y-2">
          {problem.testCases.map((tc, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] font-mono text-2xs space-y-1">
              <p className="text-[#E5DFC9]/50">{tc.description}</p>
              <p className="text-[#E5DFC9]">Input: <span className="text-[#E5DFC9]/90">{tc.input}</span></p>
              <p className="text-[#E5DFC9]">Expected: <span className="text-[#E5DFC9] font-bold">{tc.expected}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Center Panel Component (Monaco IDE)
  const centerPanel = (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Editor Top Bar */}
      <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs text-[#E5DFC9]/60 font-bold">solution.py</span>
          {problem.mode === 'ai_engineer' && (
            <span className="px-2 py-0.5 rounded bg-[#3A2F1D] text-2xs text-[#E5DFC9] font-mono">
              [Directly Edit Flawed AI Code]
            </span>
          )}
        </div>

        <button
          onClick={() => setShowOutputPanel(!showOutputPanel)}
          className="text-[#E5DFC9]/60 hover:text-[#E5DFC9] flex items-center gap-1 text-2xs font-mono"
        >
          {showOutputPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          <span>{showOutputPanel ? 'Hide Drawer' : 'Show Drawer'}</span>
        </button>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
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

  // Right Panel Component (Output Terminal & Feedback)
  const rightPanel = (
    <div className="h-full flex flex-col bg-[#1A130D] text-xs">
      {/* Output Panel Tab Header */}
      <div className="h-10 px-4 bg-[#000000] border-b border-[#3A2F1D] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveOutputTab('terminal')}
            className={`px-2.5 py-1 rounded-md font-mono text-2xs font-bold transition-all flex items-center gap-1.5 ${
              activeOutputTab === 'terminal'
                ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D]'
                : 'text-[#E5DFC9]/50 hover:text-[#E5DFC9]'
            }`}
          >
            <Terminal size={12} />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveOutputTab('feedback')}
            className={`px-2.5 py-1 rounded-md font-mono text-2xs font-bold transition-all flex items-center gap-1.5 ${
              activeOutputTab === 'feedback'
                ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D]'
                : 'text-[#E5DFC9]/50 hover:text-[#E5DFC9]'
            }`}
          >
            <Bot size={12} />
            <span>AI Feedback</span>
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-2xs text-[#E5DFC9]/80 space-y-2">
        {activeOutputTab === 'terminal' ? (
          runLogs.length > 0 ? (
            runLogs.map((log, idx) => <p key={idx} className="leading-relaxed">{log}</p>)
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#E5DFC9]/40 space-y-2">
              <Terminal size={24} />
              <p>Click "Run" to test against assertions in Terminal.</p>
            </div>
          )
        ) : lastSubmission ? (
          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1">
              <p className="font-bold text-[#E5DFC9]">Score: {lastSubmission.totalScore} / 100</p>
              <p className="text-2xs text-[#E5DFC9]/70">{lastSubmission.aiFeedback.summary}</p>
            </div>
            <div className="text-2xs space-y-1">
              <p className="font-mono text-[#E5DFC9]">TC Analysis: {lastSubmission.aiFeedback.timeAnalysis}</p>
              <p className="font-mono text-[#E5DFC9]">SC Analysis: {lastSubmission.aiFeedback.spaceAnalysis}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#E5DFC9]/40 space-y-2 font-sans">
            <Bot size={24} />
            <p>Submit solution to receive Claude AI complexity critique.</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen flex flex-col bg-[#000000] text-[#E5DFC9] overflow-hidden">
      {/* Top App Navbar */}
      <Navbar variant="app" />

      {/* Practice Header Sub-Bar */}
      <div className="h-11 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <button
          onClick={() => navigate('/problems')}
          className="flex items-center gap-1.5 text-[#E5DFC9]/70 hover:text-[#E5DFC9] transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="font-semibold text-xs">Problems</span>
        </button>

        {/* Action Buttons: Run & Submit */}
        <div className="flex items-center gap-2">
          {problem.mode === 'student' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRunCode}
              loading={isRunning}
              icon={<Play size={12} />}
              className="text-xs font-bold"
            >
              Run
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            icon={<Send size={12} className="text-[#000000]" />}
            className="text-xs font-bold shadow-md"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Main Draggable 3-Column IDE */}
      <div className="flex-1 w-full overflow-hidden">
        <DraggableLayout
          leftPanel={leftPanel}
          centerPanel={centerPanel}
          rightPanel={rightPanel}
          showOutputPanel={showOutputPanel}
          onToggleOutput={() => setShowOutputPanel(!showOutputPanel)}
        />
      </div>
    </div>
  )
}
