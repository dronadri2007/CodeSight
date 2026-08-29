import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}
import { Button } from '../components/ui/Button'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { firebaseReady } from '../lib/firebase'

/* -------------------------------------------------------------------------- *
 *  Log in / create account — Firebase Authentication.
 *
 *  Email/password, Google and GitHub via firebase/auth. The user profile doc
 *  is created in Firestore on first sign-up (see authStore). Passwords are
 *  handled entirely by Firebase and never touch our code or storage.
 *
 *  Palette is the shared one: #000000 ground, #1A130D panel, #3A2F1D lines,
 *  #E5DFC9 ink at the documented opacity steps.
 * -------------------------------------------------------------------------- */

function GoogleMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1 2.6-2.1 3.4v2.8h3.4c2-1.85 3.15-4.56 3.15-7.8 0-.75-.07-1.48-.2-2.18z" />
      <path fill="#34A853" d="M12 22c2.85 0 5.24-.94 6.99-2.55l-3.4-2.8c-.94.63-2.15 1-3.59 1-2.76 0-5.1-1.86-5.93-4.37H2.5v2.9C4.25 19.65 7.87 22 12 22z" />
      <path fill="#4A90D9" d="M6.07 13.28A5.98 5.98 0 0 1 5.75 12c0-.44.08-.87.19-1.28V7.82H2.5A9.98 9.98 0 0 0 1.5 12c0 1.6.38 3.12 1 4.18z" />
      <path fill="#FBBC05" d="M12 5.36c1.55 0 2.94.53 4.04 1.58l3.02-3.02C17.24 2.2 14.85 1.2 12 1.2 7.87 1.2 4.25 3.55 2.5 6.99l3.44 2.9C6.9 7.22 9.24 5.36 12 5.36z" />
    </svg>
  )
}

type Mode = 'login' | 'signup'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Firebase auth error code -> friendly message. */
const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'That email is already registered. Try logging in.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-not-found': 'No account for that email.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/weak-password': 'Password is too weak — use at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/popup-closed-by-user': 'Sign-in window closed before finishing.',
  'auth/account-exists-with-different-credential':
    'An account with this email already exists via a different provider.',
  'auth/operation-not-allowed': 'That sign-in method isn’t enabled for this project.',
}
const messageFor = (e: unknown) => {
  const code = (e as { code?: string }).code
  return (code && AUTH_ERRORS[code]) || 'Something went wrong. Please try again.'
}

function Field({
  id,
  label,
  icon: Icon,
  trailing,
  invalid,
  ...props
}: {
  id: string
  label: string
  icon: typeof Mail
  trailing?: React.ReactNode
  invalid?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-[#E5DFC9]/70">
          {label}
        </label>
      )}
      <div className="relative">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5DFC9]/40"
        />
        <input
          id={id}
          aria-invalid={invalid || undefined}
          className={`w-full rounded-xl border bg-[#000000] py-2.5 pl-10 text-[13px] text-[#E5DFC9] outline-none transition-colors placeholder:text-[#E5DFC9]/35 focus:border-[#E5DFC9]/60 ${
            trailing ? 'pr-11' : 'pr-3.5'
          } ${invalid ? 'border-[#E5DFC9]/55' : 'border-[#3A2F1D]'}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    </div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const signUpEmail = useAuthStore((s) => s.signUpEmail)
  const signInEmail = useAuthStore((s) => s.signInEmail)
  const signInWithProvider = useAuthStore((s) => s.signInWithProvider)
  const sendReset = useAuthStore((s) => s.sendReset)
  const { theme } = useThemeStore()

  const [mode, setMode] = useState<Mode>(params.get('mode') === 'signup' ? 'signup' : 'login')

  // keep mode in sync when the ?mode= param changes via a link / hash navigation
  useEffect(() => {
    const m = params.get('mode')
    if (m === 'signup' || m === 'login') setMode(m)
  }, [params])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  const swap = () => {
    const next: Mode = isSignup ? 'login' : 'signup'
    setParams({ mode: next }, { replace: true })
    setMode(next)
    setError(null)
    setConfirm('')
  }

  // signup -> /role-select (pick a track), login -> /home
  const dest = isSignup ? '/role-select' : '/home'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!firebaseReady) return setError('Sign-in is not configured yet (missing Firebase keys).')
    if (isSignup && name.trim().length < 2) return setError('Enter your name.')
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (isSignup && password !== confirm) return setError('Those passwords don’t match.')
    setBusy(true)
    try {
      if (isSignup) await signUpEmail(name.trim(), email.trim(), password)
      else await signInEmail(email.trim(), password)
      navigate(dest, { replace: true })
    } catch (err) {
      setError(messageFor(err))
      setBusy(false)
    }
  }

  const social = async (provider: 'google' | 'github') => {
    setError(null)
    if (!firebaseReady) return setError('Sign-in is not configured yet (missing Firebase keys).')
    setBusy(true)
    try {
      await signInWithProvider(provider)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(messageFor(err))
      setBusy(false)
    }
  }

  const onForgot = async () => {
    setError(null)
    if (!EMAIL_RE.test(email.trim())) return setError('Enter your email above first, then tap Forgot.')
    try {
      await sendReset(email.trim())
      setError('Password reset email sent — check your inbox.')
    } catch (err) {
      setError(messageFor(err))
    }
  }

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      aria-label={showPw ? 'Hide password' : 'Show password'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#E5DFC9]/40 outline-none transition-colors hover:text-[#E5DFC9]/80 focus-visible:ring-2 focus-visible:ring-[#E5DFC9]/50"
    >
      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- brand panel (desktop) ---------- */}
      <aside className="relative hidden overflow-hidden border-r border-[#3A2F1D] bg-[#1A130D] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
        <div className="bg-warm-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />

        <Link to="/" className="relative">
          <BrandLogo size="md" variant={theme === 'light' ? 'light' : 'dark'} />
        </Link>

        <div className="relative">
          <h2 className="max-w-sm text-[2rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#E5DFC9]">
            Train your eye for code.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#E5DFC9]/65">
            Write from scratch and get graded against the optimal complexity, or repair
            broken AI-generated code. Six exam-gated levels either way.
          </p>

          <div className="mt-8 w-full max-w-xs rounded-xl border border-[#3A2F1D] bg-[#000000] p-4 font-mono text-[11px]">
            <div className="flex items-baseline justify-between text-[#E5DFC9]/60">
              <span>Time · O(n²) vs O(n)</span>
              <span className="text-[#E5DFC9]/80">25 / 50</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between text-[#E5DFC9]/60">
              <span>Space · O(1) vs O(n)</span>
              <span className="text-[#E5DFC9]/80">50 / 50</span>
            </div>
            <div className="my-2 h-px bg-[#3A2F1D]" />
            <div className="flex items-baseline justify-between font-semibold text-[#E5DFC9]">
              <span>Score</span>
              <span>75 / 100</span>
            </div>
          </div>
        </div>

        <p className="relative text-[11px] text-[#E5DFC9]/40">
          CodeSight 2.0 · Tech Eximius 2026
        </p>
      </aside>

      {/* ---------- form ---------- */}
      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-[26rem]"
        >
          <Link to="/" className="mb-10 inline-flex lg:hidden">
            <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
          </Link>

          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#E5DFC9]">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-[14px] text-[#E5DFC9]/65">
            {isSignup
              ? 'Start on either track — you can switch whenever you want.'
              : 'Log in to pick up where you left off.'}
          </p>

          {!firebaseReady && (
            <p className="mt-6 rounded-lg border border-[#3A2F1D] bg-[#3A2F1D]/40 px-3 py-2 text-[12px] text-[#E5DFC9]">
              Sign-in is not configured. Add the <code className="font-mono">VITE_FIREBASE_*</code> keys
              to <code className="font-mono">frontend/.env.local</code> and restart the dev server.
            </p>
          )}

          <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              disabled={busy || !firebaseReady}
              onClick={() => social('google')}
              icon={<GoogleMark size={16} />}
              className="text-[13px]"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              disabled={busy || !firebaseReady}
              onClick={() => social('github')}
              icon={<GithubMark size={16} />}
              className="text-[13px]"
            >
              GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#E5DFC9]/35">
            <span className="h-px flex-1 bg-[#3A2F1D]" />
            or
            <span className="h-px flex-1 bg-[#3A2F1D]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {isSignup && (
              <Field
                id="name"
                label="Name"
                icon={User}
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={!!error && name.trim().length < 2}
              />
            )}

            <Field
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={!!error && !EMAIL_RE.test(email.trim())}
            />

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="password" className="block text-[12px] font-medium text-[#E5DFC9]/70">
                  Password
                </label>
                {!isSignup && (
                  <button
                    type="button"
                    className="text-[11px] text-[#E5DFC9]/50 outline-none hover:text-[#E5DFC9]/80 focus-visible:underline"
                    onClick={onForgot}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <Field
                id="password"
                label=""
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                trailing={eyeToggle}
                invalid={!!error && password.length < 8}
              />
            </div>

            {isSignup && (
              <Field
                id="confirm"
                label="Confirm password"
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                invalid={!!error && password !== confirm}
              />
            )}

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
              disabled={!firebaseReady}
              iconRight={<ArrowRight size={16} className="text-[#000000]" />}
              className="mt-2 text-[13px]"
            >
              {isSignup ? 'Create account' : 'Log in'}
            </Button>

            {isSignup && (
              <p className="text-[11px] leading-relaxed text-[#E5DFC9]/40">
                By creating an account you agree to the Terms of Service and Privacy Policy.
              </p>
            )}
          </form>

          <p className="mt-8 text-[13px] text-[#E5DFC9]/55">
            {isSignup ? 'Already have an account?' : 'New to CodeSight?'}{' '}
            <button
              type="button"
              onClick={swap}
              className="font-semibold text-[#E5DFC9] outline-none hover:underline focus-visible:underline"
            >
              {isSignup ? 'Log in' : 'Create one'}
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
