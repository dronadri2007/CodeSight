import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  loading = false,
  variant = 'primary',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none select-none';
  
  const variants = {
    primary:
      'bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#0A84FF] hover:to-[#0056B3] text-white shadow-[0_4px_20px_rgba(0,122,255,0.4)] hover:shadow-[0_6px_25px_rgba(0,122,255,0.6)] active:scale-[0.98] border border-white/20',
    secondary:
      'bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.15] backdrop-blur-xl active:scale-[0.98]',
    danger:
      'bg-red-600/80 hover:bg-red-600 text-white shadow-[0_4px_15px_rgba(255,69,58,0.3)] active:scale-[0.98] border border-red-500/30',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-white/70 hover:text-white',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        'py-3.5 px-6 text-sm',
        (disabled || loading) && 'opacity-60 cursor-not-allowed active:scale-100 hover:shadow-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Please wait...</span>
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};
