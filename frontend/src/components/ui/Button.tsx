import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger' | 'success' | 'outline' | 'gold'
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
  primary: 'bg-[#35C6B0] text-[#0D1117] font-bold hover:bg-[#58D8C5] shadow-[0_0_20px_rgba(53,198,176,0.25)] active:scale-[0.98] border border-[#35C6B0]/40',
  secondary: 'bg-[#151C24] border border-[#29333A] text-[#DDD9CF] hover:bg-[#1A232D] hover:text-[#F4F1E8] hover:border-[#35C6B0]/40 active:scale-[0.98]',
  dark: 'bg-[#151C24] border border-[#29333A] text-[#F4F1E8] hover:bg-[#1A232D] hover:border-[#35C6B0]/50 active:scale-[0.98]',
  outline: 'bg-transparent border border-[#29333A] text-[#F4F1E8] hover:bg-[#151C24] hover:border-[#35C6B0]/40 active:scale-[0.98]',
  ghost: 'text-[#AEB7B2] hover:text-[#F4F1E8] hover:bg-[#151C24] active:scale-[0.98]',
  gold: 'bg-[#D9A441] text-[#0D1117] font-bold hover:bg-[#E8BC5A] shadow-[0_0_20px_rgba(217,164,65,0.25)] active:scale-[0.98] border border-[#D9A441]/40',
  danger: 'bg-[#E0646D]/10 border border-[#E0646D]/30 text-[#E0646D] hover:bg-[#E0646D]/20 active:scale-[0.98]',
  success: 'bg-[#35B889]/10 border border-[#35B889]/30 text-[#35B889] hover:bg-[#35B889]/20 active:scale-[0.98]',
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
