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
    <div className="min-h-screen bg-[#0D1117] text-[#F4F1E8] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#35C6B0]/30 selection:text-[#F4F1E8]">
      {/* Brand Header */}
      <Link to="/" className="mb-10 flex items-center justify-center">
        <BrandLogo size="lg" variant="dark" />
      </Link>

      <div className="w-full max-w-4xl text-center mb-10">
        <Badge variant="navy" size="sm" className="mb-3">PERSONALIZED ONBOARDING</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F1E8] tracking-tight">
          How will you use CodeSight?
        </h1>
        <p className="text-sm text-[#AEB7B2] mt-2 max-w-lg mx-auto">
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
            className="p-8 border-[#29333A] bg-[#151C24] text-[#F4F1E8] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#35C6B0]/50"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#0D1117] border border-[#29333A] text-[#35C6B0] flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap size={28} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">TRACK 01</Badge>
              <h2 className="text-2xl font-bold text-[#F4F1E8] mb-2 group-hover:text-[#35C6B0] transition-colors">
                Student
              </h2>
              <p className="text-sm font-semibold text-[#35C6B0] mb-3">
                Build your coding skills &amp; instincts
              </p>
              <p className="text-xs text-[#AEB7B2] leading-relaxed mb-6">
                Write code in an interactive Monaco IDE, submit solutions, discover where you struggle (e.g. error handling, logic bounds), and learn the missing patterns.
              </p>

              <div className="space-y-2 mb-8 bg-[#0D1117] p-3.5 rounded-xl border border-[#202A31] text-2xs text-[#DDD9CF]">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35B889]" />
                  <span>Monaco interactive coding workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35B889]" />
                  <span>Personalized weakness &amp; blind spot analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35B889]" />
                  <span>Vulnerable vs. Safer pattern diffs</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={handleSelectStudent}
              iconRight={<ArrowRight size={16} />}
              className="font-bold shadow-[0_0_20px_rgba(53,198,176,0.25)]"
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
            className="p-8 border-[#29333A] bg-[#151C24] text-[#F4F1E8] flex-1 flex flex-col justify-between group cursor-pointer shadow-xl hover:border-[#35C6B0]/50"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#0D1117] border border-[#29333A] text-[#58D8C5] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Shield size={28} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">TRACK 02</Badge>
              <h2 className="text-2xl font-bold text-[#F4F1E8] mb-2 group-hover:text-[#35C6B0] transition-colors">
                AI-Assisted Professional
              </h2>
              <p className="text-sm font-semibold text-[#58D8C5] mb-3">
                Review AI-assisted &amp; unfamiliar code
              </p>
              <p className="text-xs text-[#AEB7B2] leading-relaxed mb-6">
                Receive large real-world codebases (200-500+ lines), spot security &amp; logic vulnerabilities, justify your findings, and benchmark your review judgment against AI.
              </p>

              <div className="space-y-2 mb-8 bg-[#0D1117] p-3.5 rounded-xl border border-[#202A31] text-2xs text-[#DDD9CF]">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35C6B0]" />
                  <span>Large codebase risk mapping &amp; line tagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35C6B0]" />
                  <span>Code X-Ray structural scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-[#35C6B0]" />
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
              className="bg-[#35C6B0] text-[#0D1117] hover:bg-[#58D8C5] font-bold border-none"
            >
              Continue as Professional
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
