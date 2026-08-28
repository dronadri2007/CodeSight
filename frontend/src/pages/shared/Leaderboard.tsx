import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy, Medal, ArrowUpRight, Flame, Shield, Search, Sparkles
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

interface LeaderboardUser {
  rank: number
  name: string
  handle: string
  score: number
  track: 'Student' | 'Professional'
  catchRate: number
  streak: number
  avatar: string
  isCurrentUser?: boolean
}

const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'Afrid Shaik', handle: '@afrid', score: 2847, track: 'Professional', catchRate: 94, streak: 12, avatar: 'AF', isCurrentUser: true },
  { rank: 2, name: 'Elena Rostova', handle: '@elena_dev', score: 2614, track: 'Professional', catchRate: 91, streak: 8, avatar: 'ER' },
  { rank: 3, name: 'Rahul Sharma', handle: '@rahul_s', score: 2390, track: 'Student', catchRate: 88, streak: 6, avatar: 'RS' },
  { rank: 4, name: 'Devon Vance', handle: '@dvance', score: 2180, track: 'Professional', catchRate: 85, streak: 4, avatar: 'DV' },
  { rank: 5, name: 'Sarah Chen', handle: '@sarahc', score: 2050, track: 'Student', catchRate: 84, streak: 5, avatar: 'SC' },
  { rank: 6, name: 'Marcus Brody', handle: '@mbrody', score: 1980, track: 'Professional', catchRate: 82, streak: 3, avatar: 'MB' },
  { rank: 7, name: 'Priya Patel', handle: '@priya_p', score: 1890, track: 'Student', catchRate: 80, streak: 2, avatar: 'PP' },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'pro' | 'student'>('all')

  const filtered = mockLeaderboard.filter((u) => {
    if (filter === 'pro') return u.track === 'Professional'
    if (filter === 'student') return u.track === 'Student'
    return true
  })

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="navy" size="sm">GLOBAL RANKINGS</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Code Review Leaderboard
          </h1>
          <p className="text-sm text-slate">
            Top engineering practitioners ranked by code review precision and verified bug localization.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2">
          {[
            { id: 'all', label: 'All Engineers' },
            { id: 'pro', label: 'Professionals' },
            { id: 'student', label: 'Students' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-aqua text-navy font-bold'
                  : 'bg-navy-surface border border-navy-border text-slate hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
          {/* Rank 2 */}
          <Card dark className="p-6 text-center border-navy-border bg-navy-surface order-2 sm:order-1 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-navy-midnight border border-navy-border text-slate font-bold text-sm flex items-center justify-center mx-auto">
              🥈 2nd
            </div>
            <div>
              <p className="text-sm font-bold text-white">{filtered[1]?.name || 'Elena'}</p>
              <p className="text-2xs text-slate">{filtered[1]?.handle}</p>
            </div>
            <div className="text-xl font-mono font-bold text-white">{filtered[1]?.score} pts</div>
          </Card>

          {/* Rank 1 (Tallest) */}
          <Card dark className="p-8 text-center border-aqua/50 bg-navy-surface order-1 sm:order-2 space-y-3 shadow-aqua-glow sm:-translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-aqua/20 border border-aqua/40 text-aqua font-bold text-base flex items-center justify-center mx-auto">
              👑 1st
            </div>
            <div>
              <p className="text-base font-bold text-white">{filtered[0]?.name || 'Afrid Shaik'}</p>
              <p className="text-2xs text-aqua">{filtered[0]?.handle} (You)</p>
            </div>
            <div className="text-2xl font-mono font-extrabold text-gradient-aqua">{filtered[0]?.score} pts</div>
            <Badge variant="accent" size="sm">Top Reviewer</Badge>
          </Card>

          {/* Rank 3 */}
          <Card dark className="p-6 text-center border-navy-border bg-navy-surface order-3 sm:order-3 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-navy-midnight border border-navy-border text-slate font-bold text-sm flex items-center justify-center mx-auto">
              🥉 3rd
            </div>
            <div>
              <p className="text-sm font-bold text-white">{filtered[2]?.name || 'Rahul'}</p>
              <p className="text-2xs text-slate">{filtered[2]?.handle}</p>
            </div>
            <div className="text-xl font-mono font-bold text-white">{filtered[2]?.score} pts</div>
          </Card>
        </div>

        {/* Table List */}
        <div className="rounded-2xl border border-navy-border bg-navy-surface overflow-hidden shadow-xl">
          <div className="p-4 bg-navy-midnight/80 border-b border-navy-border text-2xs uppercase tracking-wider text-slate font-mono grid grid-cols-12 gap-2">
            <span className="col-span-1">Rank</span>
            <span className="col-span-5">Engineer</span>
            <span className="col-span-2 text-center">Track</span>
            <span className="col-span-2 text-center">Precision</span>
            <span className="col-span-2 text-right">Points</span>
          </div>

          <div className="divide-y divide-navy-border">
            {filtered.map((user) => (
              <div
                key={user.rank}
                className={`p-4 grid grid-cols-12 gap-2 items-center text-xs transition-colors ${
                  user.isCurrentUser ? 'bg-aqua/10 border-l-2 border-aqua' : 'hover:bg-navy-midnight/40'
                }`}
              >
                <div className="col-span-1 font-mono font-bold text-slate">
                  #{user.rank}
                </div>

                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-navy-midnight border border-navy-border text-aqua font-bold text-2xs flex items-center justify-center">
                    {user.avatar}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-2xs text-slate">{user.handle}</span>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <Badge variant={user.track === 'Professional' ? 'navy' : 'default'} size="sm">
                    {user.track}
                  </Badge>
                </div>

                <div className="col-span-2 text-center font-mono text-slate">
                  {user.catchRate}%
                </div>

                <div className="col-span-2 text-right font-mono font-bold text-white">
                  {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
