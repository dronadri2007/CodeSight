import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, Compass, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Navbar } from '../../components/navigation/Navbar'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const EASE = [0.16, 1, 0.3, 1] as const

const BEGINNER_POINTS = [
  'Core syntax, array loops, string operations',
  'Basic condition checks and defensive guards',
  'Standard input / output flow',
]

export default function StudentLevelSelect() {
  const navigate = useNavigate()
  const { setStudentLevel, setSelectedTrack, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  const startBeginner = () => {
    setSelectedTrack('student')
    setStudentLevel('Beginner')
    setFilters({ mode: 'student', difficulty: 'Easy' })
    setOnboarded(true)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="navy" size="sm">STUDENT TRACK ONBOARDING</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">HOW DO YOU WANT TO START?</h1>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70">
            Jump straight in at Beginner, or take a short placement test and we'll set your level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] h-full flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <Badge variant="default" size="sm">BEGINNER</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">Start as Beginner</h3>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Build fundamentals and coding confidence from the ground up.
                </p>
                <div className="space-y-1.5 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-xs text-[#E5DFC9]/80 font-mono">
                  {BEGINNER_POINTS.map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <Check size={11} className="text-[#E5DFC9] flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button fullWidth size="md" variant="primary" onClick={startBeginner} iconRight={<ArrowRight size={14} />} className="font-bold text-xs">
                Start as Beginner
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: EASE }}>
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] h-full flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <Compass size={20} />
                  </div>
                  <Badge variant="navy" size="sm">PLACEMENT TEST</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">Know your level</h3>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Three quick questions on complexity, error handling and memory. Your score places you at Beginner, Intermediate or Pro.
                </p>
                <div className="space-y-1.5 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-xs text-[#E5DFC9]/60 font-mono">
                  <div>~3 minutes · multiple choice</div>
                  <div>No penalty for a low score — you can start anywhere</div>
                </div>
              </div>
              <Button
                fullWidth
                size="md"
                variant="secondary"
                onClick={() => navigate('/student/level-test')}
                iconRight={<ArrowRight size={14} />}
                className="font-bold text-xs"
              >
                Take the placement test
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
