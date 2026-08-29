import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-white/70">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-white/40 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={computedType}
          className={clsx(
            'w-full py-3.5 px-4 rounded-xl text-sm font-normal text-white placeholder:text-white/30',
            'bg-white/[0.05] backdrop-blur-xl border border-white/[0.12]',
            'focus:outline-none focus:border-[#007AFF] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#007AFF]/25',
            'transition-all duration-200',
            icon ? 'pl-11' : 'pl-4',
            isPassword ? 'pr-11' : 'pr-4',
            error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/25',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-white/40 hover:text-white/80 transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1 pl-1">{error}</p>}
    </div>
  );
};
