import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Send, RotateCcw, ArrowLeft, Shield, AlertTriangle, CheckCircle2,
  HelpCircle, Eye, FileCode, Check, MessageSquare
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { DraggableLayout } from '../../components/workspace/DraggableLayout'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { mockProblems } from '../../mock/problems'

export default function ProDebugWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recordSubmission, updateWeaknessCatchRate } = useAuthStore()
  const { theme } = useThemeStore()

  const problem = mockProblems.find((p) => p.id === id) || mockProblems[1]
  const [code, setCode] = useState(problem.starterCode || problem.solutionCode)
  const [selectedLines, setSelectedLines] = useState<number[]>([14, 15])
  const [findingTitle, setFindingTitle] = useState('Unchecked return value causing NoneType subscript error')
  const [findingExplanation, setFindingExplanation] = useState(
    'The cursor fetch operation can return None if the user does not exist. Directly subscripting row[0] triggers an unhandled TypeError in production.'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleLine = (lineNum: number) => {
    if (selectedLines.includes(lineNum)) {
      setSelectedLines(selectedLines.filter((l) => l !== lineNum))
    } else {
      setSelectedLines([...selectedLines, lineNum].sort((a, b) => a - b))
    }
  }

  const handleSubmitReview = () => {
    setIsSubmitting(true)

    // Evaluate Review Localization & Explanation against Ground Truth
    const groundTruth = problem.buggyLines || [14, 15]
    const matchedLines = selectedLines.filter((l) => groundTruth.includes(l))
    const falsePositives = selectedLines.filter((l) => !groundTruth.includes(l)).length

    const localizationScore = Math.min(
      100,
      Math.round((matchedLines.length / Math.max(1, groundTruth.length)) * 100)
    )

    const hasRelevantKeyword = findingExplanation.toLowerCase().includes(problem.defectClassId.toLowerCase()) ||
      findingExplanation.toLowerCase().includes('none') ||
      findingExplanation.toLowerCase().includes('error') ||
      findingExplanation.toLowerCase().includes('null') ||
      findingExplanation.toLowerCase().includes('race') ||
      findingExplanation.toLowerCase().includes('lock') ||
      findingExplanation.toLowerCase().includes('injection')

    const explanationScore = hasRelevantKeyword ? 90 : 50
    const totalScore = Math.max(0, Math.round(localizationScore * 0.6 + explanationScore * 0.4 - falsePositives * 10))

    recordSubmission({
      problemId: problem.id,
      problemTitle: problem.title,
      mode: 'ai_engineer',
      userCode: code,
      userTC: problem.optimalTC,
      userSC: problem.optimalSC,
      optimalTC: problem.optimalTC,
      optimalSC: problem.optimalSC,
      tcScore: Math.round(localizationScore * 0.5),
      scScore: Math.round(explanationScore * 0.5),
      totalScore,
      pass: totalScore >= 70,
      aiFeedback: {
        summary: `Review evaluated with ${localizationScore}% localization and ${explanationScore}% explanation accuracy.`,
        timeAnalysis: `Ground truth defect lines: ${groundTruth.join(', ')}. Flagged lines: ${selectedLines.join(', ')}.`,
        spaceAnalysis: `False Positives: ${falsePositives}.`,
        optimizationGuidance: [
          'Ensure you inspect exception paths and database cursor nullability.',
        ],
        recommendedPattern: problem.defectClassName,
      },
      timestamp: 'Just now',
    })

    updateWeaknessCatchRate(problem.defectClassId, totalScore >= 70)

    navigate(`/pro/results/${problem.id}`, {
      state: {
        score: totalScore,
        localizationScore,
        explanationScore,
        falsePositives,
        selectedLines,
        groundTruth,
        findingTitle,
        findingExplanation,
      },
    })
  }

  // Left/Main Panel: Monaco Code Editor
  const leftPanel = (
    <div className="h-full overflow-y-auto p-5 space-y-4 bg-[#000000] text-[#E5DFC9] text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <Badge variant="gold" size="sm">DEBUG / REVIEW</Badge>
        </div>
        <span className="font-mono text-2xs text-[#E5DFC9]/60">{problem.defectClassName}</span>
      </div>

      <div>
        <h1 className="text-base font-extrabold text-[#E5DFC9]">{problem.title}</h1>
        <p className="text-2xs text-[#E5DFC9]/60 font-mono mt-0.5">Repo: {problem.repo || 'codesight/production-api'}</p>
      </div>

      <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
        {problem.description}
      </div>

      <div className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] space-y-1 font-mono text-2xs text-[#E5DFC9]/70">
        <span className="font-bold text-[#E5DFC9] block">Review Instructions:</span>
        <p>1. Read the code carefully in the editor.</p>
        <p>2. Tag suspicious lines and document the root cause.</p>
        <p>3. Submit review to receive localization &amp; explanation score.</p>
      </div>
    </div>
  )

  const centerPanel = (
    <div className="h-full flex flex-col bg-[#000000]">
      <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs font-mono text-[#E5DFC9]/70">
        <span className="flex items-center gap-1.5 font-bold text-[#E5DFC9]">
          <FileCode size={13} /> candidate_pr.{problem.language === 'python' ? 'py' : 'js'}
        </span>
        <span className="text-2xs text-[#E5DFC9]/50">[AI Generated Pull Request]</span>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language={problem.language || 'python'}
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

  // Right Panel: Review Box
  const rightPanel = (
    <div className="h-full flex flex-col bg-[#1A130D] text-xs p-5 space-y-4 overflow-y-auto">
      <div className="pb-2 border-b border-[#3A2F1D] flex items-center justify-between">
        <span className="font-bold text-xs text-[#E5DFC9] flex items-center gap-1.5">
          <Shield size={14} className="text-[#E5DFC9]" /> Review Box
        </span>
        <span className="text-2xs text-[#E5DFC9]/50 font-mono">No Answers Pre-Revealed</span>
      </div>

      {/* Selected Lines Indicator */}
      <div className="space-y-1.5 font-mono text-2xs">
        <label className="text-[#E5DFC9]/70 font-bold block">
          Flagged Lines:
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="e.g. 14, 15"
            value={selectedLines.join(', ')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
              setSelectedLines(parsed)
            }}
            className="w-full p-2 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Finding Title Input */}
      <div className="space-y-1.5">
        <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
          What is wrong with this code?
        </label>
        <input
          type="text"
          value={findingTitle}
          onChange={(e) => setFindingTitle(e.target.value)}
          placeholder="e.g. Race condition in account transfer"
          className="w-full p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9]"
        />
      </div>

      {/* Explanation Textarea */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
          Explain why it is a problem and what behavior it could cause:
        </label>
        <textarea
          rows={6}
          value={findingExplanation}
          onChange={(e) => setFindingExplanation(e.target.value)}
          placeholder="Two concurrent requests can update the balance without proper locking..."
          className="w-full p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9] resize-none flex-1"
        />
      </div>

      <Button
        fullWidth
        size="md"
        variant="gold"
        onClick={handleSubmitReview}
        disabled={isSubmitting || selectedLines.length === 0 || !findingTitle.trim()}
        icon={<Send size={13} className="text-[#000000]" />}
        className="font-bold text-xs shadow-lg"
      >
        {isSubmitting ? 'Evaluating Review...' : 'SUBMIT REVIEW'}
      </Button>
    </div>
  )

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pro/problems')}
            className="flex items-center gap-1 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]"
          >
            <ArrowLeft size={14} /> Back to Reviews
          </button>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <Badge variant="gold" size="sm">PROFESSIONAL DEBUG MODE</Badge>
          <span className="font-bold text-[#E5DFC9] hidden sm:inline">{problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="gold"
            onClick={handleSubmitReview}
            disabled={isSubmitting || selectedLines.length === 0 || !findingTitle.trim()}
            icon={<Send size={12} className="text-[#000000]" />}
            className="text-xs font-bold shadow-md"
          >
            Submit Review
          </Button>
        </div>
      </header>

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
