import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';

export const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors duration-200 border-white/[0.08] dark:border-white/[0.08] dark:bg-[#0A0B0E]/85 bg-white/90 backdrop-blur-2xl border-slate-200 shadow-sm dark:shadow-none">
      <div className="w-full px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
        
        {/* Left: Edge-aligned Clean Logo */}
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <img
            src="/assets/logo.png"
            alt="CodeSight"
            className="h-8 sm:h-9 w-auto max-w-[160px] object-contain drop-shadow-[0_0_12px_rgba(0,122,255,0.4)]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Right: Theme Toggle, Admin Profile & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/10" />

          {/* Admin Avatar & Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A2A6C] to-[#007AFF] border border-slate-300 dark:border-white/25 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(0,122,255,0.3)]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#30D158] border-2 border-white dark:border-[#0A0B0E]" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-white/40 leading-none mt-1 font-mono">
                {user?.email || 'admin@codesight.dev'}
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-white/10" />

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
