import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RotateCcw, Check, AlertTriangle } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import type { GradeResponse } from '../../api'

const EASE = [0.16, 1, 0.3, 1] as const

type ResultState = {
  grade: GradeResponse
  exerciseTitle: string
  defectClass: string
  selectedLines: number[]
}

function Axis({ label, pct, delay }: { label: string; pct: number; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-[#E5DFC9]/70">{label}</span>
        <span className="font-mono text-[13px] tabular-nums text-[#E5DFC9]">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#3A2F1D]">
        <motion.div
          className="h-full rounded-full bg-[#E5DFC9]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: EASE }}
        />
      </div>
    </div>
  )
}

export default function ProReviewResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const state = useLocation().state as ResultState | null

  if (!state?.grade) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9]">
        <Navbar variant="pro" />
        <main className="mx-auto flex max-w-md flex-col items-start gap-3 px-6 py-24">
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-[#E5DFC9]">Nothing to show yet</h1>
          <p className="text-[13px] text-[#E5DFC9]/60">Open a review from the exercise list and submit it first.</p>
          <Button size="md" variant="primary" onClick={() => navigate('/pro/problems')} className="mt-2 text-[13px]">
            Go to exercises
          </Button>
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
  const fp = selectedLines.filter((l) => !withinTol(l))
  const dirtyIntegrity = grade.integrity && grade.integrity.verdict !== 'clean'

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25">
      <Navbar variant="pro" />

      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#E5DFC9]">{exerciseTitle}</h1>
        <p className="mt-1 font-mono text-[12px] text-[#E5DFC9]/55">defect class · {defectClass}</p>

        <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ---- score ---- */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/40">Review score</p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-1 font-mono text-[4rem] font-extrabold leading-none tracking-[-0.04em] text-[#E5DFC9]"
            >
              {score}
              <span className="text-[1.75rem] text-[#E5DFC9]/40"> / 100</span>
            </motion.div>
            <p className="mt-2 text-[12px] capitalize text-[#E5DFC9]/55">
              localisation {grade.localisation.verdict} · explanation {grade.explanation.verdict}
            </p>

            <div className="mt-8 space-y-4">
              <Axis label="Bug localisation" pct={locPct} delay={0.1} />
              <Axis label="Explanation quality" pct={explPct} delay={0.22} />
            </div>

            <div className="mt-6 flex items-start gap-2 text-[12.5px] text-[#E5DFC9]/70">
              {fp.length ? (
                <AlertTriangle size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-[#E5DFC9]" />
              ) : (
                <Check size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-[#E5DFC9]/50" />
              )}
              <span>
                {fp.length
                  ? `${fp.length} false-positive line${fp.length > 1 ? 's' : ''} — ${fp.join(', ')}`
                  : 'No clean code was penalised.'}
              </span>
            </div>
          </div>

          {/* ---- audit + teaching, one editor-style object ---- */}
          <div className="overflow-hidden rounded-2xl border border-[#3A2F1D] bg-[#1A130D] shadow-xl">
            <div className="border-b border-[#3A2F1D] p-5 font-mono text-[12px] leading-relaxed">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/40">Defect audit</p>
              <p className="mt-2 text-[#E5DFC9]">
                Real defect line{real.length === 1 ? '' : 's'}: {real.length ? real.join(', ') : 'none — the file is clean'}
              </p>
              {!!missed.length && <p className="mt-1 text-[#E5DFC9]/70">Missed: {missed.join(', ')}</p>}
              {!!fp.length && <p className="mt-1 text-[#E5DFC9]/70">False positive: {fp.join(', ')}</p>}
            </div>

            <div className="space-y-2.5 p-5 text-[12.5px] leading-relaxed text-[#E5DFC9]/80">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/40">Teaching</p>
              <p><span className="font-semibold text-[#E5DFC9]">Where.</span> {grade.teaching.where}</p>
              <p><span className="font-semibold text-[#E5DFC9]">Why you missed it.</span> {grade.teaching.why_missed}</p>
              <p><span className="font-semibold text-[#E5DFC9]">Pattern to watch.</span> {grade.teaching.pattern}</p>
              <p className="text-[#E5DFC9]/60"><span className="font-semibold text-[#E5DFC9]/80">Reference fix.</span> {grade.reference_fix}</p>
              {grade.explanation.note && (
                <p className="text-[#E5DFC9]/60"><span className="font-semibold text-[#E5DFC9]/80">On your explanation.</span> {grade.explanation.note}</p>
              )}
            </div>

            {dirtyIntegrity && (
              <div className="flex items-start gap-2 border-t border-[#3A2F1D] bg-[#000000] p-4 font-mono text-[11.5px] text-[#E5DFC9]/70">
                <AlertTriangle size={13} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-[#E5DFC9]" />
                <div className="space-y-0.5">
                  <p className="text-[#E5DFC9]">
                    Integrity: {grade.integrity!.verdict} ({grade.integrity!.score}) — advisory, doesn't change your score
                  </p>
                  {grade.integrity!.flags.map((f, i) => (
                    <p key={i}>· {f}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-stretch justify-between gap-4 border-t border-[#3A2F1D] pt-6 sm:flex-row sm:items-center">
          <Button
            size="md"
            variant="outline"
            onClick={() => navigate(`/pro/debug/${id}`)}
            icon={<RotateCcw size={14} />}
            className="text-[13px]"
          >
            Re-review
          </Button>
          <div className="flex items-center justify-between gap-5 sm:justify-end">
            <Link to="/profile" className="text-[12px] font-medium text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:underline">
              Full analytics →
            </Link>
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/pro/problems')}
              iconRight={<ArrowRight size={14} className="text-[#000000]" />}
              className="text-[13px]"
            >
              More exercises
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
