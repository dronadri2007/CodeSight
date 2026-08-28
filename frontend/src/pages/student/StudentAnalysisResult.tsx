import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, ArrowRight, BookOpen, RotateCcw,
  Sparkles, ShieldAlert, Zap, TrendingUp, Lightbulb
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockStudentExercises } from '../../mock/studentExercises'

export default function StudentAnalysisResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const exercise = mockStudentExercises.find((e) => e.id === id) || mockStudentExercises[0]

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-aqua">
              CodeSight Analysis Engine
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Here’s what we found.
            </h1>
            <p className="text-xs text-slate mt-0.5">
              Automated cognitive analysis on {exercise.title}
            </p>
          </div>

          <Badge variant="warning" size="md">
            Defect Pattern Identified
          </Badge>
        </div>

        {/* Strengths & Weak Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STRENGTHS */}
          <Card dark className="p-6 border-success/30 bg-navy-surface space-y-4">
            <div className="flex items-center gap-2 text-success font-semibold text-xs uppercase tracking-wider">
              <CheckCircle2 size={16} /> Strengths
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">Logic &amp; Boundary</span>
                  <Badge variant="success" size="sm">Strong</Badge>
                </div>
                <p className="text-xs text-slate">
                  Your parameter binding and query string assembly adhered cleanly to best practices.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">Code Structure</span>
                  <Badge variant="success" size="sm">Clean</Badge>
                </div>
                <p className="text-xs text-slate">
                  Clean dictionary unpacking and descriptive naming conventions.
                </p>
              </div>
            </div>
          </Card>

          {/* WEAK AREAS */}
          <Card dark className="p-6 border-warning/30 bg-navy-surface space-y-4">
            <div className="flex items-center gap-2 text-warning font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} /> Weak Areas
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-warning-subtle/20 border border-warning/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">Error &amp; Exception Handling</span>
                  <Badge variant="warning" size="sm">Needs Work</Badge>
                </div>
                <p className="text-xs text-slate">
                  You assumed database cursors always return valid tuples and did not verify <code className="text-aqua">if row is None</code> before accessing index 0.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-white">Injection / Input Validation</span>
                  <Badge variant="navy" size="sm">Developing</Badge>
                </div>
                <p className="text-xs text-slate">
                  Initial parameter handling was valid, but missing explicit string length bounds.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Patterns We Noticed */}
        <Card dark className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-aqua font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} /> Patterns We Noticed in Your Coding
          </div>
          <p className="text-sm text-slate leading-relaxed">
            “You frequently write code that functions correctly in the <strong>happy path</strong>, but omit guards against empty collections, database query timeouts, and nil return values. This is the #1 cause of unhandled 500 exceptions in production services.”
          </p>
        </Card>

        {/* Why This Matters */}
        <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-2">
          <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold block">
            WHY THIS MATTERS
          </span>
          <h3 className="text-base font-bold text-white">
            Silent failures turn into production outages.
          </h3>
          <p className="text-xs text-slate leading-relaxed">
            When an unhandled <code className="text-aqua font-mono">NoneType</code> subscript occurs in an async worker, the task crashes silently without rolling back transactions or notifying consumers, resulting in orphaned state.
          </p>
        </div>

        {/* Next Step / Action Callout */}
        <div className="p-6 rounded-2xl border border-aqua/40 bg-aqua/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-aqua-glow">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-aqua block">
              RECOMMENDED NEXT STEP
            </span>
            <h4 className="text-lg font-bold text-white">
              Learn Defensive Error &amp; Exception Handling
            </h4>
            <p className="text-xs text-slate">
              Master the pattern behind safe return checks and explicit exception models.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="dark"
              size="lg"
              onClick={() => navigate('/student/learn/error-handling')}
              icon={<BookOpen size={14} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Learn This Concept
            </Button>
            <Button
              variant="dark"
              size="lg"
              onClick={() => navigate('/student/practice')}
              icon={<RotateCcw size={14} />}
            >
              Try Another
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
