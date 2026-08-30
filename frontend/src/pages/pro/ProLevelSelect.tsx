import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, ArrowRight, HelpCircle, Check, Shield } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Navbar } from '../../components/navigation/Navbar'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const PRO_LEVELS: { id: LevelTier; label: string; subtitle: string; description: string; highlights: string[] }[] = [
  {
    id: 'Beginner',
    label: 'BEGINNER REVIEWER',
    subtitle: 'Spot obvious logic and input sanitization bugs.',
    description: 'Inspect small pull requests (15-30 lines) with single-defect vulnerabilities like SQL string concatenation and unhandled None values.',
    highlights: ['Direct SQL injections', 'Missing NoneType guard checks', 'Unchecked array bounds'],
  },
  {
    id: 'Intermediate',
    label: 'INTERMEDIATE REVIEWER',
    subtitle: 'Audit authentication bypasses and resource leaks.',
    description: 'Review medium pull requests (30-80 lines) involving timing-unsafe equality comparisons, JWT token signing, and unclosed file descriptors.',
    highlights: ['Timing side-channel leaks', 'Unbounded file reader memory spikes', 'JWT secret key hardcoding'],
  },
  {
    id: 'Pro',
    label: 'PRO REVIEWER',
    subtitle: 'Detect high-stakes concurrency race conditions & deadlocks.',
    description: 'Audit full production services (100-300+ lines) for non-atomic database transactions, double-check locking defects, and deadlock cycles.',
    highlights: ['Thread race conditions', 'Lock ordering deadlocks', 'Non-atomic balance transfers'],
  },
]

export default function ProLevelSelect() {
  const navigate = useNavigate()
  const { setProLevel, setSelectedTrack, hasPassedPromotionalTest } = useAuthStore()
  const { setFilters } = useProblemStore()

  useEffect(() => {
    if (!hasPassedPromotionalTest) {
      navigate('/pro/entrance-test')
    }
  }, [hasPassedPromotionalTest, navigate])

  const handleSelectLevel = (level: LevelTier) => {
    setProLevel(level)
    setSelectedTrack('pro')
    setFilters({
      mode: 'ai_engineer',
      difficulty: level === 'Beginner' ? 'Easy' : level === 'Intermediate' ? 'Medium' : 'Hard',
    })
    navigate('/pro/problems')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="gold" size="sm">PROFESSIONAL TRACK ONBOARDING</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
            WHAT'S YOUR REVIEW LEVEL?
          </h1>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70">
            Choose your starting review difficulty for AI code audits and vulnerability detection.
          </p>
        </div>

        {/* 3 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {PRO_LEVELS.map((tier, idx) => (
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
                    <Badge variant="gold" size="sm">
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
                  variant="gold"
                  onClick={() => handleSelectLevel(tier.id)}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs shadow-md"
                >
                  Start as {tier.id}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Secondary: Don't know your level? */}
        <div className="pt-4 text-center">
          <button
            onClick={() => navigate('/pro/level-test')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-xs font-semibold text-[#E5DFC9] hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/40 transition-all shadow-md"
          >
            <HelpCircle size={15} className="text-[#E5DFC9]" />
            <span className="uppercase tracking-wider font-bold">DON'T KNOW YOUR LEVEL?</span>
            <span className="text-[#E5DFC9]/70 ml-1">· Launch Review Diagnostic →</span>
          </button>
        </div>
      </main>
    </div>
  )
}
