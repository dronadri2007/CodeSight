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
  primary: 'bg-[#E5DFC9] text-[#000000] font-bold hover:bg-[#F2EDDE] shadow-[0_2px_12px_rgba(0,0,0,0.5)] active:scale-[0.98] border border-[#E5DFC9]',
  secondary: 'bg-[#3A2F1D] border border-[#3A2F1D] text-[#E5DFC9] hover:bg-[#4A3D27] hover:border-[#E5DFC9]/30 active:scale-[0.98]',
  dark: 'bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] hover:bg-[#3A2F1D] active:scale-[0.98]',
  outline: 'bg-transparent border border-[#3A2F1D] text-[#E5DFC9] hover:bg-[#1A130D] hover:border-[#E5DFC9]/30 active:scale-[0.98]',
  ghost: 'text-[#E5DFC9]/75 hover:text-[#E5DFC9] hover:bg-[#1A130D] active:scale-[0.98]',
  gold: 'bg-[#E5DFC9] text-[#000000] font-bold hover:bg-[#F2EDDE] shadow-[0_2px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]',
  danger: 'bg-[#3A2F1D] border border-[#3A2F1D] text-[#E5DFC9] hover:bg-[#4A3D27] active:scale-[0.98]',
  success: 'bg-[#3A2F1D] border border-[#3A2F1D] text-[#E5DFC9] hover:bg-[#4A3D27] active:scale-[0.98]',
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
