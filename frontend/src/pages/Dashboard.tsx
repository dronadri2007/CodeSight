import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, ArrowRight, Clock, TrendingUp, CheckCircle2, XCircle, ChevronRight, Flame } from 'lucide-react'
import { clsx } from 'clsx'
import { MetricCard } from '../components/ui/Card'
import { SkillBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Badge, DifficultyBadge, StatusBadge } from '../components/ui/Badge'
import { useProgressStore } from '../store/progressStore'
import { mockRecentAttempts } from '../mock/progress'
import { getExerciseById } from '../mock/exercises'

const fadeUp: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

const skillClasses = [
  { id: 'logic', name: 'Logic & Boundary' },
  { id: 'injection', name: 'Injection' },
  { id: 'resource', name: 'Resource' },
  { id: 'auth', name: 'Auth' },
  { id: 'concurrency', name: 'Concurrency' },
  { id: 'error-handling', name: 'Error Handling' },
]

function getSkillColor(rate: number) {
  if (rate >= 75) return '#36D399'
  if (rate >= 55) return '#F5B94C'
  return '#FF5C6C'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useProgressStore()
  const recommendedEx = getExerciseById('ex-05')

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Good afternoon, Afrid
          </h1>
          <p className="text-text-secondary mt-1">Ready for your next review?</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-bg-surface text-text-muted hover:text-text-primary hover:border-border-strong transition-all duration-150">
            <Bell size={16} />
          </button>
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold select-none">
            AF
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
      >
        <MetricCard label="Review Skill" value={profile.overall} accent />
        <MetricCard label="Exercises Reviewed" value={profile.exercisesCompleted} />
        <MetricCard label="Current Streak" value={profile.streak} subtext="days" />
        <MetricCard label="Improvement" value={`+${profile.improvement}%`} trend={profile.improvement} />
      </motion.div>

      {/* Focus Card */}
      <motion.div
        className="rounded-xl border border-accent/40 bg-accent/5 p-5"
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fadeUp}
      >
        <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-2">
          Your Focus Today
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Error &amp; Exception Handling</h2>
            <p className="text-text-secondary text-sm mt-1">
              You've missed 3 issues involving unchecked return values.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              icon={<Flame size={14} />}
              onClick={() => navigate('/practice?class=error-handling')}
            >
              Practice This Weakness
            </Button>
            <button
              onClick={() => navigate('/progress')}
              className="text-sm text-text-muted hover:text-accent transition-colors duration-150 flex items-center gap-1 whitespace-nowrap"
            >
              See all weaknesses <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Skill Bars */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={3}
        variants={fadeUp}
      >
        <h2 className="text-base font-semibold text-text-primary mb-3">Review Skill by Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {skillClasses.map((cls) => {
            const data = profile.catchRates[cls.id]
            if (!data) return null
            return (
              <SkillBar
                key={cls.id}
                name={cls.name}
                value={data.rate}
                trend={data.trend}
                attempts={data.attempts}
                color={getSkillColor(data.rate)}
                onClick={() => navigate(`/practice?class=${cls.id}`)}
              />
            )
          })}
        </div>
      </motion.section>

      {/* Recent Attempts */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={4}
        variants={fadeUp}
      >
        <h2 className="text-base font-semibold text-text-primary mb-3">Recent Attempts</h2>
        <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
          {mockRecentAttempts.map((attempt, idx) => {
            const daysAgo = idx + 2
            return (
              <button
                key={attempt.exerciseId}
                onClick={() => navigate(`/practice/${attempt.exerciseId}`)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150 hover:bg-bg-elevated',
                  idx < mockRecentAttempts.length - 1 && 'border-b border-border'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                      attempt.caught ? 'bg-success/10' : 'bg-danger/10'
                    )}
                  >
                    {attempt.caught ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : (
                      <XCircle size={14} className="text-danger" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{attempt.title}</p>
                    <p className="text-xs text-text-muted">{daysAgo} days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="muted">{attempt.defectClass}</Badge>
                  <span
                    className={clsx(
                      'text-sm font-bold font-mono tabular-nums w-8 text-right',
                      attempt.score >= 70 ? 'text-success' : 'text-danger'
                    )}
                  >
                    {attempt.score}
                  </span>
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </button>
            )
          })}
        </div>
      </motion.section>

      {/* Recommended Exercise */}
      {recommendedEx && (
        <motion.section
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeUp}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Recommended
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-bg-surface p-4 hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-muted">#{recommendedEx.number}</span>
                  <StatusBadge status={recommendedEx.status} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{recommendedEx.title}</h3>
                <p className="text-xs text-text-muted font-mono">{recommendedEx.repo}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default">{recommendedEx.language}</Badge>
                  <Badge variant="accent">{recommendedEx.defectClass}</Badge>
                  <DifficultyBadge difficulty={recommendedEx.difficulty} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={11} />
                  <span>~{recommendedEx.estimatedMinutes} min</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                iconRight={<ArrowRight size={14} />}
                onClick={() => navigate('/practice/ex-05')}
                className="shrink-0 self-start"
              >
                Start Review
              </Button>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}
