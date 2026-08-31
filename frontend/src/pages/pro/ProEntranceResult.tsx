import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, GraduationCap } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import type { EntranceResultState } from './ProEntranceTest'

const ELIGIBLE_MIN = 6

export default function ProEntranceResult() {
  const navigate = useNavigate()
  const raw = useLocation().state as EntranceResultState | null
  const state =
    raw && typeof raw.score === 'number' && typeof raw.maxScore === 'number' &&
    typeof raw.eligible === 'boolean' && typeof raw.tier === 'string'
      ? raw
      : null
  const { setSelectedTrack, setStudentLevel, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  if (!state) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25">
        <Navbar variant="pro" />
        <main className="flex-1 max-w-md w-full mx-auto px-6 py-24 flex flex-col items-start gap-3">
          <h1 className="text-xl font-extrabold tracking-[-0.02em]">No result to show</h1>
          <p className="text-[13px] text-[#E5DFC9]/60">Take the AI-Engineer entrance test first.</p>
          <Button size="md" variant="gold" onClick={() => navigate('/pro/entrance-test')} className="mt-2 text-[13px]">
            Start the entrance test
          </Button>
        </main>
      </div>
    )
  }

  const { score, maxScore, eligible, tier } = state

  const startStudentInstead = () => {
    setSelectedTrack('student')
    setStudentLevel('Beginner')
    setFilters({ mode: 'student', difficulty: 'Easy' })
    setOnboarded(true)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
            <div
              className={`w-16 h-16 rounded-2xl bg-[#000000] border-2 flex items-center justify-center mx-auto shadow-md ${
                eligible ? 'border-[#E5DFC9] text-[#E5DFC9]' : 'border-[#3A2F1D] text-[#E5DFC9]/70'
              }`}
            >
              {eligible ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>

            <div className="space-y-2">
              <Badge variant={eligible ? 'gold' : 'default'} size="sm">
                SCORE {score} / {maxScore}
                {!eligible && ` · UNLOCK AT ${ELIGIBLE_MIN}`}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {eligible ? 'AI-Engineer track unlocked' : 'Not unlocked yet'}
              </h1>
              <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed max-w-md mx-auto">
                {eligible
                  ? `You've been placed at the ${tier} reviewer tier based on your score.`
                  : 'Your code-review score is below the entry bar. Retake the test, or start on the Student track and come back later.'}
              </p>
            </div>

            {eligible ? (
              <div className="pt-2">
                <Button
                  fullWidth
                  size="lg"
                  variant="gold"
                  onClick={() => navigate('/home')}
                  iconRight={<ArrowRight size={16} />}
                  className="font-bold text-xs shadow-xl"
                >
                  Continue as {tier} reviewer
                </Button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="md"
                  variant="gold"
                  onClick={() => navigate('/pro/entrance-test')}
                  icon={<RotateCcw size={14} />}
                  className="font-bold text-xs"
                >
                  Retake the test
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={startStudentInstead}
                  icon={<GraduationCap size={14} />}
                  iconRight={<ArrowRight size={14} />}
                  className="text-xs"
                >
                  Start the Student track instead
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
