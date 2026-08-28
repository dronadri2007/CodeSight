import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scan, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Shield, Lock, Zap, GitBranch, Gauge, Code2, Sparkles
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { defectClasses } from '../tokens'

const iconMap = {
  Shield,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Gauge,
}

const fileSnippet = `import os
import json
import sqlite3
import hashlib
from flask import Flask, request, jsonify, g

app = Flask(__name__)
DB_PATH = os.environ.get('APP_DB', 'app.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
    return g.db

@app.route('/api/v1/user/export', methods=['GET'])
def export_user_data():
    user_id = request.args.get('id')
    auth_token = request.headers.get('X-Auth-Token')
    
    # Risk 1: Loose Token Verification
    if not auth_token or len(auth_token) < 8:
        return jsonify({'error': 'Unauthorized'}), 401
    
    cursor = get_db().cursor()
    # Risk 2: SQL Injection flaw
    query = f"SELECT id, username, email, secret_notes FROM users WHERE id = '{user_id}'"
    cursor.execute(query)
    record = cursor.fetchone()
    
    # Risk 3: Unhandled null reference / error state
    data = {
        'id': record[0],
        'username': record[1],
        'email': record[2],
        'notes': record[3]
    }
    
    # Write export log
    with open('/tmp/exports.log', 'a') as f:
        f.write(f"Exported user {user_id}\\n")
        
    return jsonify({'status': 'ok', 'data': data})`

const groundTruthRisks = ['injection', 'auth', 'error-handling']

export default function CodeXRay() {
  const navigate = useNavigate()
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
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">Advanced Mode</Badge>
            <span className="text-xs text-text-muted">High-Level Risk Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Code X-Ray
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Understand the risk landscape before hunting individual defects.
          </p>
        </div>

        {analyzed && (
          <Button
            size="sm"
            onClick={() => navigate('/practice/ex-01')}
            iconRight={<ArrowRight size={14} />}
          >
            Start Line Review
          </Button>
        )}
      </div>

      {/* Code Inspector */}
      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border-b border-border text-xs font-mono text-text-muted">
          <div className="flex items-center gap-2">
            <Code2 size={14} />
            <span>services/export_gateway.py</span>
          </div>
          <Badge variant="muted" size="sm">Python / Flask</Badge>
        </div>

        <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto bg-bg-primary/50 text-text-secondary">
          <pre className="whitespace-pre">{fileSnippet}</pre>
        </div>
      </div>

      {/* Risk Taxonomy Selector */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">
            {analyzed ? 'Risk Evaluation Summary' : 'Step 1: Predict Potential Risk Categories'}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {analyzed
              ? 'Here is how your structural risk scan compared with ground-truth vulnerability analysis.'
              : 'Select all defect categories you suspect are present in this service.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {defectClasses.map((cls) => {
            const isSelected = selectedRisks.includes(cls.id)
            const isPresent = groundTruthRisks.includes(cls.id)
            const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield

            let cardBorder = 'border-border'
            if (analyzed) {
              if (isSelected && isPresent) cardBorder = 'border-success/60 bg-success-subtle/20'
              else if (isSelected && !isPresent) cardBorder = 'border-danger/60 bg-danger-subtle/20'
              else if (!isSelected && isPresent) cardBorder = 'border-warning/60 bg-warning-subtle/20'
            } else if (isSelected) {
              cardBorder = 'border-accent bg-accent-subtle/30 shadow-accent-glow'
            }

            return (
              <div
                key={cls.id}
                onClick={() => toggleRisk(cls.id)}
                className={clsx(
                  'p-4 rounded-xl border transition-all select-none',
                  !analyzed && 'cursor-pointer hover:border-border-strong bg-bg-surface',
                  cardBorder
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cls.color}15` }}
                    >
                      <Icon size={14} style={{ color: cls.color }} />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{cls.label}</span>
                  </div>
                  {analyzed && (
                    <div>
                      {isSelected && isPresent && <CheckCircle2 size={16} className="text-success" />}
                      {isSelected && !isPresent && <XCircle size={16} className="text-danger" />}
                      {!isSelected && isPresent && <AlertTriangle size={16} className="text-warning" />}
                    </div>
                  )}
                </div>
                <p className="text-2xs text-text-muted">{cls.description}</p>
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
            >
              Analyze Risk Hypotheses ({selectedRisks.length} Selected)
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-border bg-bg-surface space-y-4"
          >
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              <Sparkles size={16} />
              <span>X-Ray Ground Truth Diagnostics</span>
            </div>

            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <div className="p-2.5 rounded-lg bg-bg-secondary border border-border">
                <span className="font-bold text-success">Injection / Input Validation: </span>
                Lines 25–27 format raw <code className="text-text-primary">user_id</code> into the SQL query without parameterization.
              </div>
              <div className="p-2.5 rounded-lg bg-bg-secondary border border-border">
                <span className="font-bold text-success">Auth &amp; Access Control: </span>
                Lines 19–21 perform trivial length check on token rather than cryptographically verifying session validity.
              </div>
              <div className="p-2.5 rounded-lg bg-bg-secondary border border-border">
                <span className="font-bold text-success">Error &amp; Exception Handling: </span>
                Lines 30–35 index <code className="text-text-primary">record[0]</code> immediately without checking if <code className="text-text-primary">record is None</code> when a user ID does not exist.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setAnalyzed(false)}>
                Reset Hypothesis
              </Button>
              <Button size="sm" onClick={() => navigate('/practice/ex-01')} iconRight={<ArrowRight size={14} />}>
                Proceed to Line-by-Line Review
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
