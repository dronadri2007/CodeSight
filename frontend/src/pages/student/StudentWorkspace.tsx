import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Send, RotateCcw, ArrowLeft, CheckCircle2, XCircle,
  Terminal, Sparkles, Clock, AlertCircle, FileCode, Check,
  Maximize2, Minimize2, Lightbulb
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { DraggableLayout } from '../../components/workspace/DraggableLayout'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import { useThemeStore } from '../../store/themeStore'
import { mockProblems } from '../../mock/problems'
import { executeStudentCode, type ExecutionReport, type TestResult } from '../../utils/codeRunner'

export default function StudentWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recordSubmission, updateWeaknessCatchRate } = useAuthStore()
  const { theme } = useThemeStore()

  const problem = mockProblems.find((p) => p.id === id) || mockProblems[0]
  const [code, setCode] = useState(problem.starterCode)
  const [activeTab, setActiveTab] = useState<'terminal' | 'testcases' | 'feedback'>('terminal')
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [executionReport, setExecutionReport] = useState<ExecutionReport | null>(null)
  const [language, setLanguage] = useState(problem.language || 'python')

  const handleReset = () => {
    setCode(problem.starterCode)
    setExecutionReport(null)
  }

  // Execute test cases (Run button)
  const handleRun = async () => {
    setIsRunning(true)
    setActiveTab('terminal')
    try {
      const report = await executeStudentCode(code, problem.testCases, problem.optimalTC, problem.optimalSC)
      setExecutionReport(report)
    } finally {
      setIsRunning(false)
    }
  }

  // Submit code (Submit button)
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const report = await executeStudentCode(code, problem.testCases, problem.optimalTC, problem.optimalSC)
      setExecutionReport(report)

      recordSubmission({
        problemId: problem.id,
        problemTitle: problem.title,
        mode: 'student',
        userCode: code,
        userTC: report.userTC,
        userSC: report.userSC,
        optimalTC: problem.optimalTC,
        optimalSC: problem.optimalSC,
        tcScore: report.tcScore,
        scScore: report.scScore,
        totalScore: report.totalScore,
        pass: report.allPassed,
        aiFeedback: report.aiFeedback,
        timestamp: 'Just now',
      })

      updateWeaknessCatchRate(problem.defectClassId, report.allPassed)

      // Navigate to Results page
      navigate(`/student/results/${problem.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Left Panel: Problem Statement & Constraints
  const leftPanel = (
    <div className="h-full overflow-y-auto p-5 space-y-5 bg-[#000000] text-[#E5DFC9] text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <Badge variant="navy" size="sm">STUDENT PRACTICE</Badge>
        </div>
        <span className="font-mono text-2xs text-[#E5DFC9]/60 font-bold">
          Target: {problem.optimalTC} / {problem.optimalSC}
        </span>
      </div>

      <div>
        <h1 className="text-lg font-extrabold text-[#E5DFC9]">{problem.title}</h1>
        <p className="text-2xs text-[#E5DFC9]/60 font-mono mt-0.5">Topic: {problem.defectClassName}</p>
      </div>

      <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
        {problem.description}
      </div>

      {/* Constraints */}
      <div className="p-3.5 rounded-xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
        <span className="font-mono text-2xs font-bold text-[#E5DFC9] uppercase block">
          Algorithmic Requirements:
        </span>
        <ul className="list-disc list-inside text-2xs text-[#E5DFC9]/70 space-y-1 font-mono">
          <li>Optimal Time Complexity: <strong>{problem.optimalTC}</strong></li>
          <li>Optimal Space Complexity: <strong>{problem.optimalSC}</strong></li>
          <li>Guard against None/Null arguments and out-of-bound indices</li>
        </ul>
      </div>
    </div>
  )

  // Center Panel: Monaco Editor & Controls
  const centerPanel = (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Editor Sub-header */}
      <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs font-mono text-[#E5DFC9]/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-[#E5DFC9]">
            <FileCode size={13} /> solution.{language === 'python' ? 'py' : 'js'}
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#000000] border border-[#3A2F1D] rounded px-2 py-0.5 text-2xs text-[#E5DFC9] focus:outline-none"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ES6)</option>
          </select>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-2xs hover:text-[#E5DFC9] transition-colors"
          title="Reset to starter code"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
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

  // Right Panel: Output & Test Runner Drawer
  const rightPanel = (
    <div className="h-full flex flex-col bg-[#1A130D] text-xs">
      {/* Output Tabs Header */}
      <div className="h-10 px-3 bg-[#000000] border-b border-[#3A2F1D] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded-lg text-2xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D]'
                : 'text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
            }`}
          >
            <Terminal size={12} /> Terminal Output
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-3 py-1 rounded-lg text-2xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'testcases'
                ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D]'
                : 'text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
            }`}
          >
            <CheckCircle2 size={12} /> Test Cases ({problem.testCases.length})
          </button>
        </div>

        {executionReport && (
          <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border ${
            executionReport.allPassed
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
          }`}>
            {executionReport.passCount}/{executionReport.totalCount} Passed
          </span>
        )}
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-2xs">
        {activeTab === 'terminal' ? (
          <div>
            {!executionReport && !isRunning && (
              <p className="text-[#E5DFC9]/50 italic">
                Click <strong>Run</strong> to execute test assertions or <strong>Submit</strong> to evaluate complexity.
              </p>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 text-[#E5DFC9]/70 animate-pulse">
                <Clock size={13} /> Executing test suite against interpreter...
              </div>
            )}

            {executionReport && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                  <div className="flex items-center justify-between text-2xs border-b border-[#3A2F1D] pb-1.5">
                    <span className="font-bold text-[#E5DFC9]">Test Execution Summary:</span>
                    <span>Score: <strong>{executionReport.totalScore}/100</strong></span>
                  </div>
                  <div className="text-3xs text-[#E5DFC9]/70 space-y-1">
                    <p>Time Complexity: <strong className="text-[#E5DFC9]">{executionReport.userTC}</strong> (Optimal: {problem.optimalTC})</p>
                    <p>Space Complexity: <strong className="text-[#E5DFC9]">{executionReport.userSC}</strong> (Optimal: {problem.optimalSC})</p>
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="space-y-2">
                  {executionReport.results.map((res, i) => (
                    <div
                      key={res.testCaseId}
                      className={`p-2.5 rounded-xl border ${
                        res.passed ? 'bg-[#000000] border-emerald-900/40' : 'bg-rose-950/20 border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5 text-2xs">
                          {res.passed ? (
                            <CheckCircle2 size={12} className="text-emerald-400" />
                          ) : (
                            <XCircle size={12} className="text-rose-400" />
                          )}
                          Test Case {i + 1}
                        </span>
                        <span className="text-3xs text-[#E5DFC9]/50">{res.executionTimeMs}ms</span>
                      </div>
                      <p className="text-3xs text-[#E5DFC9]/70">Input: <span className="text-[#E5DFC9]">{res.input}</span></p>
                      <p className="text-3xs text-[#E5DFC9]/70">Expected: <span className="text-[#E5DFC9]">{res.expectedOutput}</span></p>
                      <p className="text-3xs text-[#E5DFC9]/70">Output: <span className={res.passed ? 'text-emerald-300' : 'text-rose-300'}>{res.actualOutput}</span></p>
                      {res.stdout && <p className="text-3xs text-[#E5DFC9]/50 mt-1 whitespace-pre-wrap">{res.stdout}</p>}
                      {res.error && <p className="text-3xs text-rose-400 mt-1">{res.error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Test Cases Tab */
          <div className="space-y-3">
            <div className="flex gap-2">
              {problem.testCases.map((tc, idx) => (
                <button
                  key={tc.id || idx}
                  onClick={() => setSelectedTestCaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg border text-2xs ${
                    selectedTestCaseIdx === idx
                      ? 'bg-[#E5DFC9] text-[#000000] border-[#E5DFC9] font-bold'
                      : 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]/70'
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
              <div>
                <span className="text-3xs text-[#E5DFC9]/50 block">Input:</span>
                <pre className="p-2 rounded bg-[#1A130D] text-[#E5DFC9] text-3xs mt-1 overflow-x-auto">
                  {problem.testCases[selectedTestCaseIdx]?.input}
                </pre>
              </div>
              <div>
                <span className="text-3xs text-[#E5DFC9]/50 block">Expected Output:</span>
                <pre className="p-2 rounded bg-[#1A130D] text-[#E5DFC9] text-3xs mt-1 overflow-x-auto">
                  {problem.testCases[selectedTestCaseIdx]?.expectedOutput || problem.testCases[selectedTestCaseIdx]?.expected}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      {/* Top Workspace Header */}
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/problems')}
            className="flex items-center gap-1.5 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Problems
          </button>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <Badge variant="navy" size="sm">STUDENT SOLVE MODE</Badge>
          <span className="font-bold text-[#E5DFC9] hidden sm:inline">{problem.title}</span>
        </div>

        {/* Action Controls: Run & Submit */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={isRunning}
            icon={<Play size={12} className="text-[#E5DFC9]" />}
            className="text-xs font-semibold"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            icon={<Send size={12} className="text-[#000000]" />}
            className="text-xs font-bold shadow-md"
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
          </Button>
        </div>
      </header>

      {/* Main Draggable IDE Area */}
      <div className="flex-1 w-full overflow-hidden">
        <DraggableLayout
          leftPanel={leftPanel}
          centerPanel={centerPanel}
          rightPanel={rightPanel}
          showOutputPanel={true}
        />
      </div>
    </div>
  )
}
