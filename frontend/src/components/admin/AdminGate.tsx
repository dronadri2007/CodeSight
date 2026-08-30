import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { BrandLogo } from '../ui/BrandLogo'
import { useThemeStore } from '../../store/themeStore'
import { useAdminStore } from '../../store/adminStore'
import { ADMIN_OFFLINE } from '../../api/admin'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Password wall for the /admin area. No token -> this screen; token present ->
 * children. Mirrors the split-screen of the main Auth page but with a single
 * shared-password field (backend/app/adminauth.py).
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const token = useAdminStore((s) => s.token)
  const busy = useAdminStore((s) => s.busy)
  const error = useAdminStore((s) => s.error)
  const login = useAdminStore((s) => s.login)
  const clearError = useAdminStore((s) => s.clearError)

  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  if (token) return <>{children}</>

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    await login(password)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- brand panel ---------- */}
      <aside className="relative hidden overflow-hidden border-r border-[#3A2F1D] bg-[#1A130D] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="bg-warm-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

        <Link to="/" className="relative">
          <BrandLogo size="md" variant={theme === 'light' ? 'light' : 'dark'} />
        </Link>

        <div className="relative">
          <p className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5DFC9]/45">
            <ShieldCheck size={13} strokeWidth={2} /> Restricted
          </p>
          <h2 className="max-w-sm text-[2rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#E5DFC9]">
            Corpus admin.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#E5DFC9]/65">
            Review, edit, add and archive exercises. Every write is a Postgres
            overlay on the committed JSON — the live corpus updates immediately.
          </p>
        </div>

        <p className="relative text-[11px] text-[#E5DFC9]/40">CodeSight 2.0 · Tech Eximius 2026</p>
      </aside>

      {/* ---------- form ---------- */}
      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto w-full max-w-[26rem]"
        >
          <Link to="/" className="mb-10 inline-flex lg:hidden">
            <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
          </Link>

          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#E5DFC9]">
            Admin sign-in
          </h1>
          <p className="mt-2 text-[14px] text-[#E5DFC9]/65">
            Enter the shared admin password to manage the exercise corpus.
          </p>

          {ADMIN_OFFLINE && (
            <p className="mt-6 rounded-lg border border-[#3A2F1D] bg-[#3A2F1D]/40 px-3 py-2 text-[12px] text-[#E5DFC9]">
              No backend configured. Set <code className="font-mono">VITE_API_BASE_URL</code> and
              reload — the admin area needs the live API.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="admin-pw" className="mb-1.5 block text-[12px] font-medium text-[#E5DFC9]/70">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5DFC9]/40"
                />
                <input
                  id="admin-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) clearError()
                  }}
                  aria-invalid={!!error || undefined}
                  disabled={ADMIN_OFFLINE}
                  className={`w-full rounded-xl border bg-[#000000] py-2.5 pl-10 pr-11 text-[13px] text-[#E5DFC9] outline-none transition-colors placeholder:text-[#E5DFC9]/35 focus:border-[#E5DFC9]/60 ${
                    error ? 'border-[#E5DFC9]/55' : 'border-[#3A2F1D]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#E5DFC9]/40 outline-none transition-colors hover:text-[#E5DFC9]/80 focus-visible:ring-2 focus-visible:ring-[#E5DFC9]/50"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-[#3A2F1D] bg-[#3A2F1D]/40 px-3 py-2 text-[12px] text-[#E5DFC9]"
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={busy}
              disabled={ADMIN_OFFLINE || !password}
              iconRight={<ArrowRight size={16} className="text-[#000000]" />}
              className="mt-2 text-[13px]"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-[13px] text-[#E5DFC9]/55">
            Not an admin?{' '}
            <Link
              to="/"
              className="font-semibold text-[#E5DFC9] outline-none hover:underline focus-visible:underline"
            >
              Back to CodeSight
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
