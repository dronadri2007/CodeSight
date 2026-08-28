import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Trophy, Flame, Target, TrendingUp, Crown, Medal } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Tabs } from '../components/ui/Overlays'
import { Card } from '../components/ui/Card'

interface LeaderboardPlayer {
  rank: number
  name: string
  avatar: string
  score: number
  exercises: number
  catchRate: number
  streak: number
  isCurrentUser?: boolean
}

const mockPlayers: LeaderboardPlayer[] = [
  { rank: 1, name: 'Afrid', avatar: 'AF', score: 2847, exercises: 47, catchRate: 89, streak: 12, isCurrentUser: true },
  { rank: 2, name: 'Rahul', avatar: 'RA', score: 2614, exercises: 43, catchRate: 84, streak: 9 },
  { rank: 3, name: 'Karthik', avatar: 'KA', score: 2390, exercises: 39, catchRate: 81, streak: 7 },
  { rank: 4, name: 'Meera', avatar: 'ME', score: 2201, exercises: 36, catchRate: 78, streak: 5 },
  { rank: 5, name: 'Priya', avatar: 'PR', score: 2088, exercises: 34, catchRate: 76, streak: 4 },
  { rank: 6, name: 'Dev', avatar: 'DE', score: 1974, exercises: 31, catchRate: 74, streak: 3 },
  { rank: 7, name: 'Nadia', avatar: 'NA', score: 1853, exercises: 29, catchRate: 71, streak: 6 },
  { rank: 8, name: 'Vikram', avatar: 'VI', score: 1720, exercises: 27, catchRate: 68, streak: 2 },
  { rank: 9, name: 'Zara', avatar: 'ZA', score: 1605, exercises: 24, catchRate: 65, streak: 1 },
  { rank: 10, name: 'Arjun', avatar: 'AR', score: 1490, exercises: 22, catchRate: 62, streak: 0 },
]

const podiumOrder = [mockPlayers[1], mockPlayers[0], mockPlayers[2]]
const podiumHeights = ['h-20', 'h-28', 'h-16']
const podiumRanks = [2, 1, 3]

const tabs = [
  { id: 'week', label: 'This Week' },
  { id: 'all', label: 'All Time' },
  { id: 'class', label: 'By Class' },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={14} className="text-warning" />
  if (rank === 2) return <Medal size={14} className="text-text-secondary" />
  if (rank === 3) return <Medal size={14} className="text-[#CD7F32]" />
  return <span className="text-text-muted text-xs font-mono">#{rank}</span>
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('week')

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Leaderboard</h1>
            <p className="text-text-muted text-sm mt-1">Top reviewers this week</p>
          </div>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Podium */}
            <div className="mb-6 bg-bg-surface border border-border rounded-xl p-6 overflow-hidden">
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((player, i) => {
                  const isFirst = podiumRanks[i] === 1
                  return (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex flex-col items-center gap-2"
                    >
                      {/* Crown for rank 1 */}
                      {isFirst && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                        >
                          <Crown size={18} className="text-warning mb-1" />
                        </motion.div>
                      )}

                      {/* Avatar */}
                      <div className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2',
                        isFirst
                          ? 'bg-warning/20 border-warning text-warning'
                          : podiumRanks[i] === 2
                          ? 'bg-bg-elevated border-border-strong text-text-secondary'
                          : 'bg-[#CD7F32]/10 border-[#CD7F32]/50 text-[#CD7F32]'
                      )}>
                        {player.avatar}
                      </div>

                      <div className="text-center">
                        <p className={clsx(
                          'font-semibold text-sm',
                          player.isCurrentUser ? 'text-accent' : 'text-text-primary'
                        )}>
                          {player.name}
                          {player.isCurrentUser && ' (you)'}
                        </p>
                        <p className="text-text-muted text-xs font-mono">{player.score.toLocaleString()} pts</p>
                        {isFirst && (
                          <Badge variant="warning" className="mt-1 text-xs">Top Reviewer</Badge>
                        )}
                      </div>

                      {/* Podium block */}
                      <div className={clsx(
                        'w-20 rounded-t-lg flex items-center justify-center',
                        podiumHeights[i],
                        isFirst
                          ? 'bg-warning/20 border border-warning/30'
                          : podiumRanks[i] === 2
                          ? 'bg-bg-elevated border border-border'
                          : 'bg-[#CD7F32]/10 border border-[#CD7F32]/20'
                      )}>
                        <span className={clsx(
                          'text-xl font-bold',
                          isFirst ? 'text-warning' : podiumRanks[i] === 2 ? 'text-text-muted' : 'text-[#CD7F32]'
                        )}>
                          {podiumRanks[i]}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Table — ranks 4–10 */}
            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider w-12">Rank</th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider">Reviewer</th>
                    <th className="text-right px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider">Score</th>
                    <th className="text-right px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider hidden sm:table-cell">Exercises</th>
                    <th className="text-right px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider hidden md:table-cell">Catch Rate</th>
                    <th className="text-right px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider hidden lg:table-cell">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPlayers.slice(3).map((player, i) => (
                    <motion.tr
                      key={player.rank}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className={clsx(
                        'border-b border-border/50 last:border-0 transition-colors',
                        player.isCurrentUser
                          ? 'bg-accent-subtle border-accent/20'
                          : 'hover:bg-bg-elevated'
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center w-6">
                          <RankIcon rank={player.rank} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                            {player.avatar}
                          </div>
                          <span className={clsx(
                            'text-sm font-medium',
                            player.isCurrentUser ? 'text-accent' : 'text-text-primary'
                          )}>
                            {player.name}
                            {player.isCurrentUser && <span className="text-text-muted font-normal"> (you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-mono font-semibold text-text-primary">
                          {player.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        <span className="text-sm text-text-secondary font-mono">{player.exercises}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className={clsx(
                          'text-sm font-mono font-medium',
                          player.catchRate >= 80 ? 'text-success' : player.catchRate >= 65 ? 'text-warning' : 'text-text-secondary'
                        )}>
                          {player.catchRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          {player.streak > 0 && <Flame size={12} className="text-warning" />}
                          <span className="text-sm font-mono text-text-secondary">{player.streak}d</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-60 flex-shrink-0 flex flex-row lg:flex-col gap-4">
            <Card className="flex-1 lg:flex-none">
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">Your Stats</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Trophy size={14} />
                    <span className="text-xs">Your Rank</span>
                  </div>
                  <span className="text-lg font-bold text-accent font-mono">#1</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Target size={14} />
                    <span className="text-xs">Score</span>
                  </div>
                  <span className="text-lg font-bold text-text-primary font-mono">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <TrendingUp size={14} />
                    <span className="text-xs">Percentile</span>
                  </div>
                  <Badge variant="success">Top 5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Flame size={14} />
                    <span className="text-xs">Streak</span>
                  </div>
                  <span className="text-sm font-bold text-warning font-mono">12 days</span>
                </div>
              </div>
            </Card>

            <Card className="flex-1 lg:flex-none">
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">This Week</p>
              <div className="space-y-2">
                <div className="text-xs text-text-muted flex justify-between">
                  <span>Reviews done</span>
                  <span className="text-text-primary font-mono font-medium">14</span>
                </div>
                <div className="text-xs text-text-muted flex justify-between">
                  <span>Catch rate</span>
                  <span className="text-success font-mono font-medium">89%</span>
                </div>
                <div className="text-xs text-text-muted flex justify-between">
                  <span>Pts earned</span>
                  <span className="text-text-primary font-mono font-medium">+340</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
