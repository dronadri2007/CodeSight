import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants = {
  default: 'bg-bg-elevated border-border text-text-secondary',
  accent: 'bg-accent-subtle border-accent/30 text-accent',
  success: 'bg-success-subtle border-success/30 text-success',
  warning: 'bg-warning-subtle border-warning/30 text-warning',
  danger: 'bg-danger-subtle border-danger/30 text-danger',
  muted: 'bg-bg-surface border-border text-text-muted',
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        variants[variant],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-text-secondary': variant === 'default',
        'bg-accent': variant === 'accent',
        'bg-success': variant === 'success',
        'bg-warning': variant === 'warning',
        'bg-danger': variant === 'danger',
        'bg-text-muted': variant === 'muted',
      })} />}
      {children}
    </span>
  )
}

interface DifficultyBadgeProps { difficulty: 'Easy' | 'Medium' | 'Hard'; className?: string }

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

interface StatusBadgeProps { status: 'not-started' | 'completed' | 'needs-practice' | 'in-progress'; className?: string }

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const map = {
    'not-started': { variant: 'muted' as const, label: 'Not Started' },
    completed: { variant: 'success' as const, label: 'Completed' },
    'needs-practice': { variant: 'warning' as const, label: 'Needs Practice' },
    'in-progress': { variant: 'accent' as const, label: 'In Progress' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant} dot className={className}>{label}</Badge>
}
