import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-3xl overflow-hidden',
          'bg-[#121216]/65 backdrop-blur-2xl',
          'border border-white/[0.12]',
          'shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]',
          glow && 'shadow-[0_0_50px_rgba(0,122,255,0.15),0_20px_50px_rgba(0,0,0,0.5)]',
          className
        )
      )}
      {...props}
    >
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
