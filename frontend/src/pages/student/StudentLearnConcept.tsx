import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle,
  ExternalLink, Code2, Sparkles, HelpCircle
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockConcepts } from '../../mock/concepts'

export default function StudentLearnConcept() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const concept = mockConcepts.find((c) => c.defectClassId === conceptId) || mockConcepts[0]
  const [completed, setCompleted] = useState(false)

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-3 pb-6 border-b border-navy-border">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">CONCEPT DEEP DIVE</Badge>
            <Badge variant="navy" size="sm">{concept.language}</Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {concept.title}
          </h1>
          <p className="text-sm text-slate leading-relaxed">
            {concept.description}
          </p>
        </div>

        {/* Section 1: What goes wrong? */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <span>What goes wrong?</span>
          </h2>
          <p className="text-xs text-slate leading-relaxed whitespace-pre-line bg-navy-surface p-5 rounded-2xl border border-navy-border">
            {concept.what}
          </p>
        </div>

        {/* Section 2: Code Comparison (Vulnerable vs Safer) */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Understand the pattern</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vulnerable Panel */}
            <div className="rounded-2xl border border-danger/30 bg-navy-surface overflow-hidden">
              <div className="px-4 py-2.5 bg-danger/10 border-b border-danger/20 flex items-center justify-between text-xs font-semibold text-danger">
                <span>Vulnerable Pattern</span>
                <Badge variant="danger" size="sm">Antipattern</Badge>
              </div>
              <div className="p-4 font-mono text-xs text-slate bg-navy-midnight/80 overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre">{concept.vulnerableCode}</pre>
              </div>
            </div>

            {/* Safer Panel */}
            <div className="rounded-2xl border border-success/30 bg-navy-surface overflow-hidden">
              <div className="px-4 py-2.5 bg-success/10 border-b border-success/20 flex items-center justify-between text-xs font-semibold text-success">
                <span>Safer Production Pattern</span>
                <Badge variant="success" size="sm">Recommended</Badge>
              </div>
              <div className="p-4 font-mono text-xs text-slate bg-navy-midnight/80 overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre">{concept.saferCode}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Why This Matters */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Why this matters in production</h2>
          <p className="text-xs text-slate leading-relaxed bg-navy-surface p-5 rounded-2xl border border-navy-border">
            {concept.whyItMatters}
          </p>
        </div>

        {/* Section 4: Common Pattern to Watch For */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Common pattern to watch for</h2>
          <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border font-mono text-xs text-aqua leading-relaxed whitespace-pre-line">
            {concept.commonPattern}
          </div>
        </div>

        {/* Curated Resource */}
        <div className="p-5 rounded-2xl bg-navy-surface border border-navy-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold block">
              CURATED LEARNING RESOURCE
            </span>
            <h4 className="text-sm font-bold text-white">{concept.resourceTitle}</h4>
            <p className="text-xs text-slate">Recommended reading from the official documentation</p>
          </div>
          <a
            href={concept.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <Button size="sm" variant="dark" iconRight={<ExternalLink size={12} />}>
              View Resource
            </Button>
          </a>
        </div>

        {/* Concept Completion & Mini-Check Banner */}
        <Card dark className="p-6 border-aqua/40 bg-aqua/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-aqua-glow">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-aqua font-bold text-sm">
              <CheckCircle2 size={16} />
              <span>Concept Completed</span>
            </div>
            <p className="text-xs text-slate">
              Want to test what you learned with a quick 3-question micro-check?
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              size="md"
              onClick={() => navigate(`/student/learn/${concept.defectClassId}/check`)}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Answer 3 Questions
            </Button>
            <Button
              size="md"
              variant="dark"
              onClick={() => navigate('/student/practice')}
            >
              Skip to Practice
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
