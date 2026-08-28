import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger' | 'success' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-surface active:scale-[0.98] shadow-sm border border-navy/20',
  secondary: 'bg-light-card border border-light-border text-light-text hover:bg-light-elevated hover:border-light-borderStrong active:scale-[0.98]',
  dark: 'bg-navy-surface border border-navy-borderStrong text-white hover:bg-navy-elevated hover:border-aqua/50 active:scale-[0.98]',
  outline: 'bg-transparent border border-navy/20 text-navy hover:bg-navy/5 active:scale-[0.98]',
  ghost: 'text-light-textSecondary hover:text-navy hover:bg-navy/5 active:scale-[0.98]',
  danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 active:scale-[0.98]',
  success: 'bg-success/10 border border-success/30 text-success hover:bg-success/20 active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-medium',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl font-medium',
  lg: 'h-12 px-6 text-sm gap-2.5 rounded-xl font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 12 : 14} /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
)
Button.displayName = 'Button'
