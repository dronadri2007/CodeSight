import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, Wrench, Lock, Check, Crosshair, Scale, Shield, Gauge } from 'lucide-react'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'
import { useProblemStore } from '../store/problemStore'
import { useThemeStore } from '../store/themeStore'

const EASE = [0.16, 1, 0.3, 1] as const

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setSelectedTrack, hasPassedPromotionalTest } = useAuthStore()
  const { setFilters } = useProblemStore()
  const { theme } = useThemeStore()

  const chooseStudent = () => {
    setSelectedTrack('student')
    setFilters({ mode: 'student' })
    navigate('/student/level-select')
  }

  const choosePro = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    navigate(hasPassedPromotionalTest ? '/pro/level-select' : '/pro/promotional-test')
  }

  const cap = 'flex items-start gap-2.5 text-[13px] leading-snug text-[#E5DFC9]/70'
  const capIcon = 'mt-0.5 flex-shrink-0 text-[#E5DFC9]/45'

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/home">
          <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5DFC9]/40">
          Pick your track
        </span>
      </div>

      {/* the fork — a diagonal split, one half per track */}
      <div className="relative isolate overflow-hidden border-t border-[#3A2F1D]">
        <div
          className="absolute inset-y-0 right-0 w-full bg-[#1A130D]"
          style={{ clipPath: 'polygon(56% 0, 100% 0, 100% 100%, 44% 100%)' }}
          aria-hidden
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 content-center md:grid-cols-2">
          {/* ---------- Student ---------- */}
          <motion.button
            type="button"
            onClick={chooseStudent}
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="group flex flex-col items-start gap-5 px-6 py-14 text-left outline-none md:py-20 md:pr-16 focus-visible:ring-2 focus-visible:ring-[#E5DFC9]/50 focus-visible:ring-inset"
          >
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3A2F1D] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E5DFC9]">
              <Code2 size={13} strokeWidth={2} /> Student track
              <span className="font-medium text-[#E5DFC9]/60">· open</span>
            </span>

            <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance text-[#E5DFC9] sm:text-[2.5rem]">
              Write optimal code
            </h2>
            <p className="max-w-[38ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">
              Solve from scratch. You're graded on the time and space complexity of what
              you wrote against the best achievable for the problem — not pass or fail.
            </p>

            <ul className="space-y-2.5">
              <li className={cap}><Gauge size={15} strokeWidth={1.75} className={capIcon} /> 50% time + 50% space, measured against optimal</li>
              <li className={cap}><Crosshair size={15} strokeWidth={1.75} className={capIcon} /> A diagnostic places you at the right tier</li>
              <li className={cap}><Check size={15} strokeWidth={1.75} className={capIcon} /> Claude explains every point you left behind</li>
            </ul>

            <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#E5DFC9] transition-[gap] group-hover:gap-3">
              Start the Student track
              <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.button>

          {/* ---------- AI Engineer ---------- */}
          <motion.button
            type="button"
            onClick={choosePro}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="group flex flex-col items-start gap-5 px-6 py-14 text-left outline-none md:py-20 md:pl-16 focus-visible:ring-2 focus-visible:ring-[#E5DFC9]/50 focus-visible:ring-inset"
          >
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3A2F1D] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E5DFC9]">
              <Wrench size={13} strokeWidth={2} /> AI Engineer track
              <span className="inline-flex items-center gap-1 font-medium text-[#E5DFC9]/60">
                ·{' '}
                {hasPassedPromotionalTest ? (
                  <><Check size={11} strokeWidth={2.5} /> unlocked</>
                ) : (
                  <><Lock size={11} strokeWidth={2.5} /> exam to unlock</>
                )}
              </span>
            </span>

            <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance text-[#E5DFC9] sm:text-[2.5rem]">
              Fix what the AI shipped
            </h2>
            <p className="max-w-[38ch] text-[15px] leading-relaxed text-[#E5DFC9]/70">
              Repair broken, AI-generated code in the editor. Points for the real bugs you
              catch and the efficiency you recover — points off for "fixing" what was
              never broken.
            </p>

            <ul className="space-y-2.5">
              <li className={cap}><Shield size={15} strokeWidth={1.75} className={capIcon} /> Six defect classes, one shared taxonomy</li>
              <li className={cap}><Scale size={15} strokeWidth={1.75} className={capIcon} /> Localisation and reasoning scored separately</li>
              <li className={cap}><Lock size={15} strokeWidth={1.75} className={capIcon} /> A timed review exam gates entry</li>
            </ul>

            <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#E5DFC9] transition-[gap] group-hover:gap-3">
              {hasPassedPromotionalTest ? 'Continue to the Pro track' : 'Take the entrance exam'}
              <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
