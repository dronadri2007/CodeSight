import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Code2, Shield, User, Menu, X, ArrowRight, CheckCircle2,
  Sparkles, Layers, BookOpen, TrendingUp, Trophy, Settings as SettingsIcon,
  HelpCircle, Swords, LogOut
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { BrandLogo } from '../ui/BrandLogo'
import { useAuthStore } from '../../store/authStore'

interface NavbarProps {
  variant?: 'marketing' | 'student' | 'pro'
}

export function Navbar({ variant = 'marketing' }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Marketing Navigation Links
  const marketingLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Students', href: '#students' },
    { label: 'For Professionals', href: '#professionals' },
    { label: 'Defect Classes', href: '#defects' },
  ]

  // Student App Links
  const studentLinks = [
    { label: 'Dashboard', to: '/student/dashboard' },
    { label: 'Practice Library', to: '/student/practice' },
    { label: 'Learn Concepts', to: '/student/learn/injection' },
    { label: 'Progress Roadmap', to: '/student/progress' },
    { label: 'Leaderboard', to: '/leaderboard' },
  ]

  // Pro App Links
  const proLinks = [
    { label: 'Dashboard', to: '/pro/dashboard' },
    { label: 'Review Workspace', to: '/pro/review/pro-01' },
    { label: 'Code X-Ray', to: '/pro/xray' },
    { label: 'AI vs You', to: '/pro/versus' },
    { label: 'Battle Arena', to: '/battle' },
    { label: 'Leaderboard', to: '/leaderboard' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full transition-all border-b border-[#29333A] bg-[#0D1117]/95 backdrop-blur-md text-[#F4F1E8]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo in Circle Form */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo
              size="md"
              variant="dark"
              showText={true}
              showTagline={true}
            />
          </Link>

          {/* Mode Pill for App variants */}
          {variant === 'student' && (
            <Badge variant="accent" size="sm" className="hidden sm:inline-flex bg-[rgba(53,198,176,0.12)] text-[#35C6B0] font-semibold border-[#35C6B0]/30">
              Student Track
            </Badge>
          )}
          {variant === 'pro' && (
            <Badge variant="accent" size="sm" className="hidden sm:inline-flex bg-[rgba(53,198,176,0.12)] text-[#58D8C5] font-semibold border-[#35C6B0]/30">
              Pro Reviewer Track
            </Badge>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {variant === 'marketing' && marketingLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#AEB7B2] hover:text-[#35C6B0] transition-colors"
            >
              {item.label}
            </a>
          ))}

          {variant === 'student' && studentLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.label}
                to={item.to}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-[#35C6B0] font-semibold' : 'text-[#AEB7B2] hover:text-[#F4F1E8]'
                )}
              >
                {item.label}
              </Link>
            )
          })}

          {variant === 'pro' && proLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.label}
                to={item.to}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-[#35C6B0] font-semibold' : 'text-[#AEB7B2] hover:text-[#F4F1E8]'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-[#AEB7B2] hover:text-[#F4F1E8]"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/auth?mode=signup')}
                iconRight={<ArrowRight size={14} />}
              >
                Create Account
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Switch Role */}
              <button
                onClick={() => navigate('/role-select')}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#29333A] bg-[#151C24] text-[#AEB7B2] hover:text-[#F4F1E8] hover:border-[#35C6B0]/40 transition-colors flex items-center gap-1.5"
                title="Switch learning track"
              >
                <Layers size={13} className="text-[#35C6B0]" />
                <span>Switch Track</span>
              </button>

              {/* User Avatar */}
              <Link to="/profile" className="flex items-center gap-2 pl-1">
                <div className="w-9 h-9 rounded-xl bg-[#151C24] border border-[#35C6B0]/50 flex items-center justify-center text-xs font-bold text-[#35C6B0] shadow-sm">
                  {user?.avatar || 'AF'}
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-[#AEB7B2] hover:text-[#E0646D] transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#F4F1E8]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#29333A] bg-[#151C24] text-[#F4F1E8] px-6 py-5 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            {variant === 'marketing' && marketingLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-[#AEB7B2] hover:text-[#35C6B0]"
              >
                {item.label}
              </a>
            ))}

            {variant === 'student' && studentLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-[#AEB7B2] hover:text-[#35C6B0]"
              >
                {item.label}
              </Link>
            ))}

            {variant === 'pro' && proLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-[#AEB7B2] hover:text-[#35C6B0]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#29333A] flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Button fullWidth variant="secondary" onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}>
                  Sign In
                </Button>
                <Button fullWidth variant="primary" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false) }}>
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth variant="secondary" size="sm" onClick={() => { navigate('/role-select'); setMobileMenuOpen(false) }}>
                  Switch Track (Student / Pro)
                </Button>
                <Button fullWidth variant="danger" size="sm" onClick={() => { handleLogout(); setMobileMenuOpen(false) }}>
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
