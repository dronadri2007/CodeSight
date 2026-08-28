import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft, Send, Plus, Trash2, CheckCircle2, AlertTriangle,
  Clock, Shield, Code2, Flag, FileText, ChevronRight, HelpCircle
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockProExercises } from '../../mock/proExercises'
import { defectClasses } from '../../tokens'

interface FindingDraft {
  id: string
  lines: number[]
  riskCategory: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  explanation: string
}

export default function ProReviewWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const exercise = mockProExercises.find((e) => e.id === id) || mockProExercises[0]

  const [selectedLines, setSelectedLines] = useState<number[]>([66, 67])
  const [findings, setFindings] = useState<FindingDraft[]>([
    {
      id: 'f-init',
      lines: [66, 67],
      riskCategory: 'Auth & Access Control',
      severity: 'Medium',
      explanation: 'Line 67 uses standard == string comparison for password hashes. This creates a timing vulnerability.',
    },
  ])

  // Current draft finding form
  const [draftSeverity, setDraftSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High')
  const [draftCategory, setDraftCategory] = useState<string>('Auth & Access Control')
  const [draftExplanation, setDraftExplanation] = useState<string>('')

  const toggleLineSelection = (lineNum: number) => {
    setSelectedLines((prev) =>
      prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum].sort((a, b) => a - b)
    )
  }

  const handleAddFinding = () => {
    if (selectedLines.length === 0 || draftExplanation.trim().length === 0) return
    const newFinding: FindingDraft = {
      id: `f-${Date.now()}`,
      lines: [...selectedLines],
      riskCategory: draftCategory,
      severity: draftSeverity,
      explanation: draftExplanation,
    }
    setFindings((prev) => [...prev, newFinding])
    setDraftExplanation('')
  }

  const handleRemoveFinding = (findingId: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== findingId))
  }

  const handleSubmitReview = () => {
    navigate(`/pro/results/${exercise.id}`)
  }

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Workspace Header */}
      <div className="h-12 border-b border-navy-border bg-navy-surface px-6 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pro/dashboard')}
            className="flex items-center gap-1.5 text-slate hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-4 w-px bg-navy-border" />
          <span className="font-mono text-white truncate max-w-[200px] sm:max-w-md">
            {exercise.repo}
          </span>
          <Badge variant="navy" size="sm">{exercise.linesOfCode} lines</Badge>
          <DifficultyBadge difficulty={exercise.difficulty} />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xs text-slate hidden sm:inline font-mono">
            {findings.length} finding{findings.length !== 1 ? 's' : ''} recorded
          </span>
          <Button
            size="sm"
            onClick={handleSubmitReview}
            icon={<Send size={12} />}
            className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
          >
            Submit Review
          </Button>
        </div>
      </div>

      {/* Main Split: Monaco Code Explorer + Findings Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left / Center: Monaco Large Code Viewer */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-navy-border bg-navy-midnight">
          <div className="flex items-center justify-between px-4 py-2 bg-navy-surface/80 border-b border-navy-border text-xs text-slate">
            <div className="flex items-center gap-2 font-mono">
              <Code2 size={13} className="text-aqua" />
              <span>{exercise.repo}</span>
            </div>
            <span className="text-2xs">Click line numbers to tag review findings</span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              defaultLanguage="python"
              theme="vs-dark"
              value={exercise.code}
              options={{
                readOnly: true,
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                lineHeight: 22,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                renderWhitespace: 'none',
                padding: { top: 16, bottom: 20 },
              }}
              onMount={(editor) => {
                editor.onMouseDown((e) => {
                  if (e.target.position) {
                    toggleLineSelection(e.target.position.lineNumber)
                  }
                })
              }}
            />
          </div>
        </div>

        {/* Right: Review Findings & Risk Inspector Panel */}
        <div className="w-full lg:w-[440px] bg-navy-surface flex flex-col min-h-0 border-t lg:border-t-0 border-navy-border">
          <div className="p-4 border-b border-navy-border bg-navy-midnight/80 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Shield size={14} className="text-aqua" /> Review Findings Inspector
            </h3>
            <Badge variant="navy" size="sm">{findings.length} Saved</Badge>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-xs">
            {/* Create New Finding */}
            <div className="p-4 rounded-xl bg-navy-midnight border border-navy-border space-y-3.5">
              <span className="text-2xs font-mono uppercase tracking-wider text-aqua font-semibold block">
                TAG NEW SUSPECT FINDING
              </span>

              <div>
                <label className="text-2xs text-slate uppercase block mb-1">Tagged Lines</label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                  {selectedLines.length === 0 ? (
                    <span className="text-2xs text-slate italic">Click lines in code editor to tag</span>
                  ) : (
                    selectedLines.map((l) => (
                      <span
                        key={l}
                        onClick={() => toggleLineSelection(l)}
                        className="px-2 py-0.5 rounded bg-aqua/20 border border-aqua/40 text-aqua-bright font-mono text-2xs cursor-pointer hover:bg-danger/20 hover:text-danger hover:border-danger transition-colors"
                      >
                        L{l} ✕
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-2xs text-slate uppercase block mb-1">Risk Category</label>
                  <select
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    className="w-full p-2 bg-navy-surface border border-navy-border rounded-lg text-2xs text-white focus:outline-none focus:border-aqua"
                  >
                    {defectClasses.map((cls) => (
                      <option key={cls.id} value={cls.label}>{cls.shortLabel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-2xs text-slate uppercase block mb-1">Severity</label>
                  <select
                    value={draftSeverity}
                    onChange={(e) => setDraftSeverity(e.target.value as any)}
                    className="w-full p-2 bg-navy-surface border border-navy-border rounded-lg text-2xs text-white focus:outline-none focus:border-aqua"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-2xs text-slate uppercase block mb-1">Rationale / Explanation</label>
                <textarea
                  value={draftExplanation}
                  onChange={(e) => setDraftExplanation(e.target.value)}
                  placeholder="Explain why this line poses a risk and describe the failure mode..."
                  rows={3}
                  className="w-full p-2.5 bg-navy-surface border border-navy-border rounded-lg text-2xs text-white placeholder-slate focus:outline-none focus:border-aqua resize-none"
                />
              </div>

              <Button
                fullWidth
                size="sm"
                variant="dark"
                disabled={selectedLines.length === 0 || draftExplanation.trim().length === 0}
                onClick={handleAddFinding}
                icon={<Plus size={13} />}
                className="bg-aqua/20 text-aqua-bright hover:bg-aqua/30 border-aqua/40"
              >
                Add Finding
              </Button>
            </div>

            {/* List of Logged Findings */}
            <div className="space-y-2.5">
              <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold block">
                LOGGED FINDINGS ({findings.length})
              </span>

              {findings.map((f, idx) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-navy-midnight border border-navy-border space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={f.severity === 'Critical' ? 'danger' : f.severity === 'High' ? 'warning' : 'navy'}
                        size="sm"
                      >
                        {f.severity}
                      </Badge>
                      <span className="text-xs font-bold text-white">{f.riskCategory}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFinding(f.id)}
                      className="text-slate hover:text-danger transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-2xs text-slate leading-relaxed">{f.explanation}</p>
                  <span className="text-2xs font-mono text-aqua block">
                    Lines: {f.lines.map((l) => `L${l}`).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit CTA */}
          <div className="p-4 border-t border-navy-border bg-navy-midnight/80">
            <Button
              fullWidth
              size="lg"
              onClick={handleSubmitReview}
              iconRight={<ChevronRight size={16} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Submit Professional Review ({findings.length} Findings)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
