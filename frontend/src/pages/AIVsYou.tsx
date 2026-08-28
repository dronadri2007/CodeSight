import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, CheckCircle, User, Flame, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { mockAIComparison } from '../mock/battle'

export default function AIVsYou() {
  const navigate = useNavigate()
  const data = mockAIComparison

  const humanOnlyCount = data.humanOnly.length
  const aiOnlyCount = data.aiOnly.length
  const agreedCount = data.agreed.length

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Human vs AI Reviewer</h1>
        <p className="text-text-secondary">Can you review code better than your second reviewer?</p>
        <p className="text-xs text-text-muted mt-1">Same exercise. Independent review. Compared after.</p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-0 items-start mb-8">
        {/* Human column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 rounded-xl border border-border bg-bg-surface space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white">
              {data.human.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{data.human.name}</p>
              <p className="text-xs text-text-muted">Human Reviewer</p>
            </div>
            <Badge variant="success" size="sm" className="ml-auto">{data.human.found.length} found</Badge>
          </div>

          <div className="space-y-2">
            {data.human.found.map((item, i) => {
              const isHumanOnly = data.humanOnly.includes(item)
              const isAgreed = data.agreed.includes(item)
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex items-start gap-2 p-2.5 rounded-lg border text-sm',
                    isHumanOnly
                      ? 'bg-warning-subtle border-warning/30 text-warning'
                      : isAgreed
                        ? 'bg-success-subtle border-success/30 text-success'
                        : 'bg-bg-elevated border-border text-text-secondary'
                  )}
                >
                  {isHumanOnly ? <Flame size={14} className="flex-shrink-0 mt-0.5" /> : <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />}
                  <span>{item}</span>
                  {isHumanOnly && <Badge variant="warning" size="sm" className="ml-auto whitespace-nowrap">You only</Badge>}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* VS divider */}
        <div className="flex lg:flex-col items-center justify-center px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-bold text-text-muted">
            VS
          </div>
        </div>

        {/* AI column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 rounded-xl border border-border bg-bg-surface space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center">
              <Bot size={18} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">AI Reviewer</p>
              <p className="text-xs text-text-muted">Automated analysis</p>
            </div>
            <Badge variant="accent" size="sm" className="ml-auto">{data.ai.found.length} found</Badge>
          </div>

          <div className="space-y-2">
            {data.ai.found.map((item, i) => {
              const isAIOnly = data.aiOnly.includes(item)
              const isAgreed = data.agreed.includes(item)
              return (
                <div
                  key={i}
                  className={clsx(
                    'flex items-start gap-2 p-2.5 rounded-lg border text-sm',
                    isAgreed
                      ? 'bg-success-subtle border-success/30 text-success'
                      : isAIOnly
                        ? 'bg-accent-subtle border-accent/20 text-accent'
                        : 'bg-bg-elevated border-border text-text-secondary'
                  )}
                >
                  <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                  {isAIOnly && <Badge variant="muted" size="sm" className="ml-auto whitespace-nowrap">AI only</Badge>}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.human.found.length}</p>
            <p className="text-xs text-text-muted mt-1">You found</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{data.ai.found.length}</p>
            <p className="text-xs text-text-muted mt-1">AI found</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{agreedCount}</p>
            <p className="text-xs text-text-muted mt-1">Agreed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{humanOnlyCount}</p>
            <p className="text-xs text-text-muted mt-1">You found, AI missed</p>
          </div>
        </div>
      </Card>

      {/* Special callout */}
      {humanOnlyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-5 rounded-xl border border-warning/30 bg-warning-subtle"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-warning" />
            <p className="text-base font-bold text-text-primary">You caught something the AI missed!</p>
          </div>
          <div className="space-y-1 mb-3">
            {data.humanOnly.map((item, i) => (
              <p key={i} className="text-sm text-text-secondary pl-6">{item}</p>
            ))}
          </div>
          <p className="text-sm text-text-secondary pl-6">
            Human reviewers catch context-specific bugs that AI misses. Keep building that instinct.
          </p>
        </motion.div>
      )}

      <p className="text-center text-xs text-text-muted mb-6">
        AI reviewers see patterns. Human reviewers understand intent. Both matter.
      </p>

      <div className="flex justify-center gap-3">
        <Button
          size="lg"
          icon={<ArrowRight size={16} />}
          onClick={() => navigate('/practice')}
        >
          Try Another Exercise
        </Button>
      </div>
    </div>
  )
}
