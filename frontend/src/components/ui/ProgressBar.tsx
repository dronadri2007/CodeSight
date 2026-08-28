import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: 'aqua' | 'success' | 'warning' | 'danger'
  dark?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const colorMap = {
  aqua: 'bg-aqua',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  color = 'aqua',
  dark = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className={clsx('font-medium', dark ? 'text-slate' : 'text-light-textSecondary')}>{label}</span>}
          {showValue && <span className={clsx('font-mono font-bold', dark ? 'text-white' : 'text-navy')}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx(
        'w-full rounded-full overflow-hidden',
        dark ? 'bg-navy-elevated' : 'bg-light-border',
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

export function SkillBar({ name, value, trend, attempts, color, dark = false, onClick, className }: SkillBarProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 p-4 rounded-xl border transition-all select-none',
        dark
          ? 'bg-navy-surface border-navy-border text-white hover:border-aqua/40'
          : 'bg-light-card border-light-border text-light-text hover:border-light-borderStrong shadow-sm',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={clsx('text-xs font-bold font-mono', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          <span className={clsx('text-sm font-extrabold font-mono', dark ? 'text-aqua-bright' : 'text-navy')}>{value}%</span>
        </div>
      </div>
      <div className={clsx('w-full h-2 rounded-full overflow-hidden', dark ? 'bg-navy-elevated' : 'bg-light-border')}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color || '#20C7D9' }}
        />
      </div>
      {attempts !== undefined && (
        <span className={clsx('text-2xs', dark ? 'text-slate' : 'text-light-textMuted')}>
          {attempts} exercise{attempts !== 1 ? 's' : ''} recorded
        </span>
      )}
    </div>
  )
}
