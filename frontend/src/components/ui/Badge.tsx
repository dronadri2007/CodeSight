import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted' | 'navy' | 'gold'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants = {
  default: 'bg-[#1A130D] border-[#3A2F1D] text-[#E5DFC9]/70',
  accent: 'bg-[#3A2F1D] border-[#E5DFC9]/30 text-[#E5DFC9] font-semibold',
  navy: 'bg-[#1A130D] border-[#3A2F1D] text-[#E5DFC9] font-mono',
  gold: 'bg-[#3A2F1D] border-[#E5DFC9]/30 text-[#E5DFC9] font-semibold',
  success: 'bg-[#3A2F1D] border-[#3A2F1D] text-[#E5DFC9]',
  warning: 'bg-[#3A2F1D] border-[#3A2F1D] text-[#E5DFC9]',
  danger: 'bg-[#3A2F1D] border-[#3A2F1D] text-[#E5DFC9]',
  muted: 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]/60',
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
          'bg-[#E5DFC9]/50': variant === 'default' || variant === 'muted',
          'bg-[#E5DFC9]': variant === 'accent' || variant === 'navy' || variant === 'warning' || variant === 'gold' || variant === 'success' || variant === 'danger',
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
