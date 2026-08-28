import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, BookOpen, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Tabs, EmptyState } from '../components/ui/Overlays'
import { Badge, DifficultyBadge, StatusBadge } from '../components/ui/Badge'
import { ExerciseCardSkeleton } from '../components/ui/LoadingSkeleton'
import { listExercises } from '../api/exercises'
import type { Exercise } from '../types'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'logic', label: 'Logic' },
  { id: 'injection', label: 'Security' },
  { id: 'auth', label: 'Auth' },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'concurrency', label: 'Concurrency' },
  { id: 'resource', label: 'Performance' },
]

const RECOMMENDED_IDS = ['ex-01', 'ex-05', 'ex-09']

interface ExerciseCardProps {
  exercise: Exercise
  onClick: () => void
}

function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={clsx(
        'group rounded-xl border border-border bg-bg-surface p-4 cursor-pointer',
        'hover:border-border-strong hover:-translate-y-0.5',
        'transition-all duration-200 flex flex-col gap-3'
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-text-muted">
          #{String(exercise.number).padStart(2, '0')}
        </span>
        <StatusBadge status={exercise.status} />
      </div>

      {/* Title & repo */}
      <div>
        <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 leading-snug">
          {exercise.title}
        </h3>
        <p className="text-xs text-text-muted font-mono mt-0.5">{exercise.repo}</p>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="default">{exercise.language}</Badge>
        <Badge variant="accent">{exercise.defectClass}</Badge>
        <DifficultyBadge difficulty={exercise.difficulty} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock size={11} />
          <span>~{exercise.estimatedMinutes} min</span>
        </div>
        <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
          Review <ArrowRight size={11} />
        </span>
      </div>
    </motion.div>
  )
}

export default function ExerciseLibrary() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const classFilter =
      activeTab === 'all' || activeTab === 'recommended' ? undefined : activeTab

    listExercises(classFilter).then((data) => {
      const filtered =
        activeTab === 'recommended'
          ? data.filter((e) => RECOMMENDED_IDS.includes(e.id))
          : data
      setExercises(filtered)
      setLoading(false)
    })
  }, [activeTab])

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Practice</h1>
        <p className="text-text-secondary mt-1">Review real code. Build real instincts.</p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="overflow-x-auto pb-1"
      >
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          className="min-w-max"
        />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExerciseCardSkeleton key={i} />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={18} />}
          title="No exercises found"
          description="Try a different filter or check back later for new content in this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => navigate(`/practice/${exercise.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
