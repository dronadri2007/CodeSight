import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Scan, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Shield, Lock, Zap, GitBranch, Gauge, Code2, Sparkles
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { defectClasses } from '../../tokens'
import { mockProExercises } from '../../mock/proExercises'

const iconMap = {
  Shield,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Gauge,
}

const groundTruthRisks = ['auth', 'injection', 'error-handling']

export default function ProCodeXRay() {
  const navigate = useNavigate()
  const exercise = mockProExercises[0]
  const [selectedRisks, setSelectedRisks] = useState<string[]>([])
  const [analyzed, setAnalyzed] = useState(false)

  const toggleRisk = (riskId: string) => {
    if (analyzed) return
    setSelectedRisks((prev) =>
      prev.includes(riskId) ? prev.filter((r) => r !== riskId) : [...prev, riskId]
    )
  }

  const handleAnalyze = () => {
    if (selectedRisks.length === 0) return
    setAnalyzed(true)
  }

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="navy" size="sm">ADVANCED MODE</Badge>
              <span className="text-xs text-slate">Architectural Risk Mapping</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Code X-Ray
            </h1>
            <p className="text-sm text-slate mt-1">
              Map the risk landscape before diving into individual mistakes.
            </p>
          </div>

          {analyzed && (
            <Button
              size="md"
              onClick={() => navigate(`/pro/review/${exercise.id}`)}
              iconRight={<ArrowRight size={14} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Start Line Inspection
            </Button>
          )}
        </div>

        {/* Code Viewport Preview */}
        <div className="rounded-xl border border-navy-border bg-navy-surface overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-navy-midnight/90 border-b border-navy-border text-xs font-mono text-slate">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-aqua" />
              <span>{exercise.repo}</span>
            </div>
            <span>{exercise.linesOfCode} lines of code</span>
          </div>

          <div className="p-4 font-mono text-xs text-slate bg-navy-midnight/50 max-h-56 overflow-y-auto leading-relaxed">
            <pre className="whitespace-pre">{exercise.code.slice(0, 800)}...</pre>
          </div>
        </div>

        {/* Risk Prediction Selector */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {analyzed ? 'X-Ray Structural Evaluation' : 'What risk areas deserve attention?'}
            </h2>
            <p className="text-xs text-slate mt-0.5">
              {analyzed
                ? 'Comparison of your structural predictions against ground-truth static risk analysis.'
                : 'Select the categories of vulnerability you suspect are present in this service.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {defectClasses.map((cls) => {
              const isSelected = selectedRisks.includes(cls.id)
              const isPresent = groundTruthRisks.includes(cls.id)
              const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield

              let cardStyle = 'border-navy-border bg-navy-surface text-slate'
              if (analyzed) {
                if (isSelected && isPresent) cardStyle = 'border-success/60 bg-success/15 text-white'
                else if (isSelected && !isPresent) cardStyle = 'border-danger/60 bg-danger/15 text-white'
                else if (!isSelected && isPresent) cardStyle = 'border-warning/60 bg-warning/15 text-white'
              } else if (isSelected) {
                cardStyle = 'border-aqua bg-aqua/10 text-white shadow-aqua-glow'
              }

              return (
                <div
                  key={cls.id}
                  onClick={() => toggleRisk(cls.id)}
                  className={`p-4 rounded-xl border transition-all select-none ${cardStyle} ${!analyzed ? 'cursor-pointer hover:border-aqua/40' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cls.color}15` }}
                      >
                        <Icon size={14} style={{ color: cls.color }} />
                      </div>
                      <span className="text-sm font-semibold text-white">{cls.label}</span>
                    </div>

                    {analyzed && (
                      <div>
                        {isSelected && isPresent && <CheckCircle2 size={16} className="text-success" />}
                        {isSelected && !isPresent && <XCircle size={16} className="text-danger" />}
                        {!isSelected && isPresent && <AlertTriangle size={16} className="text-warning" />}
                      </div>
                    )}
                  </div>
                  <p className="text-2xs text-slate">{cls.description}</p>
                </div>
              )
            })}
          </div>

          {!analyzed ? (
            <div className="pt-2 flex justify-end">
              <Button
                size="lg"
                disabled={selectedRisks.length === 0}
                onClick={handleAnalyze}
                icon={<Scan size={16} />}
                className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
              >
                Scan Architecture ({selectedRisks.length} Selected)
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-navy-border bg-navy-surface space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 text-aqua font-bold text-sm">
                <Sparkles size={16} />
                <span>Ground-Truth Vulnerability Diagnostics</span>
              </div>

              <div className="space-y-2 text-xs text-slate">
                <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                  <span className="font-bold text-success">Auth &amp; Access Control (Confirmed): </span>
                  Signature validation bypass and timing attacks on hash equality.
                </div>
                <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                  <span className="font-bold text-success">Injection / Input Validation (Confirmed): </span>
                  Raw string interpolation of user_id in user_perms lookup query.
                </div>
                <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                  <span className="font-bold text-success">Error &amp; Exception Handling (Confirmed): </span>
                  Unhandled NoneType subscript on missing database row records.
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <Button variant="dark" size="sm" onClick={() => setAnalyzed(false)}>
                  Reset Scan
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/pro/review/${exercise.id}`)}
                  iconRight={<ArrowRight size={14} />}
                  className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
                >
                  Proceed to Line-by-Line Review
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
