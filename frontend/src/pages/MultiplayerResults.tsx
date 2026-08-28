import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import {
  Trophy, Medal, Star, CheckCircle2, XCircle,
  AlertTriangle, Flame, RotateCcw, ArrowLeft
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { mockBattleResults, mockAIComparison } from '../mock/battle'
import type { LeaderboardEntry } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-accent/20 text-accent',
  'bg-success/20 text-success',
  'bg-warning/20 text-warning',
  'bg-danger/20 text-danger',
]

const MEDAL_ICONS = [
  <Trophy  size={20} className="text-warning" />,
  <Medal   size={20} className="text-text-secondary" />,
  <Star    size={20} className="text-warning/60" />,
]

const MEDAL_LABELS = ['🥇', '🥈', '🥉']

// ─── Podium Card ─────────────────────────────────────────────────────────────

interface PodiumCardProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  delay: number
}

function PodiumCard({ entry, isCurrentUser, delay }: PodiumCardProps) {
  const rankIdx = entry.rank - 1
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        padding="lg"
        className={clsx(
          'flex flex-col items-center gap-3 text-center',
          isCurrentUser && 'border-accent/30 bg-accent/5',
          entry.rank === 1 && 'ring-1 ring-warning/20'
        )}
      >
        <div className="text-2xl">{MEDAL_LABELS[rankIdx]}</div>
        <div
          className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
            AVATAR_COLORS[rankIdx % AVATAR_COLORS.length]
          )}
        >
          {entry.player.avatar}
        </div>
        <div>
          <p className={clsx('font-semibold', isCurrentUser ? 'text-accent' : 'text-text-primary')}>
            {entry.player.name}
            {isCurrentUser && <span className="text-xs text-text-muted ml-1">(you)</span>}
          </p>
          <p className={clsx(
            'text-2xl font-bold font-mono mt-0.5',
            entry.rank === 1 ? 'text-warning' : 'text-text-primary'
          )}>
            {entry.score}
          </p>
        </div>
        {entry.badge && (
          <Badge variant={entry.rank === 1 ? 'warning' : 'default'}>{entry.badge}</Badge>
        )}
        {MEDAL_ICONS[rankIdx]}
      </Card>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MultiplayerResults() {
  const navigate = useNavigate()
  const results  = mockBattleResults
  const ai       = mockAIComparison
  const myResult = results[0]   // Afrid is rank 1
  const bd       = myResult.breakdown

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                Review Complete
              </h1>
              <p className="text-text-secondary text-sm mt-0.5">
                Room #4821 · Flask Authentication Patch
              </p>
            </div>
            <Badge variant="success" dot>Battle Over</Badge>
          </div>
        </motion.div>

        {/* Podium — top 3 */}
        <div className="grid grid-cols-3 gap-4">
          {results.slice(0, 3).map((entry, i) => (
            <PodiumCard
              key={entry.player.id}
              entry={entry}
              isCurrentUser={entry.player.name === 'Afrid'}
              delay={0.1 + i * 0.08}
            />
          ))}
        </div>

        {/* Full leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Trophy size={14} className="text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">Full Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Rank', 'Player', 'Score', 'Correct Findings', 'Explanation', 'False Positives', 'Time Bonus'].map(col => (
                      <th key={col} className="px-4 py-2.5 text-left text-xs text-text-muted font-medium uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((entry, idx) => {
                    const isMe = entry.player.name === 'Afrid'
                    return (
                      <tr
                        key={entry.player.id}
                        className={clsx(
                          'border-b border-border/40 last:border-0 transition-colors',
                          isMe ? 'bg-accent/5 border-l-2 border-accent/40' : 'hover:bg-bg-elevated/40'
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-text-muted text-xs">
                          {MEDAL_LABELS[idx] ?? `#${entry.rank}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={clsx(
                              'w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold',
                              AVATAR_COLORS[idx % AVATAR_COLORS.length]
                            )}>
                              {entry.player.avatar.charAt(0)}
                            </div>
                            <span className={clsx('font-medium', isMe ? 'text-accent' : 'text-text-primary')}>
                              {entry.player.name}
                            </span>
                            {isMe && <Badge variant="accent" size="sm">you</Badge>}
                            {entry.badge && <Badge variant="muted" size="sm">{entry.badge}</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-text-primary">{entry.score}</td>
                        <td className="px-4 py-3 text-success font-mono">+{entry.breakdown.correctFindings}</td>
                        <td className="px-4 py-3 text-text-secondary font-mono">+{entry.breakdown.explanation}</td>
                        <td className="px-4 py-3 font-mono">
                          <span className={entry.breakdown.falsePenalty < 0 ? 'text-danger' : 'text-text-muted'}>
                            {entry.breakdown.falsePenalty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-warning/80 font-mono">+{entry.breakdown.timebonus}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Your score breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card padding="lg" className="border-accent/20 bg-accent/5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Your Score Breakdown
              </h2>
              {myResult.badge && (
                <Badge variant="accent">{myResult.badge} Reviewer</Badge>
              )}
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Correct findings',   value: `+${bd.correctFindings}`, color: 'text-success' },
                { label: 'Explanation quality', value: `+${bd.explanation}`,     color: 'text-text-primary' },
                { label: 'False positives',     value: bd.falsePenalty === 0 ? '0' : `${bd.falsePenalty}`, color: bd.falsePenalty < 0 ? 'text-danger' : 'text-text-muted' },
                { label: 'Time bonus',          value: `+${bd.timebonus}`,       color: 'text-warning' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <span className={clsx('font-mono font-semibold text-sm', row.color)}>{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold text-text-primary">Total</span>
                <span className="font-mono font-bold text-xl text-accent">{bd.total}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Human vs AI callout */}
        {ai.humanOnly.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex gap-4 p-5 rounded-xl border border-warning/20 bg-warning/5">
              <Flame size={20} className="text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-warning">
                  You caught something the AI reviewer missed!
                </p>
                {ai.humanOnly.map(item => (
                  <p key={item} className="text-xs text-text-secondary font-mono">
                    — {item}
                  </p>
                ))}
                <p className="text-xs text-text-muted mt-2">
                  Human reviewers catch context-specific bugs that AI misses. Keep building that instinct.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTAs */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={<RotateCcw size={16} />}
            onClick={() => navigate('/battle')}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/practice')}
          >
            Back to Practice
          </Button>
        </div>
      </div>
    </div>
  )
}
