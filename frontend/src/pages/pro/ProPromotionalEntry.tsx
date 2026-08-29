import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bot, Shield, CheckCircle2, ArrowRight, Lock, Sparkles,
  AlertTriangle, Code2, Eye, Compass
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'

export default function ProPromotionalEntry() {
  const navigate = useNavigate()
  const { hasPassedPromotionalTest, setPassedPromotionalTest } = useAuthStore()

  const handleAlreadyCompleted = () => {
    setPassedPromotionalTest(true)
    navigate('/pro/level-select')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] flex items-center justify-center mx-auto shadow-md">
              <Bot size={32} />
            </div>

            <div className="space-y-2">
              <Badge variant="gold" size="sm">PROFESSIONAL QUALIFICATION</Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9] tracking-tight">
                BECOME AN AI-ASSISTED PROFESSIONAL
              </h1>
              <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed max-w-md mx-auto">
                Before entering the professional track, complete a short promotional assessment to demonstrate your code-review skills.
              </p>
            </div>

            {/* Assessment Criteria */}
            <div className="p-5 rounded-2xl bg-[#000000] border border-[#3A2F1D] text-left space-y-3 font-mono text-2xs">
              <span className="font-bold text-[#E5DFC9] uppercase block border-b border-[#3A2F1D] pb-1.5">
                What the assessment tests:
              </span>
              <div className="space-y-2 text-[#E5DFC9]/70">
                <div className="flex items-start gap-2">
                  <Eye size={13} className="text-[#E5DFC9] mt-0.5 flex-shrink-0" />
                  <span><strong>Bug Localization:</strong> Pinpointing the exact lines containing security &amp; logic flaws.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield size={13} className="text-[#E5DFC9] mt-0.5 flex-shrink-0" />
                  <span><strong>Explanation Quality:</strong> Explaining why the flaw causes security leaks or race conditions.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} className="text-[#E5DFC9] mt-0.5 flex-shrink-0" />
                  <span><strong>False-Positive Restraint:</strong> Avoiding unnecessary flags on valid production patterns.</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-2">
              <Button
                fullWidth
                size="lg"
                variant="gold"
                onClick={() => navigate('/pro/promotional-test')}
                iconRight={<ArrowRight size={16} />}
                className="font-bold text-xs shadow-xl"
              >
                TAKE PROMOTIONAL TEST
              </Button>

              <button
                onClick={handleAlreadyCompleted}
                className="text-2xs text-[#E5DFC9]/60 hover:text-[#E5DFC9] font-mono underline"
              >
                Already qualified? Continue to Professional Track →
              </button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
