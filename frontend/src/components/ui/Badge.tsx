import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted' | 'navy' | 'gold'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants = {
  default: 'bg-[#151C24] border-[#29333A] text-[#AEB7B2]',
  accent: 'bg-[rgba(53,198,176,0.12)] border-[#35C6B0]/40 text-[#35C6B0] font-semibold',
  navy: 'bg-[#151C24] border-[#29333A] text-[#58D8C5] font-mono',
  gold: 'bg-[rgba(217,164,65,0.12)] border-[#D9A441]/40 text-[#D9A441] font-semibold',
  success: 'bg-[rgba(53,184,137,0.12)] border-[#35B889]/40 text-[#35B889]',
  warning: 'bg-[rgba(217,164,65,0.12)] border-[#D9A441]/40 text-[#D9A441]',
  danger: 'bg-[rgba(224,100,109,0.12)] border-[#E0646D]/40 text-[#E0646D]',
  muted: 'bg-[#0D1117] border-[#202A31] text-[#AEB7B2]',
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
          'bg-[#AEB7B2]': variant === 'default' || variant === 'muted',
          'bg-[#35C6B0]': variant === 'accent',
          'bg-[#58D8C5]': variant === 'navy',
          'bg-[#D9A441]': variant === 'warning' || variant === 'gold',
          'bg-[#35B889]': variant === 'success',
          'bg-[#E0646D]': variant === 'danger',
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
