import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Bot, GraduationCap, Shield, Sparkles, HelpCircle, Lock
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

export default function ProPromotionalResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setPassedPromotionalTest, setSelectedTrack } = useAuthStore()

  const state = location.state || {
    score: 85,
    localizationScore: 90,
    explanationScore: 80,
    passed: true,
  }

  const passed = state.passed ?? true
  const score = state.score ?? 85

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        {passed ? (
          /* PASSED STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-2">
                <Badge variant="gold" size="sm">ASSESSMENT PASSED · SCORE: {score}/100</Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9] tracking-tight">
                  Professional Track Unlocked
                </h1>
                <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed max-w-md mx-auto">
                  You demonstrated the code-review skills required to enter the AI-Assisted Professional track.
                </p>
              </div>

              {/* Review Metrics */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                  <span className="text-3xs text-[#E5DFC9]/50 block">Bug Localization</span>
                  <strong className="text-base text-[#E5DFC9]">{state.localizationScore || 90}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                  <span className="text-3xs text-[#E5DFC9]/50 block">Explanation Quality</span>
                  <strong className="text-base text-[#E5DFC9]">{state.explanationScore || 85}%</strong>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="gold"
                  onClick={() => navigate('/pro/level-select')}
                  iconRight={<ArrowRight size={16} />}
                  className="font-bold text-xs shadow-xl"
                >
                  CONTINUE TO PROFESSIONAL TRACK →
                </Button>

                <button
                  onClick={() => navigate('/pro/level-test')}
                  className="text-2xs text-[#E5DFC9]/60 hover:text-[#E5DFC9] font-mono underline inline-flex items-center gap-1"
                >
                  <HelpCircle size={12} /> Don't know your review level? Take quick diagnostic →
                </button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* FAILED STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-rose-400 text-rose-400 flex items-center justify-center mx-auto shadow-md">
                <XCircle size={32} />
              </div>

              <div className="space-y-2">
                <Badge variant="danger" size="sm">SCORE: {score}/100 · PASS REQUIREMENT: 60/100</Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9] tracking-tight">
                  Professional Track Not Yet Unlocked
                </h1>
                <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed max-w-md mx-auto">
                  Your review skills need a little more practice before entering the professional track.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] text-2xs text-[#E5DFC9]/70 text-left font-mono space-y-2">
                <span className="font-bold text-[#E5DFC9] block">Review Diagnosis:</span>
                <p>• Identify SQL query formatting vulnerability and flag exact lines.</p>
                <p>• Avoid flagging standard imports or clean utility methods to prevent false-positive penalties.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="md"
                  variant="gold"
                  onClick={() => navigate('/pro/promotional-test')}
                  icon={<RotateCcw size={14} />}
                  className="font-bold text-xs"
                >
                  RETAKE PROMOTIONAL TEST
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => {
                    setSelectedTrack('student')
                    navigate('/student/problems')
                  }}
                  iconRight={<ArrowRight size={14} />}
                  className="text-xs"
                >
                  CONTINUE WITH STUDENT TRACK
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
