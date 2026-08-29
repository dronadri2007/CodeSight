import { useNavigate } from 'react-router-dom'
import { Shield, Lock, CheckCircle2, Sparkles, ArrowRight, Award } from 'lucide-react'
import { LEVELS } from '../../store/authStore'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { UserLevel } from '../../types'

interface LevelStepperProps {
  currentLevel: UserLevel
  currentLevelIndex: number
}

export function LevelStepper({ currentLevel, currentLevelIndex }: LevelStepperProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#E5DFC9] flex items-center gap-2">
            <Award size={16} className="text-[#E5DFC9]" /> Level Progression & Promotion
          </h3>
          <p className="text-xs text-[#E5DFC9]/60">
            Progression across the 6 engineering tiers requires passing proctored, timed Promotion Exams.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/exam')}
          icon={<Sparkles size={13} className="text-[#000000]" />}
          className="text-xs font-bold shadow-md whitespace-nowrap"
        >
          Take Promotion Exam
        </Button>
      </div>

      {/* 6-Level Horizontal Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
        {LEVELS.map((levelName, idx) => {
          const stepNumber = idx + 1
          const isCurrent = stepNumber === currentLevelIndex
          const isUnlocked = stepNumber < currentLevelIndex
          const isLocked = stepNumber > currentLevelIndex

          return (
            <div
              key={levelName}
              className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between min-h-[110px] ${
                isCurrent
                  ? 'bg-[#1A130D] border-[#E5DFC9] shadow-[0_0_20px_rgba(229,223,201,0.15)] ring-1 ring-[#E5DFC9]/40'
                  : isUnlocked
                  ? 'bg-[#1A130D]/80 border-[#3A2F1D] text-[#E5DFC9]'
                  : 'bg-[#000000]/60 border-[#3A2F1D]/50 text-[#E5DFC9]/40 opacity-60'
              }`}
            >
              {/* Top Row: Step indicator */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xs font-bold text-[#E5DFC9]/60">
                  TIER 0{stepNumber}
                </span>
                {isUnlocked ? (
                  <CheckCircle2 size={14} className="text-[#E5DFC9]" />
                ) : isCurrent ? (
                  <Badge variant="gold" size="sm">ACTIVE</Badge>
                ) : (
                  <Lock size={12} className="text-[#E5DFC9]/40" />
                )}
              </div>

              {/* Bottom Row: Level Title */}
              <div>
                <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-[#E5DFC9]' : isUnlocked ? 'text-[#E5DFC9]/90' : 'text-[#E5DFC9]/40'}`}>
                  {levelName}
                </p>
                <p className="text-2xs text-[#E5DFC9]/50 mt-0.5">
                  {stepNumber <= 3 ? 'Student Track' : 'AI Engineer Track'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
