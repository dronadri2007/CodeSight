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
  teal: 'bg-[#35C6B0]',
  aqua: 'bg-[#35C6B0]',
  gold: 'bg-[#D9A441]',
  success: 'bg-[#35B889]',
  warning: 'bg-[#D9A441]',
  danger: 'bg-[#E0646D]',
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
          {label && <span className="font-medium text-[#AEB7B2]">{label}</span>}
          {showValue && <span className="font-mono font-bold text-[#F4F1E8]">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx(
        'w-full rounded-full overflow-hidden bg-[#1A232D]',
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
        'flex flex-col gap-2 p-4 rounded-xl border border-[#29333A] bg-[#151C24] text-[#F4F1E8] transition-all select-none',
        'hover:border-[#35C6B0]/50 shadow-sm',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#F4F1E8]">{name}</span>
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={clsx('text-xs font-bold font-mono', trend >= 0 ? 'text-[#35B889]' : 'text-[#E0646D]')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          <span className="text-sm font-extrabold font-mono text-[#58D8C5]">{value}%</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-[#1A232D]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color || '#35C6B0' }}
        />
      </div>
      {attempts !== undefined && (
        <span className="text-2xs text-[#AEB7B2]">
          {attempts} exercise{attempts !== 1 ? 's' : ''} recorded
        </span>
      )}
    </div>
  )
}
