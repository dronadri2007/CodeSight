/* CodeSight — AppShell (Top Navigation ONLY — Zero Left Sidebar — Subtle Active Styling) */
import { Link, useLocation } from 'wouter';
import { Bell, Code2, Bug, Flame, Trophy, Layers3, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isLanding = location === '/' || location === '/intro' || location === '/login' || location === '/register' || location === '/auth';
  
  if (isLanding) return <>{children}</>;

  const topNavItems = [
    { href: '/home', label: 'Home', icon: Layers3 },
    { href: '/problems', label: 'Problems', icon: Code2 },
    { href: '/contest', label: 'Contest', icon: Trophy },
    { href: '/student', label: 'Student Track', icon: BookOpen },
    { href: '/ai-engineer', label: 'AI-Assisted Pro', icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EC] text-[#17130F] font-mono">
      {/* Sticky Top Navigation Bar — Zero Left Sidebar */}
      <header className="sticky top-0 z-50 border-b border-[#D8D0C0] bg-[#F8F5EC]/95 backdrop-blur-md px-4 sm:px-8">
        <div className="mx-auto flex h-[66px] max-w-[1480px] items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/home" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#17130F] bg-[#17130F] font-mono text-xs font-bold text-[#F8F5EC]">
              &lt;/&gt;
            </div>
            <span className="font-serif text-xl font-extrabold tracking-tight text-[#17130F]">
              CodeSight
            </span>
          </Link>

          {/* Center Top Nav Links — Subtle Active State Styling */}
          <nav className="hidden items-center gap-1.5 sm:flex">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href ||
                             (item.href === '/home' && location === '/dashboard') ||
                             (item.href === '/contest' && location === '/arena') ||
                             (item.href === '/student' && location.startsWith('/student')) ||
                             (item.href === '/ai-engineer' && location.startsWith('/ai-engineer'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'border border-[#17130F] bg-[#EDE7D7] text-[#17130F] shadow-sm'
                      : 'border border-transparent text-[#403A32] hover:bg-[#F2EEE3] hover:text-[#17130F]'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="relative rounded-lg border border-[#D8D0C0] bg-[#F5F1E7] p-2 text-[#746D61] transition-colors hover:bg-[#EDE7D7] hover:text-[#17130F]"
            >
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C93B2B]" />
            </button>

            {/* User Profile Link */}
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex items-center gap-2 rounded-lg border border-[#17130F] bg-[#17130F] px-3 py-1.5 text-xs font-bold text-[#F8F5EC] hover:bg-[#403A32]"
            >
              <span>{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AM'}</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer Links */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#D8D0C0] py-2 sm:hidden">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href ||
                           (item.href === '/home' && location === '/dashboard') ||
                           (item.href === '/contest' && location === '/arena') ||
                           (item.href === '/student' && location.startsWith('/student')) ||
                           (item.href === '/ai-engineer' && location.startsWith('/ai-engineer'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                  active
                    ? 'border border-[#17130F] bg-[#EDE7D7] text-[#17130F]'
                    : 'border border-transparent bg-[#F5F1E7] text-[#403A32]'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1480px] p-4 sm:p-8">{children}</main>
    </div>
  );
}
