import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Shield, Swords, BarChart3, Bot, Code2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, userProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isWelcomePage = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="h-16 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left: Wordmark and Nav Links */}
        <div className="flex items-center gap-10">
          <Link
            to={isWelcomePage ? "/" : "/dashboard"}
            className="group flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-sm"
          >
            {/* Text-only wordmark per exact specifications */}
            <span className="font-display text-xl md:text-2xl font-semibold tracking-[-0.03em] text-on-surface hover:text-primary transition-colors">
              CodeSight
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm transition-colors py-1 ${
                  isActive
                    ? 'text-primary font-medium border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `text-sm transition-colors py-1 ${
                  isActive
                    ? 'text-primary font-medium border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              Practice
            </NavLink>
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `text-sm transition-colors py-1 ${
                  isActive
                    ? 'text-primary font-medium border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              Progress
            </NavLink>
            <NavLink
              to="/battle"
              className={({ isActive }) =>
                `text-sm transition-colors py-1 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary font-medium border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              <Swords className="w-3.5 h-3.5 opacity-80" />
              Battle
            </NavLink>
            <NavLink
              to="/ai-vs-you"
              className={({ isActive }) =>
                `text-sm transition-colors py-1 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary font-medium border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              <Bot className="w-3.5 h-3.5 opacity-80" />
              AI vs You
            </NavLink>
          </nav>
        </div>

        {/* Right: Theme switch and Profile */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Profile Chip */}
          <Link
            to="/progress"
            className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full bg-surface-container-high/40 border border-outline-variant/15 hover:border-outline-variant/30 hover:bg-surface-container-high/60 transition-all text-xs font-medium text-on-surface"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-mono text-[11px] font-bold">
              {userProfile.name[0]}
            </div>
            <span>{userProfile.name}</span>
            <span className="font-mono text-[11px] text-primary font-semibold">
              {userProfile.overallSkill}%
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/10 bg-surface/95 backdrop-blur-2xl px-6 py-4 flex flex-col gap-3 shadow-xl">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm py-2 text-on-surface-variant hover:text-on-surface"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm py-2 text-on-surface-variant hover:text-on-surface"
          >
            Practice
          </NavLink>
          <NavLink
            to="/progress"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm py-2 text-on-surface-variant hover:text-on-surface"
          >
            Progress
          </NavLink>
          <NavLink
            to="/battle"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm py-2 flex items-center gap-2 text-on-surface-variant hover:text-on-surface"
          >
            <Swords className="w-4 h-4" />
            Battle
          </NavLink>
          <NavLink
            to="/ai-vs-you"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm py-2 flex items-center gap-2 text-on-surface-variant hover:text-on-surface"
          >
            <Bot className="w-4 h-4" />
            AI vs You
          </NavLink>
        </div>
      )}
    </header>
  );
};
