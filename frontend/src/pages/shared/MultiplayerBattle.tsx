import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, Flag, Send, Shield, Users, CheckCircle2, AlertTriangle, Code2
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockProExercises } from '../../mock/proExercises'

export default function MultiplayerBattle() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const exercise = mockProExercises[0]

  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [selectedLines, setSelectedLines] = useState<number[]>([66, 67])
  const [explanation, setExplanation] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      navigate(`/battle/${roomId || '4821'}/results`)
    }, 1500)
  }

  const codeLines = exercise.code.split('\n')

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Battle Header */}
      <div className="h-14 border-b border-navy-border bg-navy-surface px-6 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="navy" size="sm">Room #{roomId || '4821'}</Badge>
          <span className="font-mono text-white truncate">{exercise.repo}</span>
        </div>

        {/* Center Countdown Clock */}
        <div className={`flex items-center gap-2 font-mono text-sm font-extrabold px-3 py-1 rounded-lg border ${
          timeLeft < 30 ? 'bg-danger/20 border-danger text-danger animate-pulse' : 'bg-navy-midnight border-navy-border text-aqua'
        }`}>
          <Clock size={14} />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Players Status */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate hidden sm:inline">3 / 4 Submitted</span>
          <div className="flex -space-x-1.5">
            <div className="w-6 h-6 rounded-full bg-success/30 border border-success text-success text-2xs flex items-center justify-center font-bold">AF</div>
            <div className="w-6 h-6 rounded-full bg-success/30 border border-success text-success text-2xs flex items-center justify-center font-bold">RS</div>
            <div className="w-6 h-6 rounded-full bg-success/30 border border-success text-success text-2xs flex items-center justify-center font-bold">KR</div>
            <div className="w-6 h-6 rounded-full bg-navy-border text-slate text-2xs flex items-center justify-center font-bold">SS</div>
          </div>
        </div>
      </div>

      {/* Main Battle Interface */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Code Viewer with clickable lines */}
        <div className="flex-1 p-4 overflow-y-auto bg-navy-midnight font-mono text-xs text-slate border-r border-navy-border select-none">
          {codeLines.map((line, idx) => {
            const lineNum = idx + 1
            const isSelected = selectedLines.includes(lineNum)
            return (
              <div
                key={lineNum}
                onClick={() => {
                  if (submitted) return
                  setSelectedLines((prev) =>
                    prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum]
                  )
                }}
                className={`flex items-center py-0.5 px-2 rounded cursor-pointer transition-colors ${
                  isSelected ? 'bg-aqua/15 border-l-2 border-aqua text-white' : 'hover:bg-navy-surface text-slate'
                }`}
              >
                <span className={`w-8 text-right mr-4 select-none ${isSelected ? 'text-aqua font-bold' : 'text-slate/50'}`}>
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">{line}</span>
                {isSelected && <Flag size={12} className="text-aqua ml-2" />}
              </div>
            )
          })}
        </div>

        {/* Right: Quick Review Entry Panel */}
        <div className="w-full lg:w-[380px] bg-navy-surface p-5 flex flex-col justify-between border-t lg:border-t-0 border-navy-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-border">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Your Battle Submission</span>
              <Badge variant="navy" size="sm">{selectedLines.length} Tagged</Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs uppercase text-slate block font-mono">Flagged Lines:</label>
              <div className="flex flex-wrap gap-1">
                {selectedLines.map((l) => (
                  <span key={l} className="px-2 py-0.5 rounded bg-aqua/20 border border-aqua/40 text-aqua-bright font-mono text-2xs">
                    L{l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-2xs uppercase text-slate block mb-1 font-mono">Bug Explanation:</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the security vulnerability or defect pattern..."
                rows={4}
                className="w-full p-3 bg-navy-midnight border border-navy-border rounded-xl text-xs text-white placeholder-slate focus:outline-none focus:border-aqua resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-navy-border">
            <Button
              fullWidth
              size="lg"
              disabled={submitted || selectedLines.length === 0}
              onClick={handleSubmit}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              {submitted ? 'Waiting for final rankings...' : 'Lock In Review'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
