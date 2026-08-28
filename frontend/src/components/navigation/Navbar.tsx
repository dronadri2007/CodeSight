import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Code2, Shield, User, Menu, X, ArrowRight, CheckCircle2,
  Sparkles, Layers, BookOpen, TrendingUp, Trophy, Settings as SettingsIcon,
  HelpCircle, Swords
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { BrandLogo } from '../ui/BrandLogo'

interface NavbarProps {
  variant?: 'marketing' | 'student' | 'pro'
}

export function Navbar({ variant = 'marketing' }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const isDarkNav = variant !== 'marketing'

  return (
    <header className={clsx(
      'sticky top-0 z-50 w-full transition-all border-b',
      isDarkNav
        ? 'bg-navy-midnight/95 backdrop-blur-md border-navy-border text-white'
        : 'bg-light-card/95 backdrop-blur-md border-light-border text-navy'
    )}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo in Circle Form */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo
              size="md"
              variant={isDarkNav ? 'dark' : 'light'}
              showText={true}
              showTagline={true}
            />
          </Link>

          {/* Mode Pill for App variants */}
          {variant === 'student' && (
            <Badge variant="accent" size="sm" className="hidden sm:inline-flex bg-aqua-soft text-navy font-semibold border-aqua/30">
              Student Track
            </Badge>
          )}
          {variant === 'pro' && (
            <Badge variant="accent" size="sm" className="hidden sm:inline-flex bg-aqua/15 text-aqua-bright font-semibold border-aqua/30">
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
              className="text-sm font-medium text-light-textSecondary hover:text-navy transition-colors"
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
                  isActive ? 'text-aqua font-semibold' : 'text-slate hover:text-white'
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
                  isActive ? 'text-aqua font-semibold' : 'text-slate hover:text-white'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {variant === 'marketing' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-light-textSecondary hover:text-navy"
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
              {/* Role Switcher */}
              <button
                onClick={() => navigate('/role-select')}
                className="text-xs px-3 py-1.5 rounded-xl border border-navy-borderStrong bg-navy-surface text-slate hover:text-white transition-colors flex items-center gap-1.5"
                title="Switch learning track"
              >
                <Layers size={13} className="text-aqua" />
                <span>Switch Track</span>
              </button>

              {/* User Avatar */}
              <Link to="/profile" className="flex items-center gap-2 pl-2">
                <div className="w-9 h-9 rounded-xl bg-aqua/20 border border-aqua/40 flex items-center justify-center text-xs font-bold text-aqua shadow-sm">
                  AF
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={clsx(
            'lg:hidden p-2 rounded-lg',
            isDarkNav ? 'text-white' : 'text-navy'
          )}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className={clsx(
          'lg:hidden border-t px-6 py-5 space-y-4 shadow-xl',
          isDarkNav
            ? 'bg-navy-midnight border-navy-border text-white'
            : 'bg-light-card border-light-border text-navy'
        )}>
          <div className="flex flex-col space-y-3">
            {variant === 'marketing' && marketingLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-light-textSecondary hover:text-navy"
              >
                {item.label}
              </a>
            ))}

            {variant === 'student' && studentLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-slate hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            {variant === 'pro' && proLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-1.5 text-slate hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-navy-border/40 flex flex-col gap-2">
            {variant === 'marketing' ? (
              <>
                <Button fullWidth variant="secondary" onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}>
                  Sign In
                </Button>
                <Button fullWidth variant="primary" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false) }}>
                  Create Account
                </Button>
              </>
            ) : (
              <Button fullWidth variant="dark" size="sm" onClick={() => { navigate('/role-select'); setMobileMenuOpen(false) }}>
                Switch Track (Student / Pro)
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
