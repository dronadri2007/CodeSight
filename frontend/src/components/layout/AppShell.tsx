import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home, BookOpen, TrendingUp, Brain, Swords, Trophy, Settings, HelpCircle,
  Eye, ChevronLeft, ChevronRight, Bell, User
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/progress', label: 'Weaknesses', icon: TrendingUp },
  { to: '/learn', label: 'Learn', icon: Brain },
  { to: '/battle', label: 'Battle', icon: Swords },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
]

const bottomItems = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { profile } = useProgressStore()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'flex flex-col flex-shrink-0 h-full bg-bg-secondary border-r border-border transition-all duration-300 ease-in-out',
          'max-lg:hidden',
          sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Eye size={14} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-bold text-text-primary tracking-tight">CodeSight</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="ml-auto text-text-muted hover:text-text-primary transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto hide-scrollbar">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  'group relative',
                  isActive
                    ? 'bg-accent-subtle text-accent border border-accent/20'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs rounded bg-bg-elevated border border-border text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-0.5 p-2 border-t border-border">
          {/* Skill badge */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-2.5 py-2 mb-1">
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-text-muted uppercase tracking-wider">Review Skill</p>
                <p className="text-base font-bold text-gradient-accent leading-tight">{profile.overall}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-2xs font-bold text-accent">
                {profile.overall}
              </div>
            </div>
          )}
          {bottomItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-all duration-150"
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={16} />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          ))}
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-full py-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-bg-secondary gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Eye size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">CodeSight</span>
          </div>
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto hide-scrollbar ml-4">
            {navItems.slice(0, 4).map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors',
                    isActive ? 'text-accent bg-accent-subtle' : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
              <Bell size={15} />
            </button>
            <Link to="/profile" className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
              AF
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
