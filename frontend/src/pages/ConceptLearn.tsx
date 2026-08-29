import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import {
  getConcept,
  getMicroCheck,
  submitMicroCheck,
  type Concept,
  type MicroCheckData,
  type MicroCheckResult,
} from '../api'

const EASE = [0.16, 1, 0.3, 1] as const

function embedUrl(url: string): string | null {
  const m = url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/) || url.match(/embed\/([\w-]{6,})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25">
      <Navbar variant="app" />
      {children}
    </div>
  )
}

export default function ConceptLearn() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()

  const [concept, setConcept] = useState<Concept | null>(null)
  const [check, setCheck] = useState<MicroCheckData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<MicroCheckResult | null>(null)
  const [grading, setGrading] = useState(false)

  useEffect(() => {
    if (!conceptId) return
    let dead = false
    setConcept(null); setCheck(null); setError(null); setAnswers({}); setResult(null)
    Promise.all([getConcept(conceptId), getMicroCheck(conceptId).catch(() => null)])
      .then(([c, mc]) => { if (!dead) { setConcept(c); setCheck(mc) } })
      .catch((e) => { if (!dead) setError(e instanceof Error ? e.message : 'failed to load concept') })
    return () => { dead = true }
  }, [conceptId])

  const allAnswered = !!check && check.questions.every((q) => q.id in answers)

  const runCheck = async () => {
    if (!conceptId || !check) return
    setGrading(true)
    try {
      const r = await submitMicroCheck(
        conceptId,
        check.questions.map((q) => ({ question_id: q.id, choice_index: answers[q.id] })),
      )
      setResult(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'grading failed')
    } finally {
      setGrading(false)
    }
  }

  if (error) {
    return (
      <Shell>
        <main className="mx-auto flex max-w-md flex-col items-start gap-3 px-6 py-24">
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-[#E5DFC9]">Couldn't load this concept</h1>
          <p className="font-mono text-[12px] text-[#E5DFC9]/55">{error}</p>
          <Button size="md" variant="outline" onClick={() => navigate('/problems')} className="mt-2 text-[13px]">
            Back to problems
          </Button>
        </main>
      </Shell>
    )
  }
  if (!concept) {
    return (
      <Shell>
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="animate-pulse font-mono text-[12px] text-[#E5DFC9]/50">Loading concept…</p>
        </main>
      </Shell>
    )
  }

  const video = concept.videos[0] ? embedUrl(concept.videos[0].url) : null
  const resultFor = (qid: string) => result?.results.find((r) => r.question_id === qid)

  return (
    <Shell>
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <button
          onClick={() => navigate('/problems')}
          className="inline-flex items-center gap-1.5 text-[12px] text-[#E5DFC9]/60 hover:text-[#E5DFC9]"
        >
          <ArrowLeft size={14} /> Back to problems
        </button>

        <h1 className="mt-6 max-w-2xl text-[2.25rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-balance text-[#E5DFC9]">
          {concept.title}
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">{concept.summary}</p>

        {/* before / after — one object, not two cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-10 overflow-hidden rounded-2xl border border-[#3A2F1D] bg-[#1A130D] shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-[#3A2F1D]">
            <div className="border-b border-[#3A2F1D] md:border-b-0">
              <div className="flex items-center gap-1.5 border-b border-[#3A2F1D] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/45">
                <AlertTriangle size={12} strokeWidth={2} /> Before
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-3.5 font-mono text-[12px] leading-relaxed text-[#E5DFC9]/70">
                {concept.example_bad}
              </pre>
            </div>
            <div>
              <div className="flex items-center gap-1.5 border-b border-[#3A2F1D] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/45">
                <Check size={12} strokeWidth={2} /> After
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-3.5 font-mono text-[12px] leading-relaxed text-[#E5DFC9]/90">
                {concept.example_good}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* video */}
        {video && (
          <div className="mt-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E5DFC9]/45">Watch</p>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[#3A2F1D] bg-[#000000]">
              <iframe
                src={video}
                title={concept.videos[0].title}
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}
        {!video && concept.videos.length > 0 && (
          <ul className="mt-10 space-y-1 text-[13px]">
            {concept.videos.map((v) => (
              <li key={v.url}>
                <a href={v.url} target="_blank" rel="noreferrer" className="text-[#E5DFC9] hover:underline">
                  {v.title} →
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* micro-check */}
        {check && check.questions.length > 0 && (
          <section className="mt-14 border-t border-[#3A2F1D] pt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#E5DFC9]">Micro-check</h2>
              {result && (
                <span className="font-mono text-[12px] font-semibold text-[#E5DFC9]">
                  {result.correct}/{result.total} · {result.passed ? 'passed' : 'keep practising'}
                </span>
              )}
            </div>

            <div className="mt-6 divide-y divide-[#3A2F1D]">
              {check.questions.map((q, i) => {
                const r = resultFor(q.id)
                return (
                  <div key={q.id} className="py-6 first:pt-0">
                    <p className="text-[14px] font-semibold text-[#E5DFC9]">
                      {i + 1}. {q.prompt}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oi) => {
                        const chosen = answers[q.id] === oi
                        let cls = 'border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/40'
                        if (r) {
                          if (oi === r.correct_index) cls = 'border-[#E5DFC9] bg-[#3A2F1D] text-[#E5DFC9] font-medium'
                          else if (chosen) cls = 'border-[#3A2F1D] text-[#E5DFC9]/45 line-through'
                        } else if (chosen) cls = 'border-[#E5DFC9]/60 bg-[#3A2F1D] text-[#E5DFC9]'
                        return (
                          <button
                            key={oi}
                            disabled={!!result}
                            onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors ${cls}`}
                          >
                            <span>{opt}</span>
                            {r && oi === r.correct_index && <Check size={14} strokeWidth={2.5} className="flex-shrink-0" />}
                            {r && chosen && !r.correct && oi === r.your_index && (
                              <X size={14} strokeWidth={2.5} className="flex-shrink-0 text-[#E5DFC9]/50" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {r && (
                      <p className="mt-3 border-l-2 border-[#3A2F1D] pl-3 text-[12.5px] leading-relaxed text-[#E5DFC9]/65">
                        {r.explanation}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {!result && (
              <Button
                size="lg"
                variant="primary"
                fullWidth
                disabled={!allAnswered || grading}
                onClick={runCheck}
                className="mt-6 text-[13px]"
              >
                {grading ? 'Checking…' : allAnswered ? 'Check my answers' : 'Answer every question first'}
              </Button>
            )}
          </section>
        )}

        <div className="mt-12 flex justify-end gap-3 border-t border-[#3A2F1D] pt-6">
          {result && !result.passed && result.practice_exercise_ids[0] && (
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate(`/pro/debug/${result.practice_exercise_ids[0]}`)}
              className="text-[13px]"
            >
              Practise this class
            </Button>
          )}
          <Button size="md" variant="primary" onClick={() => navigate('/problems')} className="text-[13px]">
            Done — back to problems
          </Button>
        </div>
      </main>
    </Shell>
  )
}
