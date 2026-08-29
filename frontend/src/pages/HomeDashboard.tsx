import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, Bot, ArrowRight, Shield, Award, Flame,
  TrendingUp, Lock, CheckCircle2, ChevronRight, Zap, Target,
  Sparkles, Code2, AlertTriangle
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { WeaknessChart } from '../components/profile/WeaknessChart'
import { useAuthStore } from '../store/authStore'
import { useProblemStore } from '../store/problemStore'
import { mockProblems } from '../mock/problems'

export default function HomeDashboard() {
  const navigate = useNavigate()
  const { user, hasPassedPromotionalTest, studentLevel, proLevel, setSelectedTrack } = useAuthStore()
  const { setFilters } = useProblemStore()

  // Find recommended problem based on lowest catch rate
  const catchRates = user?.weaknessCatchRates || {}
  const sortedWeaknesses = Object.entries(catchRates).sort(([, a], [, b]) => a - b)
  const weakestClassId = sortedWeaknesses[0] ? sortedWeaknesses[0][0] : 'error-handling'
  const recommendedProblem = mockProblems.find((p) => p.defectClassId === weakestClassId) || mockProblems[0]

  const handleStartStudent = () => {
    setSelectedTrack('student')
    setFilters({ mode: 'student' })
    navigate('/student/problems')
  }

  const handleStartPro = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    if (hasPassedPromotionalTest) {
      navigate('/pro/problems')
    } else {
      navigate('/pro/promotional-entry')
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2F1D]">
          <div>
            <span className="text-2xs font-mono uppercase tracking-widest text-[#E5DFC9]/60 block font-bold">
              CENTRAL DASHBOARD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Afrid'}
            </h1>
            <p className="text-xs text-[#E5DFC9]/70 mt-1">
              Select your track or resume your adaptive practice recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/role-select')}
              className="text-xs"
              icon={<Sparkles size={13} />}
            >
              Switch Track
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/problems')}
              className="text-xs font-bold"
              iconRight={<ArrowRight size={13} />}
            >
              View All Problems
            </Button>
          </div>
        </div>

        {/* 2 Primary Track Cards: Student & AI-Assisted Professional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Student Track */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] flex-1 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#E5DFC9]/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <Badge variant="navy" size="sm">
                    LEVEL: {studentLevel?.toUpperCase() || 'INTERMEDIATE'}
                  </Badge>
                </div>

                <h2 className="text-xl font-bold text-[#E5DFC9] mb-1">
                  Student Track
                </h2>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Build algorithmic instincts from scratch. Graded on Time Complexity ($TC$) &amp; Space Complexity ($SC$) relative to optimal bounds.
                </p>

                <div className="space-y-2 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Primary Action:</span>
                    <span className="font-bold text-[#E5DFC9] bg-[#1A130D] px-2 py-0.5 rounded border border-[#3A2F1D]">SOLVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Evaluator:</span>
                    <span className="text-[#E5DFC9]">TC &amp; SC Relative Grading (50/50)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  fullWidth
                  size="md"
                  variant="primary"
                  onClick={handleStartStudent}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs"
                >
                  Continue Student Track
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => navigate('/student/level-select')}
                  className="text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]"
                >
                  Level
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 2: AI-Assisted Professional */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col"
          >
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] flex-1 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#E5DFC9]/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  {hasPassedPromotionalTest ? (
                    <Badge variant="gold" size="sm">
                      LEVEL: {proLevel?.toUpperCase() || 'BEGINNER'}
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      PROMOTIONAL TEST REQUIRED
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-bold text-[#E5DFC9] mb-1">
                  AI-Assisted Professional
                </h2>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Train to review, inspect, and debug AI-generated code. Graded on bug localization, explanation clarity, and false-positive avoidance.
                </p>

                {hasPassedPromotionalTest ? (
                  <div className="space-y-2 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80 font-mono">
                    <div className="flex items-center justify-between">
                      <span>Primary Action:</span>
                      <span className="font-bold text-[#E5DFC9] bg-[#1A130D] px-2 py-0.5 rounded border border-[#3A2F1D]">DEBUG</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold">Qualified Practitioner</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 mb-6 rounded-xl bg-[#000000] border border-amber-900/40 text-2xs text-amber-300/80 flex items-start gap-2">
                    <Lock size={14} className="flex-shrink-0 mt-0.5 text-amber-400" />
                    <span>Locked until promotional code-review assessment is cleared.</span>
                  </div>
                )}
              </div>

              {hasPassedPromotionalTest ? (
                <div className="flex items-center gap-3">
                  <Button
                    fullWidth
                    size="md"
                    variant="primary"
                    onClick={handleStartPro}
                    iconRight={<ArrowRight size={14} />}
                    className="font-bold text-xs"
                  >
                    Continue Professional Reviews
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => navigate('/pro/level-select')}
                    className="text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]"
                  >
                    Level
                  </Button>
                </div>
              ) : (
                <Button
                  fullWidth
                  size="md"
                  variant="gold"
                  onClick={() => navigate('/pro/promotional-test')}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs shadow-md uppercase tracking-wider"
                >
                  Take Promotional Test →
                </Button>
              )}
            </Card>
          </motion.div>
        </div>

        {/* 3 Overview Metrics & Weakness Profile Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 font-bold">
              Performance Snapshot
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-[#1A130D] border-[#3A2F1D]">
                <div className="flex items-center gap-2 text-2xs text-[#E5DFC9]/60 font-mono mb-1">
                  <CheckCircle2 size={13} className="text-[#E5DFC9]" />
                  <span>Solved</span>
                </div>
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.problemsSolved || 18}</p>
                <p className="text-3xs text-[#E5DFC9]/40 mt-0.5">Exercises cleared</p>
              </Card>

              <Card className="p-4 bg-[#1A130D] border-[#3A2F1D]">
                <div className="flex items-center gap-2 text-2xs text-[#E5DFC9]/60 font-mono mb-1">
                  <Flame size={13} className="text-amber-400" />
                  <span>Streak</span>
                </div>
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.currentStreak || 4} <span className="text-xs font-normal">days</span></p>
                <p className="text-3xs text-[#E5DFC9]/40 mt-0.5">Consistent review</p>
              </Card>

              <Card className="p-4 bg-[#1A130D] border-[#3A2F1D]">
                <div className="flex items-center gap-2 text-2xs text-[#E5DFC9]/60 font-mono mb-1">
                  <Award size={13} className="text-[#E5DFC9]" />
                  <span>Total XP</span>
                </div>
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.totalXP || 2847}</p>
                <p className="text-3xs text-[#E5DFC9]/40 mt-0.5">Score accumulated</p>
              </Card>

              <Card className="p-4 bg-[#1A130D] border-[#3A2F1D]">
                <div className="flex items-center gap-2 text-2xs text-[#E5DFC9]/60 font-mono mb-1">
                  <TrendingUp size={13} className="text-[#E5DFC9]" />
                  <span>Global Rank</span>
                </div>
                <p className="text-2xl font-extrabold text-[#E5DFC9]">#{user?.globalRank || 1}</p>
                <p className="text-3xs text-[#E5DFC9]/40 mt-0.5">Top percentile</p>
              </Card>
            </div>

            {/* Adaptive Learning Callout */}
            <Card className="p-4 bg-[#1A130D] border-[#3A2F1D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap size={12} /> ADAPTIVE RECOMMENDATION
                </span>
              </div>
              <p className="text-xs font-bold text-[#E5DFC9]">
                {recommendedProblem.title}
              </p>
              <p className="text-2xs text-[#E5DFC9]/70">
                Targeting your lowest catch rate in <span className="font-bold text-[#E5DFC9]">{recommendedProblem.defectClassName}</span>.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/practice/${recommendedProblem.id}`)}
                className="w-full text-xs font-bold"
              >
                Practice This Weakness
              </Button>
            </Card>
          </div>

          {/* Weakness Profile Column (2 Cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 font-bold">
                Defect Class Catch Rates
              </h3>
              <Link to="/profile" className="text-2xs text-[#E5DFC9] hover:underline font-mono">
                View Full Mastery →
              </Link>
            </div>

            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D]">
              <WeaknessChart catchRates={user?.weaknessCatchRates || {}} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
