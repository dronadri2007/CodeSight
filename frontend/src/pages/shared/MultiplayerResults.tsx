import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy, Medal, ArrowRight, RotateCcw, Shield, CheckCircle2, Flame, Award
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

export default function MultiplayerResults() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const battlePodium = [
    { rank: 1, name: 'Afrid Shaik', score: 842, precision: '95%', findings: '3 / 3', avatar: 'AF', badge: 'Most Precise Reviewer', isCurrentUser: true },
    { rank: 2, name: 'Rahul Sharma', score: 799, precision: '88%', findings: '2 / 3', avatar: 'RS' },
    { rank: 3, name: 'Karthik Rao', score: 741, precision: '82%', findings: '2 / 3', avatar: 'KR' },
    { rank: 4, name: 'Suman Sen', score: 610, precision: '70%', findings: '1 / 3', avatar: 'SS' },
  ]

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="success" size="sm">MATCH COMPLETE</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Review Battle Results
          </h1>
          <p className="text-xs font-mono text-slate">Room #{roomId || '4821'}</p>
        </div>

        {/* Winner Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card dark className="p-8 border-aqua/40 bg-navy-surface text-center space-y-4 shadow-aqua-glow">
            <div className="w-16 h-16 rounded-2xl bg-aqua/20 border-2 border-aqua/40 text-aqua font-bold text-2xl flex items-center justify-center mx-auto">
              👑
            </div>

            <div className="space-y-1">
              <Badge variant="accent" size="sm">MATCH WINNER</Badge>
              <h2 className="text-2xl font-extrabold text-white">Afrid Shaik</h2>
              <div className="text-4xl font-extrabold font-mono text-gradient-aqua">
                842 Points
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-navy-border text-xs">
              <div>
                <span className="text-slate block text-2xs uppercase font-mono">Correct Findings</span>
                <span className="font-bold text-success font-mono">3 / 3 (+560 pts)</span>
              </div>
              <div>
                <span className="text-slate block text-2xs uppercase font-mono">Explanation Quality</span>
                <span className="font-bold text-aqua font-mono">High (+220 pts)</span>
              </div>
              <div>
                <span className="text-slate block text-2xs uppercase font-mono">Time Bonus</span>
                <span className="font-bold text-white font-mono">+62 pts</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Full Room Standings Table */}
        <Card dark className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Match Standings</h3>

          <div className="divide-y divide-navy-border">
            {battlePodium.map((p) => (
              <div
                key={p.rank}
                className={`py-3 flex items-center justify-between text-xs ${
                  p.isCurrentUser ? 'font-bold text-aqua' : 'text-slate'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono text-slate">#{p.rank}</span>
                  <div className="w-7 h-7 rounded-lg bg-navy-midnight border border-navy-border text-white text-2xs flex items-center justify-center font-bold">
                    {p.avatar}
                  </div>
                  <span className="text-white">{p.name} {p.isCurrentUser && '(You)'}</span>
                </div>

                <div className="flex items-center gap-6 font-mono">
                  <span className="hidden sm:inline text-2xs text-slate">{p.findings} Caught</span>
                  <span className="font-bold text-white">{p.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA Controls */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="dark" onClick={() => navigate('/battle')}>
            Back to Arena Lobby
          </Button>

          <Button
            size="lg"
            onClick={() => navigate('/pro/dashboard')}
            className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
          >
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
