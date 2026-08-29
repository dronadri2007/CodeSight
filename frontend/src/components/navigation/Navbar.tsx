import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Bell, Moon, Sun, User, LogOut, Trophy,
  Swords, Shield, ChevronDown, Check, Sparkles, Code2,
  GraduationCap, Bot
} from 'lucide-react'
import { BrandLogo } from '../ui/BrandLogo'
import { Badge } from '../ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

interface NavbarProps {
  variant?: 'marketing' | 'app' | 'student' | 'pro'
}

export function Navbar({ variant = 'app' }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { filters, setFilters } = useProblemStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isProblemsActive = location.pathname.startsWith('/problems') || location.pathname.startsWith('/practice') || location.pathname === '/home'
  const isContestActive = location.pathname.startsWith('/contest') || location.pathname.startsWith('/battle')

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

  // Marketing variant (for landing page when unauthenticated)
  if (variant === 'marketing' && !isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#3A2F1D] bg-[#000000]/95 backdrop-blur-md text-[#E5DFC9]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="sm" variant="dark" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/role-select?mode=login"
              className="text-xs font-semibold text-[#E5DFC9]/80 hover:text-[#E5DFC9] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/role-select?mode=signup"
              className="px-4 py-1.5 rounded-xl bg-[#E5DFC9] text-[#000000] font-bold text-xs hover:bg-[#F2EDDE] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    )
  }

  // LeetCode-style App Navbar
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3A2F1D] bg-[#000000] text-[#E5DFC9] select-none">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Tabs */}
        <div className="flex items-center gap-6">
          <Link to="/problems" className="flex items-center gap-2">
            <BrandLogo size="sm" variant="dark" />
          </Link>

          <nav className="flex items-center gap-1">
            {/* Problems Tab - DEFAULT ACTIVE */}
            <Link
              to="/problems"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isProblemsActive
                  ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D] shadow-inner font-bold'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Code2 size={14} className={isProblemsActive ? 'text-[#E5DFC9]' : 'text-[#E5DFC9]/50'} />
              <span>Problems</span>
            </Link>

            {/* Contest Tab */}
            <Link
              to="/contest"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isContestActive
                  ? 'bg-[#1A130D] text-[#E5DFC9] border border-[#3A2F1D] shadow-inner font-bold'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9] hover:bg-[#1A130D]/50'
              }`}
            >
              <Swords size={14} className={isContestActive ? 'text-[#E5DFC9]' : 'text-[#E5DFC9]/50'} />
              <span>Contest</span>
            </Link>
          </nav>
        </div>

        {/* Center: Track Switcher (Student vs AI-Assisted Professional) */}
        <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-[#1A130D] border border-[#3A2F1D]">
          <button
            onClick={() => {
              setFilters({ mode: 'student' })
              if (!location.pathname.startsWith('/problems')) navigate('/problems')
            }}
            className={`px-3 py-1 rounded-lg text-2xs font-bold transition-all flex items-center gap-1.5 ${
              filters.mode === 'student'
                ? 'bg-[#E5DFC9] text-[#000000] shadow-sm'
                : 'text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
            }`}
          >
            <GraduationCap size={12} />
            <span>Student Track</span>
          </button>

          <button
            onClick={() => {
              setFilters({ mode: 'ai_engineer' })
              if (!location.pathname.startsWith('/problems')) navigate('/problems')
            }}
            className={`px-3 py-1 rounded-lg text-2xs font-bold transition-all flex items-center gap-1.5 ${
              filters.mode === 'ai_engineer'
                ? 'bg-[#E5DFC9] text-[#000000] shadow-sm'
                : 'text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
            }`}
          >
            <Bot size={12} />
            <span>AI-Assisted Pro</span>
          </button>
        </div>

        {/* Right: Search, Notifications & Avatar Dropdown */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          {/* Search Input */}
          <div className="hidden md:flex items-center relative max-w-[180px]">
            <Search size={13} className="absolute left-3 text-[#E5DFC9]/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#1A130D] border border-[#3A2F1D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E5DFC9] placeholder-[#E5DFC9]/40 focus:outline-none focus:border-[#E5DFC9]/60 transition-colors"
            />
          </div>

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
              <div className="absolute right-0 mt-2 w-72 bg-[#1A130D] border border-[#3A2F1D] rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50">
                <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-2">
                  <span className="font-bold text-[#E5DFC9]">Notifications</span>
                  <span className="text-2xs text-[#E5DFC9]/50 font-mono">1 New</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-1">
                  <p className="font-semibold text-[#E5DFC9]">Promotion Exam Ready!</p>
                  <p className="text-2xs text-[#E5DFC9]/70">You qualify for the 30-min timed promotion exam to unlock the AI Engineer tier.</p>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Dropdown */}
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
              <div className="absolute right-0 mt-2 w-56 bg-[#1A130D] border border-[#3A2F1D] rounded-2xl shadow-2xl py-2 text-xs space-y-1 z-50">
                <div className="px-4 py-2 border-b border-[#3A2F1D]">
                  <p className="font-bold text-[#E5DFC9] truncate">{user?.name || 'Afrid Shaik'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="gold" size="sm">{user?.level || 'Student Pro'}</Badge>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors"
                >
                  <User size={14} className="text-[#E5DFC9]/60" />
                  <span>Profile & Weakness Mastery</span>
                </Link>

                <Link
                  to="/role-select"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors"
                >
                  <Sparkles size={14} className="text-[#E5DFC9]/60" />
                  <span>Switch Track</span>
                </Link>

                <div
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-between px-4 py-2 text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:bg-[#3A2F1D]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? <Moon size={14} className="text-[#E5DFC9]/60" /> : <Sun size={14} className="text-[#E5DFC9]/60" />}
                    <span>Theme: {isDarkMode ? 'Dark' : 'Light'}</span>
                  </div>
                  <span className="text-2xs font-mono text-[#E5DFC9]/50">Toggle</span>
                </div>

                <div className="border-t border-[#3A2F1D] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[#E5DFC9]/70 hover:text-red-400 hover:bg-[#3A2F1D]/40 transition-colors text-left"
                >
                  <LogOut size={14} className="text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
