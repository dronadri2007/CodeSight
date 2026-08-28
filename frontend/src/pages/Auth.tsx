import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, ArrowRight, Lock, Mail, User as UserIcon, Code2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuthStore } from '../store/authStore'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isSignUpDefault = searchParams.get('mode') === 'signup'

  const [isSignUp, setIsSignUp] = useState(isSignUpDefault)
  const [name, setName] = useState(isSignUpDefault ? 'Afrid Shaik' : '')
  const [email, setEmail] = useState('afrid@example.com')
  const [password, setPassword] = useState('••••••••••••')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(name || 'Afrid Shaik', email || 'afrid@example.com')
    navigate('/role-select')
  }

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-center items-center px-6 py-12">
      {/* Brand Logo Header */}
      <Link to="/" className="mb-8 flex items-center justify-center">
        <BrandLogo size="lg" variant="light" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 border-light-border bg-light-card shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-navy">
              {isSignUp ? 'Create your CodeSight account' : 'Welcome back'}
            </h1>
            <p className="text-xs text-light-textSecondary mt-1">
              {isSignUp
                ? 'Join thousands of engineers mastering code review.'
                : 'Enter your credentials to continue your practice.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-semibold text-light-text uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-textMuted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-light-elevated border border-light-border rounded-xl text-sm text-navy focus:outline-none focus:border-aqua transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-light-text uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-textMuted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-light-elevated border border-light-border rounded-xl text-sm text-navy focus:outline-none focus:border-aqua transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-light-text uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-textMuted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-light-elevated border border-light-border rounded-xl text-sm text-navy focus:outline-none focus:border-aqua transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-6"
              iconRight={<ArrowRight size={16} />}
            >
              {isSignUp ? 'Create Free Account' : 'Sign In'}
            </Button>
          </form>

          {/* Social placeholder */}
          <div className="mt-6 pt-6 border-t border-light-border">
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-light-border rounded-xl text-xs font-semibold text-light-textSecondary hover:bg-light-elevated transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-light-textSecondary">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-aqua font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-aqua font-bold hover:underline"
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
