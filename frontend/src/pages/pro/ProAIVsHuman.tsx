import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bot, CheckCircle2, Flame, ArrowRight, Shield, Sparkles, User
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockAIComparison } from '../../mock/battle'

export default function ProAIVsHuman() {
  const navigate = useNavigate()
  const data = mockAIComparison

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="navy" size="sm">BENCHMARK EVALUATION</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Reviewer vs. You
          </h1>
          <p className="text-sm text-slate leading-relaxed">
            Same codebase. Independent reviews. Compared to evaluate where human engineering judgment outpaces automated LLMs.
          </p>
        </div>

        {/* Two-Column Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Human Reviewer Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card dark className="p-6 border-aqua/40 bg-navy-surface space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aqua/20 border border-aqua/40 text-aqua flex items-center justify-center font-bold text-sm">
                    AF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Afrid Shaik</h3>
                    <span className="text-2xs text-slate">Human Reviewer</span>
                  </div>
                </div>
                <Badge variant="accent" size="sm">{data.human.found.length} Findings</Badge>
              </div>

              <div className="space-y-2">
                {data.human.found.map((item, i) => {
                  const isHumanOnly = data.humanOnly.includes(item)
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isHumanOnly
                          ? 'bg-warning-subtle/30 border-warning/40 text-warning font-semibold'
                          : 'bg-navy-midnight border-navy-border text-slate'
                      }`}
                    >
                      {isHumanOnly ? <Flame size={14} className="mt-0.5 flex-shrink-0 text-warning" /> : <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-aqua" />}
                      <span>{item}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Center VS Indicator */}
          <div className="lg:col-span-2 flex lg:flex-col items-center justify-center py-4">
            <div className="w-10 h-10 rounded-full bg-navy-surface border border-navy-border flex items-center justify-center text-xs font-bold text-slate">
              VS
            </div>
          </div>

          {/* AI Reviewer Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card dark className="p-6 border-navy-border bg-navy-surface space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-midnight border border-navy-border text-slate flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Scanner</h3>
                    <span className="text-2xs text-slate">Automated LLM Reviewer</span>
                  </div>
                </div>
                <Badge variant="navy" size="sm">{data.ai.found.length} Findings</Badge>
              </div>

              <div className="space-y-2">
                {data.ai.found.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-navy-midnight border border-navy-border text-xs text-slate flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-slate" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Special Callout: You caught something AI missed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border border-warning/40 bg-warning-subtle/20 space-y-3"
        >
          <div className="flex items-center gap-2 text-warning font-bold text-sm">
            <Flame size={18} />
            <span>🔥 You caught something the AI missed!</span>
          </div>

          <p className="text-xs text-white leading-relaxed">
            While the automated AI model flagged boilerplate token expiration, you recognized the <strong>subtle timing side-channel attack on password hash comparisons</strong>.
          </p>

          <p className="text-2xs text-slate">
            Key takeaway: Automated models detect generic syntax antipatterns, but human engineers understand architectural intent and covert execution channels.
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="dark"
            onClick={() => navigate('/pro/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/pro/review/pro-01')}
            iconRight={<ArrowRight size={16} />}
            className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
          >
            Start Next Review
          </Button>
        </div>
      </main>
    </div>
  )
}
