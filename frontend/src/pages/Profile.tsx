import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Trophy, Flame, Shield, Award, ExternalLink,
  Sparkles, Check, Copy, ArrowUpRight, Clock, Code2
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { LevelStepper } from '../components/profile/LevelStepper'
import { WeaknessChart } from '../components/profile/WeaknessChart'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  if (!user) {
    navigate('/auth')
    return null
  }

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

        {/* 2. Level Progression (6 Strict Levels Stepper) */}
        <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] shadow-xl">
          <LevelStepper currentLevel={user.level} currentLevelIndex={user.levelIndex} />
        </Card>

        {/* 3. Concept Mastery & 6-Defect Classes Weakness Chart */}
        <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] shadow-xl">
          <WeaknessChart catchRates={user.weaknessCatchRates} />
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
