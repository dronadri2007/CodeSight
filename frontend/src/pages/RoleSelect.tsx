import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Bot, ArrowRight, Check, Code2, Sparkles, Shield, Lock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'
import { useProblemStore } from '../store/problemStore'
import { useThemeStore } from '../store/themeStore'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setSelectedTrack, hasPassedPromotionalTest } = useAuthStore()
  const { setFilters } = useProblemStore()
  const { theme } = useThemeStore()

  const handleSelectStudent = () => {
    setSelectedTrack('student')
    setFilters({ mode: 'student' })
    navigate('/student/level-select')
  }

  const handleSelectPro = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    if (hasPassedPromotionalTest) {
      navigate('/pro/level-select')
    } else {
      navigate('/pro/promotional-entry')
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Brand Header */}
      <Link to="/home" className="mb-8 flex items-center justify-center">
        <BrandLogo size="lg" variant={theme === 'light' ? 'light' : 'dark'} />
      </Link>

      <div className="w-full max-w-4xl text-center mb-10 space-y-2">
        <span className="text-2xs font-mono uppercase tracking-widest text-[#E5DFC9]/60 font-bold block">
          TRACK SELECTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
          HOW DO YOU WANT TO LEARN?
        </h1>
        <p className="text-xs sm:text-sm text-[#E5DFC9]/70 max-w-lg mx-auto leading-relaxed">
          Choose your learning pathway. Each track features a completely distinct workflow calibrated for your engineering goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card 1: STUDENT */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Card
            hover
            onClick={handleSelectStudent}
            className="p-8 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30 transition-all"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap size={28} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">TRACK 01</Badge>
              <h2 className="text-2xl font-bold text-[#E5DFC9] mb-2">
                STUDENT
              </h2>
              <p className="text-sm font-semibold text-[#E5DFC9]/90 mb-3">
                Build stronger coding fundamentals by solving programming problems.
              </p>
              <p className="text-xs text-[#E5DFC9]/60 leading-relaxed mb-6">
                Write algorithms from scratch. Run code against assertion test cases, submit for relative complexity scoring, and let CodeSight detect your edge-case and boundary weaknesses.
              </p>

              <div className="space-y-2 mb-8 bg-[#000000] p-3.5 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80 font-mono">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Primary Action: <strong>SOLVE</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Real working compiler &amp; test runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>50% Time + 50% Space complexity feedback</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={handleSelectStudent}
              iconRight={<ArrowRight size={16} className="text-[#000000]" />}
              className="font-bold text-xs shadow-lg"
            >
              Enter Student Track
            </Button>
          </Card>
        </motion.div>

        {/* Card 2: AI-ASSISTED PROFESSIONAL */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Card
            hover
            onClick={handleSelectPro}
            className="p-8 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30 transition-all"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Bot size={28} />
              </div>
              <Badge variant="gold" size="sm" className="mb-2">TRACK 02</Badge>
              <h2 className="text-2xl font-bold text-[#E5DFC9] mb-2">
                AI-ASSISTED PROFESSIONAL
              </h2>
              <p className="text-sm font-semibold text-[#E5DFC9]/90 mb-3">
                Train your ability to review and debug AI-assisted code.
              </p>
              <p className="text-xs text-[#E5DFC9]/60 leading-relaxed mb-6">
                Inspect AI-generated pull requests. Spot race conditions, security vulnerabilities, and logic flaws. Highlight lines, explain findings, and avoid false-positive traps.
              </p>

              <div className="space-y-2 mb-8 bg-[#000000] p-3.5 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80 font-mono">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Primary Action: <strong>DEBUG</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Line highlight &amp; finding explanation drawer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Promotional code review entrance assessment</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={handleSelectPro}
              iconRight={<ArrowRight size={16} className="text-[#000000]" />}
              className="font-bold text-xs shadow-lg"
            >
              {hasPassedPromotionalTest ? 'Enter Professional Track' : 'Start Promotional Assessment'}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
