import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Trophy, Flame, Award, Check, Copy, ArrowUpRight, Clock, Sparkles
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { LevelStepper } from '../components/profile/LevelStepper'
import { WeaknessChart } from '../components/profile/WeaknessChart'
import { useAuthStore } from '../store/authStore'
import { getProfile, getSkillCard, type WeaknessProfile, type SkillCard } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [card, setCard] = useState<SkillCard | null>(null)
  const [profile, setProfile] = useState<WeaknessProfile | null>(null)

  useEffect(() => {
    let dead = false
    getSkillCard().then((c) => { if (!dead) setCard(c) }).catch(() => {})
    getProfile().then((p) => { if (!dead) setProfile(p) }).catch(() => {})
    return () => { dead = true }
  }, [])

  if (!user) {
    navigate('/auth')
    return null
  }

  const liveCatchRates: Record<string, number> =
    profile && profile.by_class.length
      ? Object.fromEntries(profile.by_class.map((c) => [c.defect_class, Math.round(c.catch_rate * 100)]))
      : user.weaknessCatchRates

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/#/profile/${user.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Top Navbar */}
      <Navbar variant="app" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Header Profile Card */}
        <Card className="p-8 border-[#3A2F1D] bg-[#1A130D] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Large Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] font-bold text-2xl flex items-center justify-center shadow-lg">
                {user.avatar}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl font-extrabold text-[#E5DFC9]">{user.name}</h1>
                  <Badge variant="gold" size="sm">{user.level}</Badge>
                </div>
                <p className="text-xs text-[#E5DFC9]/70">{user.email} · Tier 0{user.levelIndex} Verified Practitioner</p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs font-mono text-[#E5DFC9]/80">
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-[#E5DFC9]" />
                    <span><strong className="text-[#E5DFC9]">{user.problemsSolved}</strong> Solved</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Flame size={13} className="text-[#E5DFC9]" />
                    <span><strong className="text-[#E5DFC9]">{user.currentStreak}</strong> Day Streak</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={13} className="text-[#E5DFC9]" />
                    <span><strong className="text-[#E5DFC9]">{user.totalXP}</strong> Total XP</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <Award size={13} className="text-[#E5DFC9]" />
                    <span>Global Rank <strong className="text-[#E5DFC9]">#{user.globalRank}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share / Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyShare}
                icon={copied ? <Check size={13} /> : <Copy size={13} />}
                className="text-xs"
              >
                {copied ? 'Link Copied' : 'Share Profile'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Review-skill card (live from GET /profile/{id}/card) */}
        {card && (
          <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-3">
              <span className="text-xs font-mono font-bold text-[#E5DFC9] uppercase flex items-center gap-1.5">
                <Sparkles size={14} /> Review-skill card
              </span>
              <Badge variant="gold" size="sm">{card.headline}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-2xs">
              <div><span className="text-[#E5DFC9]/50 block">Skill score</span><strong className="text-[#E5DFC9] text-sm">{Math.round(card.skill_score * 100)}</strong>/100</div>
              <div><span className="text-[#E5DFC9]/50 block">Tier</span><strong className="text-[#E5DFC9] capitalize">{card.tier}</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">Catch rate</span><strong className="text-[#E5DFC9]">{Math.round(card.catch_rate * 100)}%</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">Attempts</span><strong className="text-[#E5DFC9]">{card.total_attempts}</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">Strongest</span><strong className="text-emerald-400">{card.strongest_class ?? '—'}</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">Weakest</span><strong className="text-amber-400">{card.weakest_class ?? '—'}</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">FP discipline</span><strong className="text-[#E5DFC9]">{card.false_positive_discipline === null ? '—' : `${Math.round(card.false_positive_discipline * 100)}%`}</strong></div>
              <div><span className="text-[#E5DFC9]/50 block">Leaderboard</span><strong className="text-[#E5DFC9]">{card.leaderboard_rank ? `#${card.leaderboard_rank} / ${card.ranked_out_of}` : 'unranked'}</strong></div>
            </div>
          </Card>
        )}

        {/* 2. Level Progression (6 Strict Levels Stepper) */}
        <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] shadow-xl">
          <LevelStepper currentLevel={user.level} currentLevelIndex={user.levelIndex} />
        </Card>

        {/* 3. Concept Mastery & 6-Defect Classes Weakness Chart */}
        <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] shadow-xl">
          <WeaknessChart catchRates={liveCatchRates} />
          {profile && (
            <p className="text-2xs text-[#E5DFC9]/60 font-mono mt-3 pt-3 border-t border-[#3A2F1D]">{profile.recommendation}</p>
          )}
        </Card>

        {/* 4. Recent Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#E5DFC9] flex items-center gap-2">
              <Clock size={16} className="text-[#E5DFC9]" /> Recent Submissions & Algorithmic Benchmarks
            </h2>
            <span className="text-2xs font-mono text-[#E5DFC9]/50">Last 5 Submissions</span>
          </div>

          <div className="rounded-2xl border border-[#3A2F1D] bg-[#1A130D] overflow-hidden divide-y divide-[#3A2F1D] shadow-xl">
            {(user.recentSubmissions || []).map((sub, idx) => (
              <div
                key={idx}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#000000]/60 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E5DFC9]">{sub.problemTitle}</span>
                    <Badge variant={sub.pass ? 'gold' : 'default'} size="sm">
                      {sub.pass ? 'PASSED' : 'RETRY'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-2xs font-mono text-[#E5DFC9]/60">
                    <span>Your TC/SC: <strong className="text-[#E5DFC9]">{sub.userTC} / {sub.userSC}</strong></span>
                    <span>·</span>
                    <span>Optimal: <strong className="text-[#E5DFC9]">{sub.optimalTC} / {sub.optimalSC}</strong></span>
                    <span>·</span>
                    <span>{sub.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-[#E5DFC9]">{sub.totalScore}</span>
                    <span className="text-2xs text-[#E5DFC9]/50"> / 100</span>
                  </div>

                  <Link
                    to={`/results/${sub.problemId}`}
                    className="p-2 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:border-[#E5DFC9] transition-colors"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
