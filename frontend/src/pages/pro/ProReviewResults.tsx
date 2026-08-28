import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, BookOpen,
  RotateCcw, Shield, Sparkles, Code2, Flame, Eye
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockProExercises } from '../../mock/proExercises'

export default function ProReviewResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const exercise = mockProExercises.find((e) => e.id === id) || mockProExercises[0]

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-aqua">
              Professional Track · Review Evaluation Report
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Review Quality Report
            </h1>
            <p className="text-xs text-slate mt-0.5 font-mono">
              Target: {exercise.repo}
            </p>
          </div>

          <Badge variant="success" size="md">
            Verified Review Assessment
          </Badge>
        </div>

        {/* Hero Score Card */}
        <Card dark className="p-8 border-navy-border bg-navy-surface shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div>
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold block mb-1">
                Review Quality Index
              </span>
              <div className="text-5xl font-extrabold font-mono text-gradient-aqua">
                86%
              </div>
              <span className="text-2xs text-success font-semibold mt-1 block">Top 5% Precision</span>
            </div>

            <div className="sm:border-l border-navy-border sm:pl-6 space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold block">
                Correct Findings
              </span>
              <span className="text-3xl font-bold font-mono text-success">4</span>
              <span className="text-2xs text-slate block">Out of 5 Ground Truth</span>
            </div>

            <div className="sm:border-l border-navy-border sm:pl-6 space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold block">
                Missed Issues
              </span>
              <span className="text-3xl font-bold font-mono text-warning">1</span>
              <span className="text-2xs text-slate block">Minor Privilege Edge Case</span>
            </div>

            <div className="sm:border-l border-navy-border sm:pl-6 space-y-1">
              <span className="text-2xs uppercase tracking-wider text-slate font-semibold block">
                False Positives
              </span>
              <span className="text-3xl font-bold font-mono text-white">0</span>
              <span className="text-2xs text-success font-semibold block">Zero Groundless Flags</span>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-navy-surface border border-navy-border text-center">
            <span className="text-2xs text-slate uppercase block mb-1">Security / Injection</span>
            <span className="text-lg font-bold font-mono text-success">92%</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-surface border border-navy-border text-center">
            <span className="text-2xs text-slate uppercase block mb-1">Auth &amp; Access</span>
            <span className="text-lg font-bold font-mono text-aqua">81%</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-surface border border-navy-border text-center">
            <span className="text-2xs text-slate uppercase block mb-1">Error Handling</span>
            <span className="text-lg font-bold font-mono text-warning">70%</span>
          </div>
          <div className="p-4 rounded-xl bg-navy-surface border border-navy-border text-center">
            <span className="text-2xs text-slate uppercase block mb-1">Performance</span>
            <span className="text-lg font-bold font-mono text-slate">64%</span>
          </div>
        </div>

        {/* What You Caught vs What You Missed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What You Caught */}
          <Card dark className="p-6 border-success/30 bg-navy-surface space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" /> What You Caught
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                <span className="font-semibold text-white block">Lines 66–67: Password Hash Timing Attack</span>
                <span className="text-slate text-2xs">Caught standard string comparison on secret digest.</span>
              </div>
              <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                <span className="font-semibold text-white block">Lines 47–49: SQL Query Concatenation</span>
                <span className="text-slate text-2xs">Identified raw user_id formatted directly into SQL query.</span>
              </div>
              <div className="p-3 rounded-lg bg-navy-midnight border border-navy-border">
                <span className="font-semibold text-white block">Lines 62–63: Unhandled User Subscript</span>
                <span className="text-slate text-2xs">Flagged potential NoneType TypeError on user record check.</span>
              </div>
            </div>
          </Card>

          {/* What You Missed */}
          <Card dark className="p-6 border-warning/30 bg-navy-surface space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> What You Missed
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-warning-subtle/20 border border-warning/30">
                <span className="font-semibold text-white block">Lines 80–83: Unchecked Admin Privilege Elevation</span>
                <span className="text-slate text-2xs">
                  The <code className="text-aqua font-mono">elevate_user()</code> endpoint parses token validity but never checks if the caller possesses admin authorization.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Why It Mattered & Pattern to Watch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card dark className="p-6 space-y-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate font-semibold block">
              WHY THIS MATTERS
            </span>
            <h4 className="text-sm font-bold text-white">Privilege Escalation vectors in microservices</h4>
            <p className="text-xs text-slate leading-relaxed">
              In API gateways, valid authentication does not equal authorization. Any authenticated user with a valid standard token could elevate arbitrary user accounts to administrator status.
            </p>
          </Card>

          <Card dark className="p-6 space-y-2 border-aqua/30">
            <span className="text-2xs font-mono uppercase tracking-wider text-aqua font-semibold block">
              PATTERN TO WATCH NEXT TIME
            </span>
            <h4 className="text-sm font-bold text-white">Always trace caller claims on mutating endpoints</h4>
            <p className="text-xs text-slate leading-relaxed">
              When reviewing administrative endpoints, ensure the logic checks <code className="text-aqua font-mono">user_data.get('is_admin')</code> before executing state changes.
            </p>
          </Card>
        </div>

        {/* Unified Patch Diff */}
        <Card dark className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 size={16} className="text-aqua" /> The Production Fix Patch
            </h4>
            <span className="text-2xs text-slate font-mono">git diff</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-midnight border border-navy-border font-mono text-xs overflow-x-auto leading-relaxed">
            <div className="text-danger">- query = f"SELECT permission FROM user_perms WHERE user_id = '&#123;user_id&#125;'"</div>
            <div className="text-success">+ query = "SELECT permission FROM user_perms WHERE user_id = %s"</div>
            <div className="text-success">+ cursor.execute(query, (user_id,))</div>
            <div className="text-slate">...</div>
            <div className="text-danger">- if user['password_hash'] == computed_hash:</div>
            <div className="text-success">+ if user and hmac.compare_digest(user['password_hash'], computed_hash):</div>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-navy-border">
          <Button variant="dark" onClick={() => navigate('/pro/dashboard')}>
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="dark"
              onClick={() => navigate('/pro/versus')}
              icon={<Eye size={14} />}
            >
              Benchmark vs AI
            </Button>
            <Button
              onClick={() => navigate('/pro/review/pro-01')}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Review Next Codebase
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
