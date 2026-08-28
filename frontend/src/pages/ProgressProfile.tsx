import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, AlertTriangle, ArrowRight, Shield, Lock,
  Zap, GitBranch, Gauge, Sparkles, CheckCircle2
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Card, MetricCard } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useProgressStore } from '../store/progressStore'
import { mockImprovementData } from '../mock/progress'
import { defectClasses } from '../tokens'

const iconMap = {
  Shield,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Gauge,
}

export default function ProgressProfile() {
  const navigate = useNavigate()
  const { profile } = useProgressStore()

  const overall = profile.overall
  const catchRates = profile.catchRates

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Hero Metric */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <Badge variant="accent" size="sm" className="mb-2">Review Skill Profile</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Your Review Skill
          </h1>
          <p className="text-text-secondary mt-1 max-w-xl text-sm sm:text-base">
            Your strongest reviewers don’t just find issues. They know what they tend to miss.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-bg-surface p-4 rounded-2xl border border-border">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Overall Index</span>
            <div className="text-5xl font-extrabold tracking-tighter text-gradient-accent">
              {overall}%
            </div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="space-y-1 text-xs text-text-secondary">
            <p><span className="font-bold text-text-primary">{profile.exercisesCompleted}</span> reviews completed</p>
            <p><span className="font-bold text-success">+{profile.improvement}%</span> this month</p>
            <p><span className="font-bold text-warning">{profile.streak} days</span> current streak</p>
          </div>
        </div>
      </div>

      {/* Main Focus / Blind Spot Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-warning/30 bg-warning-subtle/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm" dot>YOUR CURRENT BLIND SPOT</Badge>
            <span className="text-xs text-text-muted font-mono">Catch rate: 43%</span>
          </div>
          <h3 className="text-xl font-bold text-text-primary">
            Error & Exception Handling
          </h3>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            You’ve missed 3 issues involving unchecked return values and swallowed async errors. Targeting this category will give you the highest immediate skill jump.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/practice?class=error-handling')}
          iconRight={<ArrowRight size={14} />}
          className="flex-shrink-0"
        >
          Practice This Weakness
        </Button>
      </motion.div>

      {/* Six Defect Classes Skill Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Skill by Defect Class</h2>
          <span className="text-xs text-text-muted">Click any category to practice</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defectClasses.map((cls) => {
            const data = catchRates[cls.id] || { rate: 50, trend: 0, attempts: 0, history: [50] }
            const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield
            const isWeakest = cls.id === 'error-handling'

            return (
              <Card
                key={cls.id}
                hover
                onClick={() => navigate(`/practice?class=${cls.id}`)}
                className={clsx(
                  'p-5 transition-all',
                  isWeakest && 'border-warning/40 bg-warning-subtle/10'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cls.color}15`, border: `1px solid ${cls.color}30` }}
                    >
                      <Icon size={16} style={{ color: cls.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{cls.label}</h4>
                      <p className="text-2xs text-text-muted">{data.attempts} exercises completed</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-text-primary">
                      {data.rate}%
                    </div>
                    <span className={clsx(
                      'text-2xs font-semibold',
                      data.trend >= 0 ? 'text-success' : 'text-danger'
                    )}>
                      {data.trend >= 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${data.rate}%`,
                      backgroundColor: isWeakest ? '#F5B94C' : cls.color,
                    }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Progress Over Time / Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend chart */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-text-primary">Review Catch-Rate Trajectory</h3>
              <p className="text-xs text-text-muted">Weekly aggregated performance</p>
            </div>
            <Badge variant="success" size="sm">+24% Total</Badge>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockImprovementData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B7CFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5B7CFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  stroke="#697282"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#697282"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[30, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151922',
                    border: '1px solid #242833',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F5F7FA',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#5B7CFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Milestone & Emotional Moment */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between bg-bg-surface border-border">
          <div>
            <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Proven Improvement
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              The Learning Loop in Action
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              When you first reviewed exercises with subtle logic and concurrency defects, you caught only 1 out of 3. After studying concept explanations, your latest attempts reached perfection.
            </p>

            <div className="space-y-3 bg-bg-secondary p-3.5 rounded-xl border border-border text-xs">
              <div className="flex justify-between items-center text-text-muted">
                <span>First 3 attempts:</span>
                <span className="font-mono font-semibold text-danger">1 / 3 caught (33%)</span>
              </div>
              <div className="flex justify-between items-center text-text-primary">
                <span>Latest 3 attempts:</span>
                <span className="font-mono font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={12} /> 3 / 3 caught (100%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <span className="text-sm font-bold text-success block">
              +67 percentage point gain on retried concepts.
            </span>
            <span className="text-2xs text-text-muted">
              Consistently verified by diff localization tests.
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
