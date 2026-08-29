import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, AlertTriangle, CheckCircle2, FileCode, Shield,
  HelpCircle, Eye, ArrowRight, ArrowLeft, Lock, Sparkles
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'

const PROMOTIONAL_CODE = [
  '# Flask API Authentication Endpoint - AI-Generated Candidate',
  'import sqlite3',
  'from flask import Flask, request, jsonify',
  '',
  'app = Flask(__name__)',
  '',
  '@app.route("/api/login", methods=["POST"])',
  'def login():',
  '    data = request.get_json() or {}',
  '    username = data.get("username", "")',
  '    password = data.get("password", "")',
  '',
  '    # Connect to database and verify credentials',
  '    conn = sqlite3.connect("users.db")',
  '    cursor = conn.cursor()',
  '',
  '    # Query user record directly from payload parameters',
  '    query = f"SELECT id, role FROM users WHERE username = \'{username}\' AND password = \'{password}\'"',
  '    cursor.execute(query)',
  '    user = cursor.fetchone()',
  '',
  '    if user:',
  '        return jsonify({"status": "success", "user_id": user[0], "role": user[1]})',
  '    return jsonify({"status": "error", "message": "Invalid credentials"}), 401',
]

export default function ProPromotionalTest() {
  const navigate = useNavigate()
  const { setPassedPromotionalTest } = useAuthStore()

  const [selectedLines, setSelectedLines] = useState<number[]>([])
  const [findingTitle, setFindingTitle] = useState('')
  const [findingExplanation, setFindingExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleLine = (lineNum: number) => {
    if (selectedLines.includes(lineNum)) {
      setSelectedLines(selectedLines.filter((l) => l !== lineNum))
    } else {
      setSelectedLines([...selectedLines, lineNum].sort((a, b) => a - b))
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Evaluate localization: lines 18 and 19 are the query string and execute lines
    const targetLines = [18, 19]
    const matched = selectedLines.filter((l) => targetLines.includes(l))
    const falsePositives = selectedLines.filter((l) => !targetLines.includes(l)).length

    const hasRelevantKeyword = findingExplanation.toLowerCase().includes('sql') ||
      findingExplanation.toLowerCase().includes('injection') ||
      findingExplanation.toLowerCase().includes('parameter') ||
      findingExplanation.toLowerCase().includes('format') ||
      findingTitle.toLowerCase().includes('sql') ||
      findingTitle.toLowerCase().includes('injection')

    let localizationScore = 0
    if (matched.length === 2 && falsePositives === 0) {
      localizationScore = 100
    } else if (matched.length > 0 && falsePositives <= 2) {
      localizationScore = 80
    } else if (matched.length > 0) {
      localizationScore = 50
    } else {
      localizationScore = 20
    }

    const explanationScore = hasRelevantKeyword ? 90 : 40
    const totalScore = Math.max(0, Math.round(localizationScore * 0.6 + explanationScore * 0.4 - falsePositives * 10))
    const passed = totalScore >= 60

    if (passed) {
      setPassedPromotionalTest(true)
    }

    navigate('/pro/promotional-result', {
      state: {
        score: totalScore,
        localizationScore,
        explanationScore,
        falsePositives,
        passed,
        selectedLines,
        findingTitle,
        findingExplanation,
      },
    })
  }

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9] select-none">
      {/* Header with Promotional Assessment Requirement Notice */}
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/role-select')}
            className="flex items-center gap-1 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]"
          >
            <ArrowLeft size={14} /> Back to Track Selection
          </button>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <Badge variant="gold" size="sm">MANDATORY PROMOTIONAL ASSESSMENT</Badge>
          <span className="font-bold text-[#E5DFC9] hidden sm:inline">Review AI Code to Unlock Levels</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="gold"
            onClick={handleSubmit}
            disabled={selectedLines.length === 0 || !findingTitle.trim()}
            icon={<Send size={12} className="text-[#000000]" />}
            className="font-bold text-xs shadow-md"
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
          </Button>
        </div>
      </header>

      {/* Main Review Split Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left: Code Viewer with Click-to-Highlight Lines */}
        <div className="md:col-span-7 h-full overflow-y-auto bg-[#000000] border-r border-[#3A2F1D] p-5 font-mono text-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3A2F1D] text-2xs text-[#E5DFC9]/60">
            <span>auth_endpoint.py [AI Generated Candidate]</span>
            <span className="text-[#E5DFC9]">Click line numbers to flag defects</span>
          </div>

          <div className="space-y-1">
            {PROMOTIONAL_CODE.map((line, idx) => {
              const lineNum = idx + 1
              const isSelected = selectedLines.includes(lineNum)
              return (
                <div
                  key={lineNum}
                  onClick={() => toggleLine(lineNum)}
                  className={`flex items-center gap-3 px-2 py-1 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#3A2F1D] border-l-2 border-[#E5DFC9] text-[#E5DFC9] font-bold shadow-sm'
                      : 'hover:bg-[#1A130D] text-[#E5DFC9]/80'
                  }`}
                >
                  <span className={`w-6 text-right select-none text-2xs ${
                    isSelected ? 'text-[#E5DFC9] font-bold' : 'text-[#E5DFC9]/35'
                  }`}>
                    {lineNum}
                  </span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Review Finding Box */}
        <div className="md:col-span-5 h-full overflow-y-auto bg-[#1A130D] p-6 space-y-6 text-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="gold" size="sm">ENTRANCE ASSESSMENT</Badge>
              </div>
              <h2 className="text-base font-bold text-[#E5DFC9]">
                Identify the Vulnerability in this AI Code
              </h2>
              <p className="text-2xs text-[#E5DFC9]/70 mt-0.5">
                Pass this review with ≥ 60% accuracy to unlock Beginner, Intermediate, and Pro review levels.
              </p>
            </div>

            {/* Selected Lines Tag */}
            <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1 font-mono text-2xs">
              <span className="text-[#E5DFC9]/60">Flagged Lines:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedLines.length > 0 ? (
                  selectedLines.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] font-bold">
                      Line {l}
                    </span>
                  ))
                ) : (
                  <span className="text-[#E5DFC9]/40 italic">Click on line numbers in the left editor</span>
                )}
              </div>
            </div>

            {/* Finding Title Input */}
            <div className="space-y-1.5">
              <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
                Defect Title / Finding:
              </label>
              <input
                type="text"
                value={findingTitle}
                onChange={(e) => setFindingTitle(e.target.value)}
                placeholder="e.g. SQL Injection via string formatting"
                className="w-full p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9]"
              />
            </div>

            {/* Explanation Textarea */}
            <div className="space-y-1.5">
              <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
                Explain why it is a problem and what impact it has:
              </label>
              <textarea
                rows={5}
                value={findingExplanation}
                onChange={(e) => setFindingExplanation(e.target.value)}
                placeholder="Explain the security / logic vulnerability..."
                className="w-full p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9] resize-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/70 font-mono space-y-1">
            <span className="font-bold text-[#E5DFC9] block">Evaluation Criteria:</span>
            <p>• Bug Localization (Flagging exact defect lines)</p>
            <p>• Explanation Quality (Technical rationale)</p>
            <p>• False-Positive Avoidance (Do not flag harmless code)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
