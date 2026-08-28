import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
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
  primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm',
  secondary: 'bg-bg-elevated border border-border text-text-primary hover:bg-bg-subtle hover:border-border-strong active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated active:scale-[0.98]',
  danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 active:scale-[0.98]',
  success: 'bg-success/10 border border-success/30 text-success hover:bg-success/20 active:scale-[0.98]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5 rounded',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
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

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  size?: ButtonSize
  variant?: ButtonVariant
  active?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'md', variant = 'ghost', active, className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-150 rounded-md',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'ghost'
          ? 'text-text-muted hover:text-text-primary hover:bg-bg-elevated active:scale-95'
          : variantStyles[variant],
        active && 'text-accent bg-accent-subtle',
        size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
)
IconButton.displayName = 'IconButton'
