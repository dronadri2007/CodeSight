import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Trophy, Swords, Send, ArrowLeft, CheckCircle2,
  Users, Sparkles, Award, Zap, AlertTriangle, Shield
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge, DifficultyBadge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { DraggableLayout } from '../components/workspace/DraggableLayout'
import { useBattleStore } from '../store/battleStore'
import { useAuthStore } from '../store/authStore'
import { mockProblems } from '../mock/problems'

export default function BattleRoom() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { activeRoom, submitBattleCode, endBattle } = useBattleStore()
  const { user } = useAuthStore()

  const room = activeRoom || {
    roomId: roomId || 'room_101',
    roomCode: roomId || '482190',
    type: 'ranked',
    hostId: 'system',
    status: 'in_progress',
    problemCount: 1,
    problems: [mockProblems[0]],
    currentProblemIndex: 0,
    timeLimitSeconds: 180,
    timeRemainingSeconds: 180,
    speedBonusRemaining: 20,
    players: [
      { id: 'usr_afrid', name: 'Afrid Shaik (You)', avatar: 'AF', score: 0, submitted: false, isCurrentUser: true },
      { id: 'usr_2', name: 'Elena Rostova', avatar: 'ER', score: 0, submitted: false },
      { id: 'usr_3', name: 'Rahul Sharma', avatar: 'RS', score: 0, submitted: false },
      { id: 'usr_4', name: 'Devon Vance', avatar: 'DV', score: 0, submitted: false },
    ],
  }

  const problem = room.problems[room.currentProblemIndex] || mockProblems[0]
  const [code, setCode] = useState(problem.starterCode)
  const [secondsRemaining, setSecondsRemaining] = useState(room.timeRemainingSeconds || 180)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Countdown timer hook
  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (!hasSubmitted) handleSubmit()
      return
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsRemaining, hasSubmitted])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    setHasSubmitted(true)
    submitBattleCode(code)
  }

  const handleExit = () => {
    endBattle()
    navigate('/contest')
  }

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score)
  const isMatchComplete = room.status === 'completed' || (hasSubmitted && room.players.every((p) => p.submitted))

  // Left Panel
  const leftPanel = (
    <div className="h-full overflow-y-auto p-5 space-y-4 bg-[#000000] text-[#E5DFC9] text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#3A2F1D]">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="font-mono text-2xs text-[#E5DFC9]/50">{problem.optimalTC} / {problem.optimalSC}</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-extrabold text-[#E5DFC9]">{problem.title}</h2>
        <p className="text-2xs text-[#E5DFC9]/60 font-mono">Defect Category: {problem.defectClassName}</p>
      </div>

      <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
        {problem.description}
      </div>

      <div className="p-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] space-y-1 font-mono text-2xs">
        <span className="font-bold text-[#E5DFC9]">Speed Bonus Pool:</span>
        <p className="text-[#E5DFC9]/70">First to submit valid code earns +20 bonus pts (decreases by 5 per subsequent submit).</p>
      </div>
    </div>
  )

  // Center Panel
  const centerPanel = (
    <div className="h-full flex flex-col bg-[#000000]">
      <div className="h-10 px-4 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between text-xs font-mono text-[#E5DFC9]/60">
        <span>solution.py</span>
        <span>[Live Battle Mode]</span>
      </div>

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

  // Right Panel: Live Leaderboard
  const rightPanel = (
    <div className="h-full flex flex-col bg-[#1A130D] text-xs">
      <div className="h-10 px-4 bg-[#000000] border-b border-[#3A2F1D] flex items-center justify-between">
        <span className="font-bold text-xs text-[#E5DFC9] flex items-center gap-1.5">
          <Trophy size={14} className="text-[#E5DFC9]" /> Live Standings
        </span>
        <span className="font-mono text-2xs text-[#E5DFC9]/50">{room.players.length} Players</span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        {sortedPlayers.map((player, idx) => (
          <div
            key={player.id}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
              player.isCurrentUser
                ? 'bg-[#3A2F1D]/50 border-[#E5DFC9] shadow-sm'
                : 'bg-[#000000] border-[#3A2F1D]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-2xs font-bold text-[#E5DFC9]/60">#{idx + 1}</span>
              <div className="w-6 h-6 rounded-lg bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] text-2xs font-bold flex items-center justify-center">
                {player.avatar}
              </div>
              <div>
                <span className="font-bold text-[#E5DFC9] block text-2xs truncate max-w-[100px]">
                  {player.name}
                </span>
                <span className="text-3xs text-[#E5DFC9]/50 font-mono">
                  {player.submitted ? 'Submitted' : 'Coding...'}
                </span>
              </div>
            </div>

            <div className="text-right font-mono font-bold text-[#E5DFC9] text-xs">
              {player.score} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#E5DFC9] flex flex-col overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 px-6 bg-[#1A130D] border-b border-[#3A2F1D] flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <Badge variant="gold" size="sm">
            {room.type === 'ranked' ? 'RANKED ELO MATCH' : `ROOM #${room.roomCode}`}
          </Badge>
          <div className="h-4 w-px bg-[#3A2F1D]" />
          <span className="font-bold text-[#E5DFC9]">Problem 1 of {room.problemCount}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-[#000000] border border-[#3A2F1D]">
            <Clock size={14} className="text-[#E5DFC9]" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={hasSubmitted}
            icon={<Send size={12} className="text-[#000000]" />}
            className="text-xs font-bold shadow-md"
          >
            {hasSubmitted ? 'Solution Submitted' : 'Submit Solution'}
          </Button>

          <button
            onClick={handleExit}
            className="text-[#E5DFC9]/60 hover:text-[#E5DFC9] text-xs font-semibold"
          >
            Exit
          </button>
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

      {/* Match Completed Modal */}
      <AnimatePresence>
        {isMatchComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full rounded-3xl bg-[#1A130D] border border-[#E5DFC9] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] flex items-center justify-center mx-auto shadow-md">
                <Trophy size={28} />
              </div>

              <div className="space-y-1">
                <Badge variant="gold" size="sm">MATCH COMPLETE</Badge>
                <h2 className="text-2xl font-extrabold text-[#E5DFC9]">Rankings & Results</h2>
                <p className="text-xs text-[#E5DFC9]/70">
                  {room.type === 'ranked'
                    ? 'Points earned have been credited to your Global ELO Rating and Profile XP.'
                    : 'Friendly match completed. Great review practice!'}
                </p>
              </div>

              {/* Podium List */}
              <div className="space-y-2 pt-2">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      idx === 0 ? 'bg-[#3A2F1D] border-[#E5DFC9] font-bold' : 'bg-[#000000] border-[#3A2F1D]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <span className="text-[#E5DFC9]">{player.name}</span>
                    </div>
                    <span className="font-mono text-[#E5DFC9]">{player.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => navigate('/contest')}
                  className="flex-1 text-xs"
                >
                  Battle Lobby
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => navigate('/problems')}
                  className="flex-1 font-bold text-xs"
                >
                  Home Problems
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
