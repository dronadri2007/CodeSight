import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, Play, Sparkles } from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  getConcept,
  getMicroCheck,
  submitMicroCheck,
  type Concept,
  type MicroCheckData,
  type MicroCheckResult,
} from '../api'

function embedUrl(url: string): string | null {
  const m = url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/) || url.match(/embed\/([\w-]{6,})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
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
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col">
        <Navbar variant="app" />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 bg-[#1A130D] border-red-900/40 text-center space-y-3 max-w-md">
            <h2 className="text-sm font-bold text-red-400">Couldn't load this concept</h2>
            <p className="text-2xs text-[#E5DFC9]/60 font-mono">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => navigate('/problems')}>Back to problems</Button>
          </Card>
        </main>
      </div>
    )
  }
  if (!concept) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col">
        <Navbar variant="app" />
        <main className="flex-1 flex items-center justify-center"><p className="text-xs text-[#E5DFC9]/50 font-mono animate-pulse">Loading concept…</p></main>
      </div>
    )
  }

  const video = concept.videos[0] ? embedUrl(concept.videos[0].url) : null
  const resultFor = (qid: string) => result?.results.find((r) => r.question_id === qid)

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="space-y-3">
          <button onClick={() => navigate('/problems')} className="flex items-center gap-1.5 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9]">
            <ArrowLeft size={14} /><span>Back to problems</span>
          </button>
          <div className="space-y-1">
            <span className="text-3xs px-2 py-0.5 rounded bg-[#E5DFC9] text-[#000000] font-bold font-mono">CONCEPT MASTERY</span>
            <h1 className="text-3xl font-extrabold text-[#E5DFC9] tracking-tight">{concept.title}</h1>
            <p className="text-xs text-[#E5DFC9]/70 max-w-2xl leading-relaxed">{concept.summary}</p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 border-[#3A2F1D] bg-[#1A130D] space-y-6 shadow-xl text-xs">
          <h2 className="text-sm font-bold text-[#E5DFC9] flex items-center gap-2"><Sparkles size={16} /> Before / after</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#000000] border border-red-900/40 space-y-2">
              <span className="font-mono text-2xs font-bold text-red-400 block border-b border-red-900/30 pb-1">VULNERABLE</span>
              <pre className="font-mono text-2xs text-[#E5DFC9]/80 overflow-x-auto leading-relaxed whitespace-pre-wrap">{concept.example_bad}</pre>
            </div>
            <div className="p-4 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-2">
              <span className="font-mono text-2xs font-bold text-[#E5DFC9] block border-b border-[#3A2F1D] pb-1">SAFE</span>
              <pre className="font-mono text-2xs text-[#E5DFC9]/90 overflow-x-auto leading-relaxed whitespace-pre-wrap">{concept.example_good}</pre>
            </div>
          </div>
        </Card>

        {concept.videos.length > 0 && (
          <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-4 shadow-xl text-xs">
            <div className="flex items-center gap-2 border-b border-[#3A2F1D] pb-3">
              <Play size={16} /><h3 className="font-bold text-[#E5DFC9]">Watch</h3>
            </div>
            {video ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#3A2F1D] bg-[#000000]">
                <iframe src={video} title={concept.videos[0].title} allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen className="w-full h-full" />
              </div>
            ) : (
              <ul className="space-y-1">
                {concept.videos.map((v) => (
                  <li key={v.url}><a href={v.url} target="_blank" rel="noreferrer" className="text-[#E5DFC9] hover:underline">{v.title} →</a></li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {check && check.questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#E5DFC9]">Micro-check</h2>
              {result && (
                <span className={`text-2xs font-mono font-bold ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.correct}/{result.total} · {result.passed ? 'passed' : 'keep practising'}
                </span>
              )}
            </div>

            {check.questions.map((q, i) => {
              const r = resultFor(q.id)
              return (
                <Card key={q.id} className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-3 shadow-md text-xs">
                  <p className="font-bold text-[#E5DFC9]">{i + 1}. {q.prompt}</p>
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, oi) => {
                      const chosen = answers[q.id] === oi
                      let cls = 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/50'
                      if (r) {
                        if (oi === r.correct_index) cls = 'bg-[#3A2F1D] border-[#E5DFC9] text-[#E5DFC9] font-bold'
                        else if (chosen) cls = 'bg-red-950/40 border-red-500/50 text-red-300'
                      } else if (chosen) cls = 'bg-[#3A2F1D] border-[#E5DFC9]/60 text-[#E5DFC9]'
                      return (
                        <button
                          key={oi}
                          disabled={!!result}
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${cls}`}
                        >
                          <span>{opt}</span>
                          {r && oi === r.correct_index && <CheckCircle2 size={14} />}
                          {r && chosen && !r.correct && oi === r.your_index && <XCircle size={14} className="text-red-400" />}
                        </button>
                      )
                    })}
                  </div>
                  {r && (
                    <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/70 leading-relaxed">
                      <strong>Explanation:</strong> {r.explanation}
                    </div>
                  )}
                </Card>
              )
            })}

            {!result && (
              <Button size="md" variant="primary" fullWidth disabled={!allAnswered || grading} onClick={runCheck} className="font-bold text-xs">
                {grading ? 'Checking…' : allAnswered ? 'Check my answers' : 'Answer every question first'}
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#3A2F1D]">
          {result && !result.passed && result.practice_exercise_ids[0] && (
            <Button size="md" variant="secondary" onClick={() => navigate(`/pro/debug/${result.practice_exercise_ids[0]}`)} className="text-xs">
              Practise this class
            </Button>
          )}
          <Button size="md" variant="primary" onClick={() => navigate('/problems')} className="font-bold text-xs">
            Done · Return to problems
          </Button>
        </div>
      </main>
    </div>
  )
}
