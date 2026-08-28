import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Clock, Filter, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge, DifficultyBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { mockStudentExercises } from '../../mock/studentExercises'

export default function StudentPracticeLibrary() {
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState('all')

  const filterTabs = [
    { id: 'all', label: 'All Challenges' },
    { id: 'error-handling', label: 'Error Handling (Focus)' },
    { id: 'injection', label: 'Injection' },
    { id: 'auth', label: 'Auth & Access' },
    { id: 'concurrency', label: 'Concurrency' },
    { id: 'logic', label: 'Logic & Bounds' },
  ]

  const filtered = selectedClass === 'all'
    ? mockStudentExercises
    : mockStudentExercises.filter((e) => e.defectClassId === selectedClass)

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-border">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-aqua">
              Student Track · Interactive Coding Drills
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Coding Challenges
            </h1>
            <p className="text-sm text-slate mt-0.5">
              Write functional code. CodeSight tests your implementation and highlights blind spots.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedClass(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedClass === tab.id
                  ? 'bg-aqua text-navy font-bold'
                  : 'bg-navy-surface border border-navy-border text-slate hover:text-white hover:border-navy-borderStrong'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                dark
                hover
                onClick={() => navigate(`/student/practice/${ex.id}`)}
                className="p-6 border-navy-border bg-navy-surface flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-slate">Challenge 0{ex.number}</span>
                    <DifficultyBadge difficulty={ex.difficulty} />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-aqua transition-colors mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-slate line-clamp-2 leading-relaxed mb-4">
                    {ex.description}
                  </p>

                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="navy" size="sm">{ex.language}</Badge>
                    <Badge variant="default" size="sm" className="bg-navy-midnight text-slate border-navy-border">
                      {ex.defectClass}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-navy-border text-xs">
                  <div className="flex items-center gap-1 text-slate">
                    <Clock size={12} />
                    <span>~{ex.estimatedMinutes} mins</span>
                  </div>
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => navigate(`/student/practice/${ex.id}`)}
                    className="bg-aqua/10 text-aqua hover:bg-aqua/20 border-aqua/30"
                  >
                    Start Coding
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
