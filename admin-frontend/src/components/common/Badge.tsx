import React from 'react';
import { clsx } from 'clsx';
import { Difficulty, ProblemStatus } from '../../types';

interface BadgeProps {
  type?: 'difficulty' | 'status' | 'tag' | 'defect';
  value: Difficulty | ProblemStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'tag', value, className = '' }) => {
  let colorStyles = 'bg-white/[0.08] text-white/80 border-white/[0.12]';

  if (type === 'difficulty') {
    switch (value) {
      case 'Easy':
        colorStyles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
        break;
      case 'Medium':
        colorStyles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        break;
      case 'Hard':
        colorStyles = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
        break;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'Approved':
        colorStyles = 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30';
        break;
      case 'Pending':
        colorStyles = 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30';
        break;
      case 'Draft':
        colorStyles = 'bg-white/10 text-white/60 border-white/20';
        break;
    }
  } else if (type === 'defect') {
    colorStyles = 'bg-[#BF5AF2]/15 text-[#BF5AF2] border-[#BF5AF2]/30';
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md',
        colorStyles,
        className
      )}
    >
      {value}
    </span>
  );
};
