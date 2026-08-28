import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Play, Send, ArrowLeft, CheckCircle2, XCircle, Clock,
  Sparkles, Terminal, Code2, AlertTriangle, Lightbulb, ChevronRight
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockStudentExercises } from '../../mock/studentExercises'

export default function StudentWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const exercise = mockStudentExercises.find((e) => e.id === id) || mockStudentExercises[0]

  const [code, setCode] = useState(exercise.starterCode)
  const [activeTab, setActiveTab] = useState<'description' | 'tests' | 'hints'>('description')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[] | null>(null)
  const [hintsRevealed, setHintsRevealed] = useState(0)

  const handleRunCode = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      // Check if user implemented defensive none-check
      const hasDefensiveCheck = code.includes('if row is None') || code.includes('if not row') || code.includes('UserNotFoundError')
      setTestResults([
        { passed: true, message: 'Test Case 1 (Valid User): PASSED (dict returned)' },
        {
          passed: hasDefensiveCheck,
          message: hasDefensiveCheck
            ? 'Test Case 2 (Missing User): PASSED (UserNotFoundError caught safely)'
            : 'Test Case 2 (Missing User): FAILED (TypeError: NoneType object is not subscriptable on row[0])'
        },
        { passed: true, message: 'Test Case 3 (Empty input validation): PASSED' },
      ])
      setActiveTab('tests')
    }, 600)
  }

  const handleSubmitForAnalysis = () => {
    // Navigate to student analysis results
    navigate(`/student/analysis/${exercise.id}`)
  }

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Workspace Top Bar */}
      <div className="h-12 border-b border-navy-border bg-navy-surface px-6 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/practice')}
            className="flex items-center gap-1.5 text-slate hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Practice Library</span>
          </button>
          <div className="h-4 w-px bg-navy-border" />
          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-md">
            {exercise.title}
          </span>
          <DifficultyBadge difficulty={exercise.difficulty} />
          <Badge variant="navy" size="sm">{exercise.language}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="dark"
            onClick={handleRunCode}
            loading={isRunning}
            icon={<Play size={12} />}
          >
            Run Tests
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitForAnalysis}
            icon={<Send size={12} />}
            className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
          >
            Analyze My Code
          </Button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left / Center: Monaco Code-Writing Editor */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-navy-border bg-navy-midnight">
          <div className="flex items-center justify-between px-4 py-2 bg-navy-surface/80 border-b border-navy-border text-xs text-slate">
            <div className="flex items-center gap-2 font-mono">
              <Code2 size={13} className="text-aqua" />
              <span>solution.py</span>
            </div>
            <span className="text-2xs">Write your solution below</span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                renderWhitespace: 'none',
                padding: { top: 16, bottom: 20 },
              }}
            />
          </div>
        </div>

        {/* Right: Problem Specs / Test Execution / AI Hints */}
        <div className="w-full lg:w-[420px] bg-navy-surface flex flex-col min-h-0 border-t lg:border-t-0 border-navy-border">
          {/* Tabs */}
          <div className="flex items-center border-b border-navy-border bg-navy-midnight/60 text-xs font-semibold text-slate">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'description' ? 'border-aqua text-white' : 'border-transparent hover:text-white'
              }`}
            >
              Challenge
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'tests' ? 'border-aqua text-white' : 'border-transparent hover:text-white'
              }`}
            >
              Test Runner {testResults && '•'}
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'hints' ? 'border-aqua text-white' : 'border-transparent hover:text-white'
              }`}
            >
              Hints ({hintsRevealed}/2)
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{exercise.title}</h3>
                  <p className="text-slate leading-relaxed whitespace-pre-line">
                    {exercise.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-2xs font-mono uppercase tracking-wider text-aqua font-semibold block">
                    TEST SCENARIOS
                  </span>
                  {exercise.testCases.map((tc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-navy-midnight border border-navy-border space-y-1">
                      <div className="flex justify-between font-mono text-slate">
                        <span>Case #{i + 1}:</span>
                        <span className="text-white">{tc.input}</span>
                      </div>
                      <p className="text-slate text-2xs">{tc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-3">
                <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold block">
                  EXECUTION OUTPUT
                </span>
                {!testResults ? (
                  <div className="p-6 text-center text-slate space-y-2 border border-dashed border-navy-border rounded-xl">
                    <Terminal size={20} className="mx-auto text-slate" />
                    <p>Click "Run Tests" to execute your solution against test cases.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                          r.passed
                            ? 'bg-success/10 border-success/30 text-success'
                            : 'bg-danger/10 border-danger/30 text-danger'
                        }`}
                      >
                        {r.passed ? <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" /> : <XCircle size={15} className="mt-0.5 flex-shrink-0" />}
                        <span className="font-mono leading-relaxed">{r.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold">
                    GUIDANCE HINTS
                  </span>
                  <span className="text-2xs text-warning">Minor score impact on reveal</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border space-y-2">
                  <p className="text-white font-semibold">Hint 1: Defensive Return Validation</p>
                  {hintsRevealed >= 1 ? (
                    <p className="text-slate leading-relaxed">
                      "Database fetch methods like <code className="text-aqua">cursor.fetchone()</code> return <code className="text-aqua">None</code> when no row matches the query. Always verify <code className="text-aqua">if row is None:</code> before accessing index <code className="text-aqua">row[0]</code>."
                    </p>
                  ) : (
                    <Button size="sm" variant="dark" onClick={() => setHintsRevealed(1)}>
                      Reveal Hint 1 (-10% impact)
                    </Button>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border space-y-2">
                  <p className="text-white font-semibold">Hint 2: Custom Exception Types</p>
                  {hintsRevealed >= 2 ? (
                    <p className="text-slate leading-relaxed">
                      "Define a clean custom exception class like <code className="text-aqua">class UserNotFoundError(Exception): pass</code> and raise it directly to give callers explicit error propagation."
                    </p>
                  ) : (
                    <Button size="sm" variant="dark" disabled={hintsRevealed < 1} onClick={() => setHintsRevealed(2)}>
                      Reveal Hint 2 (-25% impact)
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit CTA */}
          <div className="p-4 border-t border-navy-border bg-navy-midnight/80">
            <Button
              fullWidth
              size="lg"
              onClick={handleSubmitForAnalysis}
              iconRight={<ChevronRight size={16} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Submit &amp; Analyze My Solution
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
