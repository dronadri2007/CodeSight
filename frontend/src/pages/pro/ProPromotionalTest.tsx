import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send, AlertTriangle, CheckCircle2, FileCode, Shield,
  HelpCircle, Eye, ArrowRight, ArrowLeft
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

  const [selectedLines, setSelectedLines] = useState<number[]>([17, 18])
  const [findingTitle, setFindingTitle] = useState('SQL Injection via f-string query formatting')
  const [findingExplanation, setFindingExplanation] = useState(
    'Direct string interpolation in SQL query allows attackers to inject malicious SQL syntax and bypass authentication using `admin\' OR \'1\'=\'1`.'
  )
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

    // Evaluate localization: lines 17 and 18 are the real flaw
    const hasTargetLine = selectedLines.includes(17) || selectedLines.includes(18)
    const falsePositiveCount = selectedLines.filter((l) => l !== 17 && l !== 18).length
    const hasGoodExplanation = findingExplanation.toLowerCase().includes('sql') ||
      findingExplanation.toLowerCase().includes('injection') ||
      findingExplanation.toLowerCase().includes('parameter')

    let localizationScore = 0
    if (selectedLines.includes(17) && selectedLines.includes(18) && falsePositiveCount === 0) {
      localizationScore = 100
    } else if (hasTargetLine && falsePositiveCount <= 2) {
      localizationScore = 75
    } else if (hasTargetLine) {
      localizationScore = 50
    } else {
      localizationScore = 20
    }

    const explanationScore = hasGoodExplanation ? 90 : 40
    const totalScore = Math.round((localizationScore * 0.5) + (explanationScore * 0.5) - (falsePositiveCount * 5))
    const passed = totalScore >= 65

    if (passed) {
      setPassedPromotionalTest(true)
    }

    navigate('/pro/promotional-result', {
      state: {
        score: totalScore,
        localizationScore,
        explanationScore,
        passed,
        selectedLines,
        findingTitle,
        findingExplanation,
      },
    })
  }

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pro/promotional-entry')}
            className="flex items-center gap-1 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]"
          >
            <ArrowLeft size={14} /> Exit
          </button>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <Badge variant="gold" size="sm">PROMOTIONAL ASSESSMENT</Badge>
          <span className="font-bold text-[#E5DFC9]">Real Code Review Simulation</span>
        </div>

        <Button
          size="sm"
          variant="gold"
          onClick={handleSubmit}
          disabled={selectedLines.length === 0 || !findingTitle.trim()}
          icon={<Send size={12} className="text-[#000000]" />}
          className="text-xs font-bold shadow-md"
        >
          {isSubmitting ? 'Evaluating Review...' : 'Submit Review'}
        </Button>
      </header>

      {/* Main Review Split Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left: Code Viewer with Click-to-Highlight Lines */}
        <div className="md:col-span-7 h-full overflow-y-auto bg-[#000000] border-r border-[#3A2F1D] p-5 font-mono text-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3A2F1D] text-2xs text-[#E5DFC9]/60">
            <span>auth_service.py</span>
            <span>Click line numbers to highlight suspicious code</span>
          </div>

          <div className="space-y-1">
            {PROMOTIONAL_CODE.map((line, idx) => {
              const lineNum = idx + 1
              const isSelected = selectedLines.includes(lineNum)
              return (
                <div
                  key={lineNum}
                  onClick={() => toggleLine(lineNum)}
                  className={`flex items-center gap-3 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#3A2F1D]/80 border-l-2 border-[#E5DFC9] text-[#E5DFC9] font-bold'
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
              <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 font-bold block">
                Code Review Finding
              </span>
              <h2 className="text-base font-bold text-[#E5DFC9] mt-0.5">
                What is wrong with this code?
              </h2>
            </div>

            {/* Selected Lines Tag */}
            <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1 font-mono text-2xs">
              <span className="text-[#E5DFC9]/60">Flagged Lines:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedLines.length > 0 ? (
                  selectedLines.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] font-bold">
                      Line {l}
                    </span>
                  ))
                ) : (
                  <span className="text-[#E5DFC9]/40 italic">No lines selected (click on the left code lines)</span>
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
                placeholder="e.g. SQL Injection in query string"
                className="w-full p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9]"
              />
            </div>

            {/* Explanation Textarea */}
            <div className="space-y-1.5">
              <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
                Explain why it is a problem and what behavior it could cause:
              </label>
              <textarea
                rows={5}
                value={findingExplanation}
                onChange={(e) => setFindingExplanation(e.target.value)}
                placeholder="Explain the technical impact (e.g. bypasses auth, causes race condition)..."
                className="w-full p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-xs focus:outline-none focus:border-[#E5DFC9] resize-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/70 font-mono">
            <strong>Note:</strong> We evaluate your precision in identifying root causes without flagging valid lines.
          </div>
        </div>
      </div>
    </div>
  )
}
