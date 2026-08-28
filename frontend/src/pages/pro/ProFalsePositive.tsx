import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, HelpCircle, Code2, Flag
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

const cleanCodeSnippet = `import hashlib
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

const codeLines = cleanCodeSnippet.split('\n')

export default function ProFalsePositive() {
  const navigate = useNavigate()
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
    setSubmitted(true)
  }

  const handleReset = () => {
    setFlaggedLines([])
    setExplanation('')
    setSubmitted(false)
  }

  const isCleanSubmission = flaggedLines.length === 0

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm">REVIEW PRECISION CHALLENGE</Badge>
              <span className="text-xs text-slate">Don’t Over-Review</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              False Positive Challenge
            </h1>
            <p className="text-sm text-slate mt-1">
              Not all unfamiliar code contains a defect. Flag only lines you can strictly justify.
            </p>
          </div>

          {submitted && (
            <Button variant="dark" size="sm" onClick={handleReset} icon={<RotateCcw size={14} />}>
              Try Again
            </Button>
          )}
        </div>

        {/* Instructions */}
        {!submitted && (
          <div className="p-4 rounded-xl border border-navy-border bg-navy-surface flex items-start gap-3 text-xs text-slate">
            <HelpCircle size={16} className="text-aqua flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Review Rule: </span>
              This code may be completely valid and safe. If you believe there is a security or logic defect, click the line to flag it and explain why. If the code is sound, submit with 0 flagged lines.
            </div>
          </div>
        )}

        {/* Code Viewer */}
        <div className="rounded-xl border border-navy-border bg-navy-surface overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-navy-midnight border-b border-navy-border text-xs font-mono text-slate">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-aqua" />
              <span>crypto_helpers.py</span>
            </div>
            <span>Python</span>
          </div>

          <div className="p-4 font-mono text-xs text-slate bg-navy-midnight/60 leading-relaxed overflow-x-auto select-none">
            {codeLines.map((line, idx) => {
              const lineNum = idx + 1
              const isFlagged = flaggedLines.includes(lineNum)

              return (
                <div
                  key={lineNum}
                  onClick={() => toggleFlagLine(lineNum)}
                  className={`flex items-center py-0.5 px-2 rounded cursor-pointer transition-colors ${
                    isFlagged
                      ? 'bg-danger/20 border-l-2 border-danger text-white'
                      : 'hover:bg-navy-surface text-slate'
                  }`}
                >
                  <span className={`w-8 text-right mr-4 select-none ${isFlagged ? 'text-danger font-bold' : 'text-slate/50'}`}>
                    {lineNum}
                  </span>
                  <span className="flex-1 whitespace-pre">{line}</span>
                  {isFlagged && <Flag size={12} className="text-danger ml-2 flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Review Action or Verdict */}
        {!submitted ? (
          <Card dark className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Review Judgment</h3>
              <span className="text-xs font-mono text-slate">
                {flaggedLines.length === 0 ? '0 lines flagged (Verdict: Clean)' : `${flaggedLines.length} line(s) flagged`}
              </span>
            </div>

            {flaggedLines.length > 0 && (
              <div>
                <label className="text-2xs text-slate uppercase block mb-1">
                  Justification for Flagged Lines ({flaggedLines.map((l) => `L${l}`).join(', ')}):
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain the specific vulnerability or failure mode you believe is present..."
                  rows={3}
                  className="w-full p-2.5 bg-navy-midnight border border-navy-border rounded-lg text-xs text-white placeholder-slate focus:outline-none focus:border-aqua resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-navy-border">
              <span className="text-2xs text-slate">
                {flaggedLines.length === 0
                  ? 'Submitting 0 flags asserts the code is clean and production-ready.'
                  : 'Submitting flags tests whether you caught real vs imaginary issues.'}
              </span>
              <Button
                size="md"
                onClick={handleSubmit}
                className={flaggedLines.length === 0 ? 'bg-success text-navy hover:bg-success/90 font-bold border-none' : 'bg-aqua text-navy hover:bg-aqua-bright font-bold border-none'}
              >
                {flaggedLines.length === 0 ? 'Confirm Code is Clean' : 'Submit Review Flags'}
              </Button>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {isCleanSubmission ? (
              <div className="p-6 rounded-2xl border border-success/30 bg-success/15 flex items-start gap-4">
                <CheckCircle2 size={26} className="text-success flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    ✅ Clean Code — Accurate Assessment!
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Excellent discipline. You resisted the urge to flag unfamiliar code.
                    This module properly uses <code className="text-white font-mono bg-navy-midnight px-1 py-0.5 rounded">secrets.token_bytes()</code> for CSPRNG salt generation, and generates standard salted SHA-256 digests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-danger/30 bg-danger/15 flex items-start gap-4">
                <XCircle size={26} className="text-danger flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    ❌ False Positive Detected
                  </h3>
                  <p className="text-xs text-slate leading-relaxed">
                    You flagged line(s) <span className="font-mono font-bold text-white">{flaggedLines.map((l) => `L${l}`).join(', ')}</span>, but this code is valid.
                  </p>
                  <p className="text-xs text-slate bg-navy-midnight p-3 rounded-lg border border-navy-border">
                    <span className="font-semibold text-white">Learning Takeaway: </span>
                    Engineers frequently over-review custom crypto helpers when they don't see higher-level abstractions like bcrypt. However, this implementation is logically and syntactically sound without defects.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="dark" onClick={() => navigate('/pro/dashboard')}>
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/pro/versus')}
                iconRight={<ArrowRight size={14} />}
                className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
              >
                Try AI vs You Mode
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
