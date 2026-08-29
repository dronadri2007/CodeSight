import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, ArrowLeft, CheckCircle2, XCircle, Play,
  ExternalLink, Sparkles, Code2, AlertTriangle, Shield
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { mockConceptDetails } from '../mock/concepts'

export default function ConceptLearn() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()

  const concept =
    mockConceptDetails.find((c) => c.id === conceptId || c.defectClassId === conceptId) ||
    mockConceptDetails[0]

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({})

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    setCheckedAnswers((prev) => ({ ...prev, [questionId]: true }))
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Breadcrumb & Header */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-1.5 text-xs text-[#E5DFC9]/70 hover:text-[#E5DFC9] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Problem List</span>
          </button>

          <div className="space-y-1">
            <Badge variant="gold" size="sm">CONCEPT MASTERY</Badge>
            <h1 className="text-3xl font-extrabold text-[#E5DFC9] tracking-tight">
              {concept.title}
            </h1>
            <p className="text-xs text-[#E5DFC9]/70 max-w-2xl leading-relaxed">
              {concept.description}
            </p>
          </div>
        </div>

        {/* Deep Dive Article Card */}
        <Card className="p-6 sm:p-8 border-[#3A2F1D] bg-[#1A130D] space-y-6 shadow-xl text-xs">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#E5DFC9] flex items-center gap-2">
              <Sparkles size={16} className="text-[#E5DFC9]" /> Deep Dive & Root Cause Analysis
            </h2>
            <div className="prose prose-invert prose-xs text-[#E5DFC9]/80 leading-relaxed whitespace-pre-line">
              {concept.deepDive}
            </div>
          </div>

          {/* Vulnerable vs Safer Code Comparison Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Vulnerable Snippet */}
            <div className="p-4 rounded-2xl bg-[#000000] border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-red-900/30">
                <span className="font-mono text-2xs font-bold text-red-400">VULNERABLE / SUBOPTIMAL</span>
              </div>
              <pre className="font-mono text-2xs text-[#E5DFC9]/80 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {concept.vulnerableCode}
              </pre>
            </div>

            {/* Safer Snippet */}
            <div className="p-4 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3A2F1D]">
                <span className="font-mono text-2xs font-bold text-[#E5DFC9]">OPTIMAL & DEFENSIVE</span>
              </div>
              <pre className="font-mono text-2xs text-[#E5DFC9]/90 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {concept.saferCode}
              </pre>
            </div>
          </div>

          {/* Common Signatures to Watch */}
          <div className="p-4 rounded-2xl bg-[#000000] border border-[#3A2F1D] space-y-2">
            <span className="font-mono text-2xs font-bold text-[#E5DFC9] uppercase tracking-wider block">
              Signatures & Invariants to Watch in Code Review:
            </span>
            <ul className="list-disc list-inside space-y-1 text-2xs text-[#E5DFC9]/70">
              {concept.commonPatternsToWatch.map((pat, idx) => (
                <li key={idx}>{pat}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Curated YouTube Video Section */}
        {concept.youtubeVideo && (
          <Card className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-3">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-[#E5DFC9]" />
                <h3 className="font-bold text-[#E5DFC9]">Curated Video Masterclass</h3>
              </div>
              <span className="text-2xs font-mono text-[#E5DFC9]/50">{concept.youtubeVideo.channel} ({concept.youtubeVideo.duration})</span>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#3A2F1D] bg-[#000000]">
              <iframe
                src={concept.youtubeVideo.embedUrl}
                title={concept.youtubeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </Card>
        )}

        {/* 2-3 Interactive Micro-Check Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#E5DFC9]">Interactive Check Questions</h2>
            <span className="text-2xs font-mono text-[#E5DFC9]/50">Test Your Instincts</span>
          </div>

          <div className="space-y-4">
            {concept.miniCheckQuestions.map((q, qIdx) => {
              const selected = selectedAnswers[q.id]
              const isChecked = checkedAnswers[q.id]

              return (
                <Card key={q.id} className="p-6 border-[#3A2F1D] bg-[#1A130D] space-y-3 shadow-md text-xs">
                  <p className="font-bold text-[#E5DFC9]">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selected === optIdx
                      const isCorrect = optIdx === q.correctIndex

                      let optionClass = 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/50'
                      if (isChecked) {
                        if (isCorrect) {
                          optionClass = 'bg-[#3A2F1D] border-[#E5DFC9] text-[#E5DFC9] font-bold'
                        } else if (isChosen && !isCorrect) {
                          optionClass = 'bg-red-950/40 border-red-500/50 text-red-300'
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionClass}`}
                        >
                          <span>{opt}</span>
                          {isChecked && isCorrect && <CheckCircle2 size={14} className="text-[#E5DFC9]" />}
                          {isChecked && isChosen && !isCorrect && <XCircle size={14} className="text-red-400" />}
                        </button>
                      )
                    })}
                  </div>

                  {isChecked && (
                    <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/70 pt-2 leading-relaxed">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Done / Next CTA */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#3A2F1D]">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/problems')}
            className="font-bold text-xs"
          >
            Done · Return to Problems
          </Button>
        </div>
      </main>
    </div>
  )
}
