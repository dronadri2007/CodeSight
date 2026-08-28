import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Lock, AlertTriangle, Zap, GitBranch, Gauge,
  BookOpen, ArrowRight, CheckCircle
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useProgressStore } from '../store/progressStore'
import { mockConcepts } from '../mock/concepts'

const CLASS_META = [
  { id: 'injection', label: 'Injection / Input Validation', icon: Shield, color: '#FF5C6C', description: 'Unsanitized input reaching sensitive operations' },
  { id: 'auth', label: 'Auth & Access Control', icon: Lock, color: '#F5B94C', description: 'Authentication flaws and privilege issues' },
  { id: 'error-handling', label: 'Error & Exception Handling', icon: AlertTriangle, color: '#5B7CFF', description: 'Unchecked returns, swallowed exceptions' },
  { id: 'concurrency', label: 'Concurrency & State', icon: Zap, color: '#7C5CFF', description: 'Race conditions, shared mutable state' },
  { id: 'logic', label: 'Logic & Boundary', icon: GitBranch, color: '#36D399', description: 'Off-by-one errors, incorrect conditions' },
  { id: 'resource', label: 'Resource & Performance', icon: Gauge, color: '#A7AFBC', description: 'Memory leaks, N+1 queries, inefficient loops' },
]

export default function ConceptLibrary() {
  const navigate = useNavigate()
  const { profile, conceptsCompleted } = useProgressStore()

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Learn</h1>
        <p className="text-text-secondary mt-1">Understand the patterns behind what you miss.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLASS_META.map((cls, i) => {
          const Icon = cls.icon
          const catchData = profile.catchRates[cls.id]
          const rate = catchData?.rate ?? 0
          const hasConcept = mockConcepts.some(c => c.defectClassId === cls.id)
          const isCompleted = conceptsCompleted.includes(cls.id)

          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="group p-5 rounded-xl border border-border bg-bg-surface hover:border-border-strong transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cls.color}18`, border: `1px solid ${cls.color}30` }}
                  >
                    <Icon size={18} style={{ color: cls.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{cls.label}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{cls.description}</p>
                  </div>
                </div>
                {isCompleted && (
                  <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                )}
              </div>

              {catchData && (
                <div className="mb-4">
                  <ProgressBar
                    value={rate}
                    label={`Catch rate: ${rate}%`}
                    showValue
                    color={rate >= 70 ? 'success' : rate >= 50 ? 'accent' : 'warning'}
                  />
                  {catchData.attempts > 0 && (
                    <p className="text-2xs text-text-muted mt-1">{catchData.attempts} exercise{catchData.attempts !== 1 ? 's' : ''} attempted</p>
                  )}
                </div>
              )}

              {!hasConcept && (
                <Badge variant="muted" size="sm" className="mb-3">Coming soon</Badge>
              )}

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<BookOpen size={12} />}
                  disabled={!hasConcept}
                  onClick={() => navigate(`/learn/${cls.id}`)}
                >
                  Learn
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight size={12} />}
                  onClick={() => navigate(`/practice?class=${cls.id}`)}
                >
                  Practice
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
