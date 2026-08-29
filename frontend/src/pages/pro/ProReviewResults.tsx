import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, RotateCcw, Zap, ShieldAlert } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { GradeResponse } from '../../api'

type ResultState = {
  grade: GradeResponse
  exerciseTitle: string
  defectClass: string
  selectedLines: number[]
}

export default function ProReviewResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const state = useLocation().state as ResultState | null

  if (!state?.grade) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col">
        <Navbar variant="pro" />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 bg-[#1A130D] border-[#3A2F1D] text-center space-y-3 max-w-md">
            <h1 className="text-sm font-bold text-[#E5DFC9]">No result to show</h1>
            <p className="text-2xs text-[#E5DFC9]/60 font-mono">Open a review from the exercise list and submit it.</p>
            <Button size="sm" variant="gold" onClick={() => navigate('/pro/problems')}>Go to exercises</Button>
          </Card>
        </main>
      </div>
    )
  }

  const { grade, exerciseTitle, defectClass, selectedLines } = state
  const score = Math.round(grade.score_after_hints * 100)
  const locPct = Math.round(grade.localisation.score * 100)
  const explPct = Math.round(grade.explanation.score * 100)
  const real = grade.localisation.real_lines
  const withinTol = (l: number) => real.some((r) => Math.abs(r - l) <= 2)
  const missed = real.filter((r) => !selectedLines.some((l) => Math.abs(l - r) <= 2))
  const falsePositives = selectedLines.filter((l) => !withinTol(l))

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#3A2F1D] pb-6">
              <div>
                <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/60 font-bold block">CODE REVIEW RESULT</span>
                <h1 className="text-2xl font-extrabold text-[#E5DFC9] mt-0.5">{exerciseTitle}</h1>
                <p className="text-xs text-[#E5DFC9]/70 font-mono mt-0.5">Defect class: {defectClass}</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono uppercase text-[#E5DFC9]/60 font-bold block">Review score</span>
                <span className="text-4xl font-extrabold text-[#E5DFC9] font-mono">{score}<span className="text-lg text-[#E5DFC9]/50">/100</span></span>
                <span className="block text-2xs font-mono text-[#E5DFC9]/50 capitalize">
                  localisation {grade.localisation.verdict} · explanation {grade.explanation.verdict}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Bug localisation', v: locPct },
                { label: 'Explanation quality', v: explPct },
              ].map((m) => (
                <div key={m.label} className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                  <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">{m.label}</span>
                  <div className="text-base font-bold font-mono text-[#E5DFC9]">{m.v}%</div>
                  <div className="w-full bg-[#1A130D] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#E5DFC9] h-full rounded-full" style={{ width: `${m.v}%` }} />
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
                <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">False positives</span>
                <div className={`text-base font-bold font-mono ${falsePositives.length ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {falsePositives.length ? `${falsePositives.length} line(s)` : 'None'}
                </div>
                <span className="text-3xs text-[#E5DFC9]/50 block font-mono">
                  {falsePositives.length ? `flagged: ${falsePositives.join(', ')}` : 'no clean code penalised'}
                </span>
              </div>
            </div>

            {/* Audit breakdown from the real grade */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-3 font-mono text-2xs">
              <span className="font-bold text-[#E5DFC9] uppercase block border-b border-[#3A2F1D] pb-2">Defect audit</span>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-emerald-300">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>REAL DEFECT LINES:</strong> {real.length ? real.join(', ') : 'none — the file is clean'}</span>
                </div>
                {!!missed.length && (
                  <div className="flex items-start gap-2 text-[#E5DFC9]/70">
                    <span className="w-3.5 text-center text-[#E5DFC9]/50">○</span>
                    <span><strong>MISSED:</strong> line(s) {missed.join(', ')}</span>
                  </div>
                )}
                {!!falsePositives.length && (
                  <div className="flex items-start gap-2 text-amber-300">
                    <span className="w-3.5 text-center">!</span>
                    <span><strong>FALSE POSITIVE:</strong> line(s) {falsePositives.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teaching feedback */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-2 text-2xs text-[#E5DFC9]/80 leading-relaxed">
              <span className="text-xs font-mono font-bold text-[#E5DFC9] uppercase flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> Teaching feedback
              </span>
              <p><strong>Where:</strong> {grade.teaching.where}</p>
              <p><strong>Why you may have missed it:</strong> {grade.teaching.why_missed}</p>
              <p><strong>Pattern to watch:</strong> {grade.teaching.pattern}</p>
              <p className="text-[#E5DFC9]/60"><strong>Reference fix:</strong> {grade.reference_fix}</p>
              {grade.explanation.note && <p className="text-[#E5DFC9]/60"><strong>On your explanation:</strong> {grade.explanation.note}</p>}
            </div>

            {/* Integrity signal, only if telemetry was sent */}
            {grade.integrity && grade.integrity.verdict !== 'clean' && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1 text-2xs text-amber-200 font-mono">
                <span className="font-bold flex items-center gap-1.5"><ShieldAlert size={13} /> Integrity: {grade.integrity.verdict} ({grade.integrity.score})</span>
                {grade.integrity.flags.map((f, i) => <p key={i}>· {f}</p>)}
                <p className="text-amber-300/70">Advisory only — this does not change your score.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button size="md" variant="secondary" onClick={() => navigate(`/pro/debug/${id}`)} icon={<RotateCcw size={13} />} className="text-xs w-full sm:w-auto">
                Re-review
              </Button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link to="/profile" className="text-2xs text-[#E5DFC9] hover:underline font-mono">Full analytics →</Link>
                <Button size="md" variant="gold" onClick={() => navigate('/pro/problems')} iconRight={<ArrowRight size={14} />} className="text-xs font-bold w-full sm:w-auto shadow-md">
                  More exercises
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
