import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: 'teal' | 'aqua' | 'success' | 'warning' | 'danger' | 'gold'
  dark?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const colorMap = {
  teal: 'bg-[#E5DFC9]',
  aqua: 'bg-[#E5DFC9]',
  gold: 'bg-[#E5DFC9]',
  success: 'bg-[#E5DFC9]',
  warning: 'bg-[#E5DFC9]',
  danger: 'bg-[#E5DFC9]',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  color = 'teal',
  dark = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-[#E5DFC9]/70">{label}</span>}
          {showValue && <span className="font-mono font-bold text-[#E5DFC9]">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx(
        'w-full rounded-full overflow-hidden bg-[#3A2F1D]',
        size === 'sm' ? 'h-1.5' : 'h-2'
      )}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface SkillBarProps {
  name: string
  value: number
  trend?: number
  attempts?: number
  color?: string
  dark?: boolean
  onClick?: () => void
  className?: string
}

export function SkillBar({ name, value, trend, attempts, color, dark = true, onClick, className }: SkillBarProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 p-4 rounded-xl border border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] transition-all select-none',
        'hover:border-[#E5DFC9]/40 hover:bg-[#3A2F1D]/40 shadow-sm',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#E5DFC9]">{name}</span>
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className="text-xs font-bold font-mono text-[#E5DFC9]/80">
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          <span className="text-sm font-extrabold font-mono text-[#E5DFC9]">{value}%</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-[#3A2F1D]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out bg-[#E5DFC9]"
          style={{ width: `${value}%` }}
        />
      </div>
      {attempts !== undefined && (
        <span className="text-2xs text-[#E5DFC9]/50">
          {attempts} exercise{attempts !== 1 ? 's' : ''} recorded
        </span>
      )}
    </div>
  )
}
