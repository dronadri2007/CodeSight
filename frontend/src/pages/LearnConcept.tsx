import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Check, ChevronRight, BookOpen } from 'lucide-react'
import { clsx } from 'clsx'
import { getConceptById } from '../mock/concepts'
import { useProgressStore } from '../store/progressStore'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/Overlays'

const defectVariantMap: Record<string, 'danger' | 'warning' | 'accent' | 'muted'> = {
  injection: 'danger',
  auth: 'warning',
  'error-handling': 'accent',
  concurrency: 'accent',
  logic: 'muted',
  resource: 'muted',
}

export default function LearnConcept() {
  const { conceptId } = useParams<{ conceptId: string }>()
  const navigate = useNavigate()
  const { markConceptComplete, conceptsCompleted } = useProgressStore()
  const [checked, setChecked] = useState(false)

  const concept = conceptId ? getConceptById(conceptId) : undefined

  if (!concept) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <EmptyState
          icon={<BookOpen size={20} />}
          title="Concept not found"
          description="The concept you're looking for doesn't exist in the library."
          action={
            <Button variant="secondary" onClick={() => navigate('/learn')}>
              Back to Library
            </Button>
          }
        />
      </div>
    )
  }

  const isAlreadyComplete = conceptsCompleted.includes(concept.id)
  const badgeVariant = defectVariantMap[concept.defectClassId] ?? 'muted'

  const handleCheck = () => {
    if (!checked) {
      setChecked(true)
      markConceptComplete(concept.id)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back + Breadcrumb */}
        <div className="mb-8 space-y-2">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Library
          </Link>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Learn</span>
            <ChevronRight size={12} />
            <span className="text-text-secondary">{concept.shortTitle}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <Badge variant={badgeVariant} className="mb-4">
            {concept.shortTitle}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-4 leading-tight">
            {concept.title}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed">
            {concept.description}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-10" />

        {/* What happened */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-4">
            What happened?
          </h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-line text-[15px]">
            {concept.what}
          </p>
        </section>

        {/* Code Comparison */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vulnerable */}
            <div className="bg-bg-surface border border-danger/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-danger/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-xs font-bold tracking-widest uppercase text-danger">
                  Vulnerable
                </span>
              </div>
              <pre className="p-4 font-mono text-sm text-text-secondary overflow-x-auto leading-relaxed">
                <code>{concept.vulnerableCode}</code>
              </pre>
            </div>

            {/* Safer */}
            <div className="bg-bg-surface border border-success/20 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-success/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-bold tracking-widest uppercase text-success">
                  Safer
                </span>
              </div>
              <pre className="p-4 font-mono text-sm text-text-secondary overflow-x-auto leading-relaxed">
                <code>{concept.saferCode}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-4">
            Why this matters
          </h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-line text-[15px]">
            {concept.whyItMatters}
          </p>
        </section>

        {/* Common pattern */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-4">
            Common pattern to watch for
          </h2>
          <pre className="font-mono text-sm bg-bg-surface border border-border rounded-xl p-5 whitespace-pre-line text-text-secondary leading-relaxed overflow-x-auto">
            {concept.commonPattern}
          </pre>
        </section>

        {/* Resource card */}
        <section className="mb-12">
          <div className="bg-bg-surface border border-border rounded-xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1">
                Curated Learning Resource
              </p>
              <p className="text-text-primary font-medium text-sm leading-snug mb-3">
                {concept.resourceTitle}
              </p>
              <a
                href={concept.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
              >
                {concept.resourceUrl.replace(/^https?:\/\//, '').split('/')[0]}
                <ExternalLink size={11} />
              </a>
            </div>
            <a
              href={concept.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" iconRight={<ExternalLink size={12} />}>
                View Resource
              </Button>
            </a>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border mb-10" />

        {/* Completion section */}
        <section className="text-center pb-16">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Concept Complete
          </h2>
          <p className="text-text-muted text-sm mb-6">
            Would you like a quick check to reinforce what you learned?
          </p>

          {/* Animated checkbox */}
          <div className="flex justify-center mb-8">
            <motion.button
              onClick={handleCheck}
              className={clsx(
                'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300',
                checked || isAlreadyComplete
                  ? 'bg-success border-success text-white'
                  : 'border-border-strong text-text-muted hover:border-success/50'
              )}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {(checked || isAlreadyComplete) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check size={20} strokeWidth={2.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/learn/${conceptId}/check`)}
            >
              Answer 3 Questions
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/practice')}
            >
              Skip
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
