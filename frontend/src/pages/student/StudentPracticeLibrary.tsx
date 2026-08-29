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
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Top Navbar */}
      <Navbar variant="student" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3A2F1D]">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E5DFC9]">
              Student Track · Interactive Coding Drills
            </span>
            <h1 className="text-3xl font-extrabold text-[#E5DFC9] tracking-tight mt-1">
              Coding Challenges
            </h1>
            <p className="text-sm text-[#E5DFC9]/70 mt-0.5">
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
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]'
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
                hover
                onClick={() => navigate(`/student/practice/${ex.id}`)}
                className="p-6 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] flex flex-col justify-between h-full group hover:border-[#E5DFC9]/35 hover:bg-[#3A2F1D]/40 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-[#E5DFC9]/60">Challenge 0{ex.number}</span>
                    <DifficultyBadge difficulty={ex.difficulty} />
                  </div>

                  <h3 className="text-base font-bold text-[#E5DFC9] group-hover:text-[#E5DFC9] transition-colors mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-[#E5DFC9]/60 line-clamp-2 leading-relaxed mb-4">
                    {ex.description}
                  </p>

                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="navy" size="sm">{ex.language}</Badge>
                    <Badge variant="default" size="sm">
                      {ex.defectClass}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#3A2F1D] text-xs">
                  <div className="flex items-center gap-1 text-[#E5DFC9]/60">
                    <Clock size={12} />
                    <span>~{ex.estimatedMinutes} mins</span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/student/practice/${ex.id}`)}
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
