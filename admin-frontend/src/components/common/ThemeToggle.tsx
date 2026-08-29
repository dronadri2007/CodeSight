import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle theme"
      className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
        isDark
          ? 'bg-[#14151D] text-amber-400 hover:text-amber-300 border-white/[0.09] hover:bg-white/[0.06]'
          : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun size={16} className="rotate-0 hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon size={16} className="-rotate-12 hover:rotate-0 transition-transform duration-300" />
      )}
    </button>
  );
};
