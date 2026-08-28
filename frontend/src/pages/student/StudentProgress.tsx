import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, AlertTriangle, ArrowRight, Shield, Lock,
  Zap, GitBranch, Gauge, Sparkles, CheckCircle2, Trophy
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SkillBar } from '../../components/ui/ProgressBar'
import { defectClasses } from '../../tokens'

const improvementData = [
  { period: 'Week 1', score: 44 },
  { period: 'Week 2', score: 52 },
  { period: 'Week 3', score: 61 },
  { period: 'Week 4', score: 68 },
  { period: 'Week 5 (Current)', score: 72 },
]

export default function StudentProgress() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-aqua">
              Student Track · Retention Analytics
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Your Coding Skill Trajectory
            </h1>
            <p className="text-sm text-slate mt-0.5">
              Track objective mastery gains across all defect archetypes.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-navy-surface p-4 rounded-xl border border-navy-border">
            <span className="text-2xs uppercase text-slate font-semibold">Overall Index:</span>
            <span className="text-3xl font-extrabold font-mono text-gradient-aqua">72%</span>
          </div>
        </div>

        {/* Milestone Card: First vs Recent Attempts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-aqua/30 bg-navy-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                <Sparkles size={12} className="inline mr-1" />
                VERIFIED IMPROVEMENT MILESTONE
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white">
              You improved by 28 percentage points on retried concepts.
            </h2>
            <p className="text-xs text-slate max-w-xl leading-relaxed">
              When tackling error-handling and boundary edge cases initially, you caught only 1 out of 3 pitfalls. After completing concept deep dives, your retention reached 100%.
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border flex items-center gap-3">
                <span className="text-slate">First Attempts:</span>
                <span className="font-mono font-bold text-danger">1 / 3 Solved (33%)</span>
              </div>
              <div className="p-3 rounded-lg bg-navy-midnight border border-success/30 flex items-center gap-3">
                <span className="text-slate">Recent Retries:</span>
                <span className="font-mono font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={13} /> 3 / 3 Solved (100%)
                </span>
              </div>
            </div>
          </div>

          <Button
            size="md"
            onClick={() => navigate('/student/practice')}
            className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none flex-shrink-0"
          >
            Practice Next Challenge
          </Button>
        </motion.div>

        {/* Area Chart & Six Class Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart */}
          <Card dark className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Skill Index Growth Over Time</h3>
              <Badge variant="success" size="sm">+28% Gain</Badge>
            </div>

            <div className="h-[220px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={improvementData}>
                  <defs>
                    <linearGradient id="aquaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20C7D9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#20C7D9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#516173" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#516173" fontSize={11} tickLine={false} axisLine={false} domain={[30, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07111D',
                      border: '1px solid #1E2C3D',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#FFFFFF',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#20C7D9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aquaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Learning Roadmap Recommendations */}
          <Card dark className="lg:col-span-5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Recommended Learning Roadmap</h3>
            <div className="space-y-3">
              {[
                { num: '1', title: 'Error & Exception Handling', reason: 'Current blind spot · 43% mastery', time: '15 mins', id: 'error-handling' },
                { num: '2', title: 'Auth & Access Control', reason: 'Timing attack prevention · 61% mastery', time: '12 mins', id: 'auth' },
                { num: '3', title: 'Concurrency & State', reason: 'Race condition synchronization · 55% mastery', time: '20 mins', id: 'concurrency' },
              ].map((step) => (
                <div
                  key={step.num}
                  className="p-3 rounded-xl bg-navy-midnight border border-navy-border flex items-center justify-between hover:border-aqua/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-aqua-soft text-navy font-bold font-mono text-2xs flex items-center justify-center">
                      {step.num}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{step.title}</p>
                      <p className="text-2xs text-slate">{step.reason}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => navigate(`/student/learn/${step.id}`)}
                    className="text-2xs"
                  >
                    Learn
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
