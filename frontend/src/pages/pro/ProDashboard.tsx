import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Code2, ArrowRight, Play, Eye, Sparkles,
  AlertTriangle, CheckCircle2, Clock, Scan, Swords
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card, MetricCard } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { mockProExercises } from '../../mock/proExercises'

export default function ProDashboard() {
  const navigate = useNavigate()
  const primaryEx = mockProExercises[0]

  return (
    <div className="min-h-screen bg-light-bg text-light-text flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-light-border">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-aqua">
              Professional Track · AI-Assisted Code Review
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Review with confidence.
            </h1>
            <p className="text-sm text-light-textSecondary max-w-xl">
              AI can write the code. You still need to know whether it is safe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/pro/review/pro-01')}
              iconRight={<ArrowRight size={16} />}
            >
              Start a Review
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/pro/xray')}
              icon={<Scan size={16} />}
            >
              Code X-Ray
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Review Precision" value="86%" trend={8} subtext="Critical defect accuracy" />
          <MetricCard label="False Positives" value="0" subtext="Groundless flags recorded" />
          <MetricCard label="Code Inspected" value="2,410" subtext="Production lines audited" />
          <MetricCard label="AI Differential" value="+3" subtext="Edge cases caught vs AI" />
        </div>

        {/* Featured Enterprise Review Case */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 border-light-border bg-light-card relative overflow-hidden shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-light-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">ACTIVE REVIEW CASE</Badge>
                  <Badge variant="warning" size="sm">Auth &amp; Access Control</Badge>
                </div>
                <h3 className="text-2xl font-extrabold text-navy">{primaryEx.title}</h3>
                <p className="text-xs text-light-textMuted font-mono">{primaryEx.repo} · {primaryEx.linesOfCode} lines of code</p>
                <p className="text-xs text-light-textSecondary max-w-2xl leading-relaxed pt-1">
                  {primaryEx.architecturalOverview}
                </p>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate(`/pro/review/${primaryEx.id}`)}
                iconRight={<ArrowRight size={16} />}
                className="flex-shrink-0"
              >
                Inspect Codebase
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-light-textSecondary">
              <div className="p-3.5 rounded-xl bg-light-elevated border border-light-border">
                <span className="font-semibold text-navy block mb-1">Risk Profile:</span>
                <span>Contains timing attack and unparameterized SQL vulnerabilities.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-light-elevated border border-light-border">
                <span className="font-semibold text-navy block mb-1">Review Goal:</span>
                <span>Flag suspect line numbers and provide justification notes.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-light-elevated border border-light-border">
                <span className="font-semibold text-navy block mb-1">Evaluator:</span>
                <span>Graded on localization precision, severity, and explanation rigor.</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            hover
            onClick={() => navigate('/pro/xray')}
            className="p-6 border-light-border bg-light-card flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-aqua-soft text-navy flex items-center justify-center mb-4">
                <Scan size={20} />
              </div>
              <h4 className="text-base font-bold text-navy group-hover:text-aqua transition-colors mb-2">
                Code X-Ray
              </h4>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                Survey the architectural risk landscape across 6 vulnerability archetypes before line inspection.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-light-border flex items-center justify-between text-2xs font-semibold text-navy">
              <span>Run X-Ray Scan</span>
              <ArrowRight size={12} />
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate('/pro/versus')}
            className="p-6 border-light-border bg-light-card flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-warning-subtle text-warning flex items-center justify-center mb-4">
                <Eye size={20} />
              </div>
              <h4 className="text-base font-bold text-navy group-hover:text-warning transition-colors mb-2">
                AI Reviewer vs. You
              </h4>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                Benchmark your human review instincts side-by-side against automated AI scanner findings.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-light-border flex items-center justify-between text-2xs font-semibold text-navy">
              <span>View Benchmark</span>
              <ArrowRight size={12} />
            </div>
          </Card>

          <Card
            hover
            onClick={() => navigate('/pro/false-positive')}
            className="p-6 border-light-border bg-light-card flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-danger-subtle text-danger flex items-center justify-center mb-4">
                <Shield size={20} />
              </div>
              <h4 className="text-base font-bold text-navy group-hover:text-danger transition-colors mb-2">
                False Positive Trainer
              </h4>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                "Don't Over-Review" — Learn to differentiate unfamiliar valid crypto helpers from true security flaws.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-light-border flex items-center justify-between text-2xs font-semibold text-navy">
              <span>Start Challenge</span>
              <ArrowRight size={12} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
