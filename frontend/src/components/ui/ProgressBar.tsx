import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: 'accent' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  animated?: boolean
  className?: string
}

const colorMap = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  color = 'accent',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showValue && <span className="text-xs font-mono text-text-muted">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-border rounded-full overflow-hidden', size === 'sm' ? 'h-1' : 'h-1.5')}>
        <div
          className={clsx(
            'h-full rounded-full',
            colorMap[color],
            animated && 'transition-all duration-700 ease-out'
          )}
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
  onClick?: () => void
  className?: string
}

export function SkillBar({ name, value, trend, attempts, color, onClick, className }: SkillBarProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 p-3 rounded-lg border border-border bg-bg-surface',
        onClick && 'cursor-pointer hover:border-border-strong transition-colors duration-150',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={clsx('text-xs font-medium', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          <span className="text-sm font-bold font-mono text-text-primary">{value}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color || '#5B7CFF' }}
        />
      </div>
      {attempts !== undefined && (
        <span className="text-2xs text-text-muted">{attempts} attempt{attempts !== 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
