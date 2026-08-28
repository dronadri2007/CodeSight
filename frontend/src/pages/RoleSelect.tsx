import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Shield, ArrowRight, Check, Code2, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'

export default function RoleSelect() {
  const navigate = useNavigate()
  const setRole = useAuthStore((state) => state.setRole)

  const handleSelectStudent = () => {
    setRole('student')
    navigate('/student/dashboard')
  }

  const handleSelectPro = () => {
    setRole('professional')
    navigate('/pro/dashboard')
  }

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-center items-center px-6 py-12">
      {/* Brand Header */}
      <Link to="/" className="mb-10 flex items-center justify-center">
        <BrandLogo size="lg" variant="light" />
      </Link>

      <div className="w-full max-w-4xl text-center mb-10">
        <Badge variant="accent" size="sm" className="mb-3">PERSONALIZED ONBOARDING</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
          How will you use CodeSight?
        </h1>
        <p className="text-sm text-light-textSecondary mt-2 max-w-lg mx-auto">
          Choose your primary workflow. You can seamlessly switch modes at any time.
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
            className="p-8 border-light-border bg-light-card flex-1 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-aqua-soft text-navy flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap size={28} />
              </div>
              <Badge variant="accent" size="sm" className="mb-2">TRACK 01</Badge>
              <h2 className="text-2xl font-bold text-navy mb-2 group-hover:text-aqua transition-colors">
                Student
              </h2>
              <p className="text-sm font-semibold text-light-text mb-3">
                Build your coding skills & instincts
              </p>
              <p className="text-xs text-light-textSecondary leading-relaxed mb-6">
                Write code in an interactive Monaco IDE, submit solutions, discover where you struggle (e.g. error handling, logic bounds), and learn the missing patterns.
              </p>

              <div className="space-y-2 mb-8 bg-light-elevated p-3.5 rounded-xl border border-light-border text-2xs text-light-textSecondary">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-success" />
                  <span>Monaco interactive coding workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-success" />
                  <span>Automated AI weakness diagnosis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-success" />
                  <span>Concept modules & micro-checks</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={() => navigate('/student/dashboard')}
              iconRight={<ArrowRight size={16} />}
            >
              Continue as Student
            </Button>
          </Card>
        </motion.div>

        {/* Track 2: Professional */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <Card
            hover
            onClick={handleSelectPro}
            className="p-8 border-navy-border bg-navy-surface text-white flex-1 flex flex-col justify-between group cursor-pointer shadow-xl"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-navy-midnight border border-navy-border text-aqua-bright flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Shield size={28} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">TRACK 02</Badge>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-aqua transition-colors">
                AI-Assisted Professional
              </h2>
              <p className="text-sm font-semibold text-aqua-bright mb-3">
                Review AI-assisted & unfamiliar code
              </p>
              <p className="text-xs text-slate leading-relaxed mb-6">
                Receive large real-world codebases (200-500+ lines), spot security & logic vulnerabilities, justify your findings, and benchmark your review judgment against AI.
              </p>

              <div className="space-y-2 mb-8 bg-navy-midnight p-3.5 rounded-xl border border-navy-border text-2xs text-slate">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-aqua" />
                  <span>Large codebase risk mapping & line tagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-aqua" />
                  <span>Code X-Ray structural scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-aqua" />
                  <span>AI vs. Human reviewer benchmarking</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="dark"
              onClick={handleSelectPro}
              iconRight={<ArrowRight size={16} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Continue as Professional
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
