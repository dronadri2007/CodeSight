import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Bell, Moon, Sun, User, LogOut, Home,
  Swords, Shield, ChevronDown, Check, Sparkles, Code2,
  GraduationCap, Bot, Compass, HelpCircle
} from 'lucide-react'
import { BrandLogo } from '../ui/BrandLogo'
import { Badge } from '../ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import { useThemeStore } from '../../store/themeStore'

interface NavbarProps {
  variant?: 'marketing' | 'app' | 'student' | 'pro'
}

export function Navbar({ variant = 'app' }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, hasPassedPromotionalTest, selectedTrack, setSelectedTrack } = useAuthStore()
  const { filters, setFilters } = useProblemStore()
  const { theme, toggleTheme } = useThemeStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomeActive = location.pathname === '/home' || location.pathname === '/dashboard' || location.pathname === '/'
  const isProblemsActive = location.pathname === '/problems' || location.pathname.startsWith('/practice')
  const isContestActive = location.pathname.startsWith('/contest') || location.pathname.startsWith('/battle')
  const isStudentActive = location.pathname.startsWith('/student')
  const isProActive = location.pathname.startsWith('/pro')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStudentTrackClick = () => {
    setSelectedTrack('student')
    setFilters({ mode: 'student' })
    navigate('/student/problems')
  }

  const handleProTrackClick = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    if (hasPassedPromotionalTest) {
      navigate('/pro/problems')
    } else {
      navigate('/pro/promotional-entry')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b transition-colors bg-[#000000] border-[#3A2F1D] text-[#E5DFC9] html-light:bg-[#F8F5EC] html-light:border-[#D0C5AE] html-light:text-[#1A130D] select-none">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-5">
          <Link to="/home" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {/* 1. Home Link - REAL WORKING NAVIGATION ITEM */}
            <Link
              to="/home"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isHomeActive
                  ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D] font-bold shadow-inner'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Home size={13} />
              <span>Home</span>
            </Link>

            {/* 2. Problems Link */}
            <Link
              to="/problems"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isProblemsActive && !isStudentActive && !isProActive
                  ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D] font-bold shadow-inner'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Code2 size={13} />
              <span>Problems</span>
            </Link>

            {/* 3. Contest Link */}
            <Link
              to="/contest"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isContestActive
                  ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D] font-bold shadow-inner'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Swords size={13} />
              <span>Contest</span>
            </Link>

            <div className="h-4 w-px bg-[#3A2F1D] mx-1" />

            {/* 4. Student Track */}
            <button
              onClick={handleStudentTrackClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isStudentActive || (isProblemsActive && filters.mode === 'student')
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <GraduationCap size={13} />
              <span>Student Track</span>
            </button>

            {/* 5. AI-Assisted Pro */}
            <button
              onClick={handleProTrackClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isProActive || (isProblemsActive && filters.mode === 'ai_engineer')
                  ? 'bg-[#E5DFC9] text-[#000000] font-bold shadow-sm'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Bot size={13} />
              <span>AI-Assisted Pro</span>
              {!hasPassedPromotionalTest && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Assessment Required" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Search, Theme Toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-2.5" ref={dropdownRef}>
          {/* Search Input */}
          <div className="hidden lg:flex items-center relative max-w-[170px]">
            <Search size={13} className="absolute left-3 text-[#E5DFC9]/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#1A130D] border border-[#3A2F1D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E5DFC9] placeholder-[#E5DFC9]/40 focus:outline-none focus:border-[#E5DFC9]/60 transition-colors"
            />
          </div>

          {/* Theme Toggle (Working Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:border-[#E5DFC9]/40 flex items-center justify-center transition-colors"
            title={`Current: ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to toggle)`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-8 h-8 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9]/70 hover:text-[#E5DFC9] flex items-center justify-center transition-colors relative"
            >
              <Bell size={14} />
              <span className="w-2 h-2 rounded-full bg-[#E5DFC9] absolute top-1.5 right-1.5" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1A130D] border border-[#3A2F1D] rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-2">
                  <span className="font-bold text-[#E5DFC9]">Notifications</span>
                  <span className="text-2xs text-[#E5DFC9]/50 font-mono">1 New</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1">
                  <p className="font-semibold text-[#E5DFC9]">Adaptive Review Ready</p>
                  <p className="text-2xs text-[#E5DFC9]/70">Recommended: 3 Concurrency exercises to improve your catch rate.</p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-[#1A130D] border border-[#3A2F1D] hover:border-[#E5DFC9]/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] text-2xs font-bold flex items-center justify-center">
                {user?.avatar || 'AF'}
              </div>
              <span className="text-xs font-semibold text-[#E5DFC9] hidden sm:inline max-w-[90px] truncate">
                {user?.name || 'Afrid'}
              </span>
              <ChevronDown size={12} className="text-[#E5DFC9]/50" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1A130D] border border-[#3A2F1D] rounded-2xl shadow-2xl py-2 text-xs space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-[#3A2F1D]">
                  <p className="font-bold text-[#E5DFC9] truncate">{user?.name || 'Afrid Shaik'}</p>
                  <p className="text-2xs text-[#E5DFC9]/60 truncate font-mono">{user?.level || 'Student Intermediate'}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors"
                >
                  <User size={14} className="text-[#E5DFC9]/60" />
                  <span>My Profile & Weaknesses</span>
                </Link>

                <Link
                  to="/role-select"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors"
                >
                  <Sparkles size={14} className="text-[#E5DFC9]/60" />
                  <span>Switch Learning Track</span>
                </Link>

                <div
                  onClick={() => toggleTheme()}
                  className="flex items-center justify-between px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Moon size={14} className="text-[#E5DFC9]/60" /> : <Sun size={14} className="text-[#E5DFC9]/60" />}
                    <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </div>
                  <span className="text-2xs font-mono text-[#E5DFC9]/50">Toggle</span>
                </div>

                <div className="border-t border-[#3A2F1D] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/70 hover:text-red-400 hover:bg-[#3A2F1D]/40 transition-colors text-left"
                >
                  <LogOut size={14} className="text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
