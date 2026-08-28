import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted' | 'navy'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants = {
  default: 'bg-light-elevated border-light-border text-light-textSecondary',
  accent: 'bg-aqua-soft border-aqua/30 text-navy font-semibold',
  navy: 'bg-navy-surface border-navy-borderStrong text-aqua-bright font-mono',
  success: 'bg-success-subtle border-success/30 text-success',
  warning: 'bg-warning-subtle border-warning/30 text-warning',
  danger: 'bg-danger-subtle border-danger/30 text-danger',
  muted: 'bg-light-bg border-light-border text-light-textMuted',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border font-medium select-none',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-light-textSecondary': variant === 'default',
          'bg-aqua': variant === 'accent',
          'bg-aqua-bright': variant === 'navy',
          'bg-success': variant === 'success',
          'bg-warning': variant === 'warning',
          'bg-danger': variant === 'danger',
          'bg-light-textMuted': variant === 'muted',
        })} />
      )}
      {children}
    </span>
  )
}

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard'
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <Badge
      variant={difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : 'danger'}
      className={className}
    >
      {difficulty}
    </Badge>
  )
}

export function StatusBadge({ status, className }: { status: 'New' | 'In Progress' | 'Completed' | 'Review Ready'; className?: string }) {
  const variant = status === 'Completed' ? 'success' : status === 'In Progress' ? 'warning' : 'navy'
  return (
    <Badge variant={variant} dot size="sm" className={className}>
      {status}
    </Badge>
  )
}
