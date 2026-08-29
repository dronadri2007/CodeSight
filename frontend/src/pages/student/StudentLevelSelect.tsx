import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, HelpCircle, Check, Zap, Award, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Navbar } from '../../components/navigation/Navbar'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const LEVELS: { id: LevelTier; label: string; subtitle: string; description: string; highlights: string[] }[] = [
  {
    id: 'Beginner',
    label: 'BEGINNER',
    subtitle: 'Build your fundamentals and coding confidence.',
    description: 'Focus on core syntax, array loops, simple string operations, and basic defensive checks.',
    highlights: ['Linear array operations', 'Basic condition checks', 'Standard input/output flow'],
  },
  {
    id: 'Intermediate',
    label: 'INTERMEDIATE',
    subtitle: 'Practice algorithms, logic and common programming patterns.',
    description: 'Master hash maps, two-pointer techniques, sorting complexities, and robust error handling.',
    highlights: ['Sub-quadratic hash lookups', 'Two-pointer partitioning', 'Null pointer & boundary guards'],
  },
  {
    id: 'Pro',
    label: 'PRO',
    subtitle: 'Solve challenging problems and strengthen advanced problem-solving.',
    description: 'Conquer dynamic programming, graph traversals, concurrency race prevention, and optimal memory limits.',
    highlights: ['Optimal O(n) / O(1) space tradeoffs', 'Graph & tree traversals', 'High-throughput scaling'],
  },
]

export default function StudentLevelSelect() {
  const navigate = useNavigate()
  const { setStudentLevel, setSelectedTrack } = useAuthStore()
  const { setFilters } = useProblemStore()

  const handleSelectLevel = (level: LevelTier) => {
    setStudentLevel(level)
    setSelectedTrack('student')
    setFilters({
      mode: 'student',
      difficulty: level === 'Beginner' ? 'Easy' : level === 'Intermediate' ? 'Medium' : 'Hard',
    })
    navigate('/student/problems')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="navy" size="sm">STUDENT TRACK ONBOARDING</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
            CHOOSE YOUR LEVEL
          </h1>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70">
            Select the starting difficulty that matches your current problem-solving skills.
          </p>
        </div>

        {/* 3 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {LEVELS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex flex-col"
            >
              <Card
                hover
                onClick={() => handleSelectLevel(tier.id)}
                className="p-6 bg-[#1A130D] border-[#3A2F1D] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-mono font-bold text-[#E5DFC9]/60">0{idx + 1}</span>
                    <Badge variant={tier.id === 'Pro' ? 'gold' : tier.id === 'Intermediate' ? 'navy' : 'default'} size="sm">
                      {tier.id}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-[#E5DFC9] mb-1">
                    {tier.label}
                  </h3>
                  <p className="text-xs font-semibold text-[#E5DFC9]/90 mb-2">
                    {tier.subtitle}
                  </p>
                  <p className="text-2xs text-[#E5DFC9]/60 leading-relaxed mb-4">
                    {tier.description}
                  </p>

                  <div className="space-y-1.5 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-3xs text-[#E5DFC9]/80 font-mono">
                    {tier.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check size={11} className="text-[#E5DFC9]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  fullWidth
                  size="md"
                  variant="primary"
                  onClick={() => handleSelectLevel(tier.id)}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs shadow-md"
                >
                  Start {tier.id}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Secondary: Don't know your level? */}
        <div className="pt-4 text-center">
          <button
            onClick={() => navigate('/student/level-test')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-xs font-semibold text-[#E5DFC9] hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/40 transition-all shadow-md"
          >
            <HelpCircle size={14} className="text-[#E5DFC9]" />
            <span>Don't know your level? <strong className="underline ml-1">KNOW YOUR LEVEL</strong></span>
          </button>
        </div>
      </main>
    </div>
  )
}
