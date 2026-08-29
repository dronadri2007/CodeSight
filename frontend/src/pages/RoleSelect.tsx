import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Bot, ArrowRight, Check, Code2, Sparkles, Shield, Gauge } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'
import { useProblemStore } from '../store/problemStore'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { isAuthenticated, setRole } = useAuthStore()
  const { setFilters } = useProblemStore()

  const handleSelectStudent = () => {
    setRole('student')
    setFilters({ mode: 'student' })
    if (isAuthenticated) {
      navigate('/problems')
    } else {
      navigate('/auth?role=student')
    }
  }

  const handleSelectPro = () => {
    setRole('professional')
    setFilters({ mode: 'ai_engineer' })
    if (isAuthenticated) {
      navigate('/problems')
    } else {
      navigate('/auth?role=professional')
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Brand Header */}
      <Link to="/" className="mb-10 flex items-center justify-center">
        <BrandLogo size="lg" variant="dark" />
      </Link>

      <div className="w-full max-w-4xl text-center mb-10 space-y-2">
        <Badge variant="gold" size="sm">PERSONALIZED ONBOARDING</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
          Select Your Engineering Track
        </h1>
        <p className="text-sm text-[#E5DFC9]/70 max-w-lg mx-auto leading-relaxed">
          CodeSight offers two specialized workflows. Choose where you want to start (you can seamlessly toggle between tracks anytime).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Track 1: Student */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Card
            hover
            onClick={handleSelectStudent}
            className="p-8 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap size={28} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">TRACK 01</Badge>
              <h2 className="text-2xl font-bold text-[#E5DFC9] mb-2">
                Student Track
              </h2>
              <p className="text-sm font-semibold text-[#E5DFC9]/90 mb-3">
                Write from scratch &amp; optimize Time/Space Complexity
              </p>
              <p className="text-xs text-[#E5DFC9]/60 leading-relaxed mb-6">
                Students write clean implementations from scratch. Graded on Time Complexity ($TC$) &amp; Space Complexity ($SC$) relative to optimal achievable bounds.
              </p>

              <div className="space-y-2 mb-8 bg-[#000000] p-3.5 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Write code from scratch with test assertion runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>50% Time Complexity + 50% Space Complexity grading</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Claude AI algorithmic critique &amp; optimization guidance</span>
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

        {/* Track 2: AI-Assisted Professional */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Card
            hover
            onClick={handleSelectPro}
            className="p-8 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <Bot size={28} />
              </div>
              <Badge variant="gold" size="sm" className="mb-2">TRACK 02</Badge>
              <h2 className="text-2xl font-bold text-[#E5DFC9] mb-2">
                AI-Assisted Professional
              </h2>
              <p className="text-sm font-semibold text-[#E5DFC9]/90 mb-3">
                Review &amp; fix flawed AI-generated pull requests
              </p>
              <p className="text-xs text-[#E5DFC9]/60 leading-relaxed mb-6">
                Engineers inspect real flawed AI code directly in Monaco. Graded on fixing security vulnerabilities, maximizing efficiency deltas, and avoiding false-positive traps.
              </p>

              <div className="space-y-2 mb-8 bg-[#000000] p-3.5 rounded-xl border border-[#3A2F1D] text-2xs text-[#E5DFC9]/80">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Directly edit &amp; repair flawed AI code in Monaco</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>Eliminate SQL injection, race conditions &amp; resource leaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#E5DFC9]" />
                  <span>False-Positive penalty guardrails &amp; Code X-Ray</span>
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
              Enter AI Professional Track
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
