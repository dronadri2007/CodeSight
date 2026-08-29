import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye, ArrowRight, Lock, Mail, User as UserIcon, Code2,
  GraduationCap, Bot, Check, Sparkles
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'
import { useProblemStore } from '../store/problemStore'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const setRole = useAuthStore((state) => state.setRole)
  const setFilters = useProblemStore((state) => state.setFilters)

  const isSignUpDefault = searchParams.get('mode') === 'signup'
  const initialRole = searchParams.get('role') === 'professional' ? 'professional' : 'student'
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault)
  const [selectedRole, setSelectedRole] = useState<'student' | 'professional'>(initialRole)
  const [name, setName] = useState(isSignUpDefault ? 'Afrid Shaik' : '')
  const [email, setEmail] = useState('afrid@codesight.dev')
  const [password, setPassword] = useState('••••••••••••')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(name || 'Afrid Shaik', email || 'afrid@codesight.dev')
    setRole(selectedRole)
    setFilters({ mode: selectedRole === 'student' ? 'student' : 'ai_engineer' })
    navigate('/problems')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Brand Logo Header */}
      <Link to="/" className="mb-6 flex items-center justify-center">
        <BrandLogo size="lg" variant="dark" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="p-6 sm:p-8 border-[#3A2F1D] bg-[#1A130D] shadow-2xl">
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-2xl font-extrabold text-[#E5DFC9]">
              {isSignUp ? 'Create your CodeSight account' : 'Welcome to CodeSight'}
            </h1>
            <p className="text-xs text-[#E5DFC9]/70">
              {isSignUp
                ? 'Join thousands of engineers mastering algorithmic efficiency.'
                : 'Select your track and sign in to continue.'}
            </p>
          </div>

          {/* Persona Track Selector (Student vs AI-Assisted Professional) */}
          <div className="mb-6 space-y-2">
            <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
              Select Your Engineering Track:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Student */}
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'student'
                    ? 'bg-[#000000] border-[#E5DFC9] shadow-md ring-1 ring-[#E5DFC9]/40'
                    : 'bg-[#000000]/60 border-[#3A2F1D] opacity-70 hover:opacity-100 hover:border-[#E5DFC9]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <GraduationCap size={16} />
                  </div>
                  {selectedRole === 'student' && <Check size={14} className="text-[#E5DFC9]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#E5DFC9]">Student Track</p>
                  <p className="text-3xs text-[#E5DFC9]/60 mt-0.5 leading-tight">
                    Write code from scratch. Relative TC/SC grading.
                  </p>
                </div>
              </button>

              {/* Option 2: AI-Assisted Professional */}
              <button
                type="button"
                onClick={() => setSelectedRole('professional')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'professional'
                    ? 'bg-[#000000] border-[#E5DFC9] shadow-md ring-1 ring-[#E5DFC9]/40'
                    : 'bg-[#000000]/60 border-[#3A2F1D] opacity-70 hover:opacity-100 hover:border-[#E5DFC9]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1A130D] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  {selectedRole === 'professional' && <Check size={14} className="text-[#E5DFC9]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#E5DFC9]">AI-Assisted Pro</p>
                  <p className="text-3xs text-[#E5DFC9]/60 mt-0.5 leading-tight">
                    Review &amp; fix flawed AI code. Efficiency delta.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-2xs font-semibold text-[#E5DFC9]/70 uppercase tracking-wider block mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5DFC9]/50" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Afrid Shaik"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] placeholder:text-[#E5DFC9]/40 text-xs focus:outline-none focus:border-[#E5DFC9]/60 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-2xs font-semibold text-[#E5DFC9]/70 uppercase tracking-wider block mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5DFC9]/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] placeholder:text-[#E5DFC9]/40 text-xs focus:outline-none focus:border-[#E5DFC9]/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-[#E5DFC9]/70 uppercase tracking-wider block mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E5DFC9]/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] placeholder:text-[#E5DFC9]/40 text-xs focus:outline-none focus:border-[#E5DFC9]/60 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              variant="primary"
              iconRight={<ArrowRight size={16} className="text-[#000000]" />}
              className="mt-6 font-bold shadow-[0_2px_16px_rgba(0,0,0,0.6)] text-xs"
            >
              {isSignUp
                ? `Create Account (${selectedRole === 'student' ? 'Student' : 'AI Pro'})`
                : `Sign In as ${selectedRole === 'student' ? 'Student' : 'AI Professional'}`}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#3A2F1D]">
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#3A2F1D] bg-[#000000] rounded-xl text-xs font-semibold text-[#E5DFC9]/80 hover:bg-[#3A2F1D] hover:text-[#E5DFC9] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-[#E5DFC9]/60">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-[#E5DFC9] font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#E5DFC9] font-bold hover:underline"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
