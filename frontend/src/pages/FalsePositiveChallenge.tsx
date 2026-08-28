import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, HelpCircle, Code2, Flag
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useUIStore } from '../store/uiStore'

const codeSnippet = `import hashlib
import secrets
from typing import Optional

SALT_LENGTH = 32

def generate_salt() -> bytes:
    """Generates a cryptographically secure random salt."""
    return secrets.token_bytes(SALT_LENGTH)

def hash_password(password: str, salt: bytes) -> str:
    """Derives a salted SHA-256 digest."""
    combined = password.encode('utf-8') + salt
    return hashlib.sha256(combined).hexdigest()

def verify_password(password: str, stored_hash: str, salt: bytes) -> bool:
    """Verifies a user password against the stored digest."""
    computed = hash_password(password, salt)
    return computed == stored_hash

def create_user_record(username: str, password: str) -> dict:
    """Packages a new user record with generated salt."""
    salt = generate_salt()
    hashed = hash_password(password, salt)
    return {
        'username': username,
        'password_hash': hashed,
        'salt': salt.hex()
    }`

const codeLines = codeSnippet.split('\n')

export default function FalsePositiveChallenge() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [flaggedLines, setFlaggedLines] = useState<number[]>([])
  const [explanation, setExplanation] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleFlagLine = (lineNum: number) => {
    if (submitted) return
    setFlaggedLines((prev) =>
      prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum].sort((a, b) => a - b)
    )
  }

  const handleSubmit = () => {
    if (flaggedLines.length > 0 && explanation.trim().length === 0) {
      showToast('Please provide your justification for the flagged lines.', 'error')
      return
    }
    setSubmitted(true)
  }

  const handleReset = () => {
    setFlaggedLines([])
    setExplanation('')
    setSubmitted(false)
  }

  const isCleanSubmission = flaggedLines.length === 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning" size="sm">Challenge Mode</Badge>
            <span className="text-xs text-text-muted">Don’t Over-Review</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            False Positive Challenge
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Not all unfamiliar or custom code has a defect. Flag only lines with concrete evidence.
          </p>
        </div>

        {submitted && (
          <Button variant="secondary" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
            Try Again
          </Button>
        )}
      </div>

      {/* Instructions Card */}
      {!submitted && (
        <div className="p-4 rounded-xl border border-border bg-bg-surface flex items-start gap-3 text-xs text-text-secondary leading-relaxed">
          <HelpCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-primary">Review Rule: </span>
            This file may be completely valid and safe. If you believe there is a security or logic defect, click the line to flag it and explain why. If the code is sound, submit with 0 flagged lines.
          </div>
        </div>
      )}

      {/* Code Viewer Panel */}
      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border-b border-border text-xs font-mono text-text-muted">
          <div className="flex items-center gap-2">
            <Code2 size={14} />
            <span>auth_helpers.py</span>
          </div>
          <span>Python</span>
        </div>

        <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto select-none bg-bg-primary/40">
          {codeLines.map((line, idx) => {
            const lineNum = idx + 1
            const isFlagged = flaggedLines.includes(lineNum)

            return (
              <div
                key={lineNum}
                onClick={() => toggleFlagLine(lineNum)}
                className={clsx(
                  'flex items-center group py-0.5 px-2 rounded cursor-pointer transition-colors',
                  isFlagged
                    ? 'bg-danger-subtle border-l-2 border-danger text-text-primary'
                    : 'hover:bg-bg-elevated text-text-secondary'
                )}
              >
                <span className={clsx(
                  'w-8 text-right mr-4 select-none',
                  isFlagged ? 'text-danger font-bold' : 'text-text-muted group-hover:text-text-secondary'
                )}>
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">{line}</span>
                {isFlagged && (
                  <Flag size={12} className="text-danger ml-2 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Review & Verdict Panel */}
      {!submitted ? (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Your Review Decision</h3>
            <span className="text-xs text-text-muted font-mono">
              {flaggedLines.length === 0 ? 'No lines flagged (Verdict: Clean)' : `${flaggedLines.length} line(s) flagged`}
            </span>
          </div>

          {flaggedLines.length > 0 && (
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-2 font-semibold">
                Justification for Flagged Lines ({flaggedLines.map((l) => `L${l}`).join(', ')}):
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the specific vulnerability or failure mode you believe is present..."
                rows={3}
                className="w-full bg-bg-secondary border border-border rounded-lg p-3 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-text-muted">
              {flaggedLines.length === 0
                ? 'Submitting with 0 flags asserts the code is clean.'
                : 'Submitting flags will grade precision.'}
            </span>
            <Button
              variant={flaggedLines.length === 0 ? 'success' : 'primary'}
              size="md"
              onClick={handleSubmit}
            >
              {flaggedLines.length === 0 ? 'Confirm Code is Clean' : 'Submit Review Findings'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Result / Teaching Feedback */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {isCleanSubmission ? (
            <div className="p-6 rounded-2xl border border-success/30 bg-success-subtle/30 flex items-start gap-4">
              <CheckCircle2 size={28} className="text-success flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary">
                  ✅ Clean Code — Accurate Assessment!
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Excellent discipline. You resisted the urge to flag unfamiliar code.
                  This module properly uses <code className="text-text-primary font-mono bg-bg-secondary px-1 py-0.5 rounded">secrets.token_bytes()</code> for CSPRNG salt generation, and generates standard salted SHA-256 digests.
                </p>
                <div className="pt-2 text-xs text-text-muted">
                  <span className="font-semibold text-text-secondary">Engineering nuance: </span>
                  While HMAC comparison (<code className="font-mono">hmac.compare_digest</code>) or dedicated password hashing (Argon2/bcrypt) is preferred for high-load systems, this snippet is logically and syntactically sound without defects.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-danger/30 bg-danger-subtle/30 flex items-start gap-4">
              <XCircle size={28} className="text-danger flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary">
                  ❌ False Positive Detected
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  You flagged line(s) <span className="font-mono font-bold text-text-primary">{flaggedLines.map(l => `L${l}`).join(', ')}</span>, but this code is valid.
                </p>
                <p className="text-xs text-text-secondary bg-bg-surface p-3 rounded-lg border border-border">
                  <span className="font-semibold text-text-primary">Why this was flagged in error: </span>
                  Engineers frequently over-review custom crypto helpers when they don't see higher-level abstractions like bcrypt. However, <code className="font-mono text-accent">secrets.token_bytes(32)</code> and <code className="font-mono text-accent">hashlib.sha256()</code> here do not suffer from buffer, injection, or nil errors.
                </p>
                <p className="text-xs text-text-muted">
                  Learning takeaway: Never request changes or block a PR based on subjective unfamiliarity without citing an exploitable trace or reproducible condition.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate('/practice')}>
              Back to Practice
            </Button>
            <Button onClick={() => navigate('/versus')} iconRight={<ArrowRight size={14} />}>
              Try AI vs You Mode
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
