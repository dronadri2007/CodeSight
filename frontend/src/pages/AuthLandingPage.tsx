import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { CodeSightRisingHeading } from '../components/animations/CodeSightRisingHeading';
import { LiquidMetalCTA } from '../components/animations/LiquidMetalCTA';
import { TactileTrackToggle } from '../components/animations/TactileTrackToggle';
import { VolumeShowcase } from '../components/animations/VolumeShowcase';
import { ArrowRight, Key } from 'lucide-react';

export default function AuthLandingPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  // Auth Mode State (login | signup)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    if (typeof window !== 'undefined') {
      const str = window.location.search + window.location.hash;
      return str.includes('mode=signup') ? 'signup' : 'login';
    }
    return 'login';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMode = () => {
        const str = window.location.search + window.location.hash;
        if (str.includes('mode=signup')) setAuthMode('signup');
        else if (str.includes('mode=login')) setAuthMode('login');
      };
      checkMode();
      window.addEventListener('hashchange', checkMode);
      return () => window.removeEventListener('hashchange', checkMode);
    }
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeDefectClass, setActiveDefectClass] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = name || (email ? email.split('@')[0] : 'Alex Morgan');
    login(displayName);
    setLocation('/dashboard');
  };

  const defectClassesList = [
    { name: 'INJECTION', desc: 'SQL String formatting, command injection, and unvalidated user input.', rate: '78%' },
    { name: 'AUTH', desc: 'Broken access control, missing JWT verification, and privilege escalation.', rate: '61%' },
    { name: 'ERROR HANDLING', desc: 'Swallowed exceptions, unhandled promises, and sensitive stack leaks.', rate: '84%' },
    { name: 'CONCURRENCY', desc: 'Race conditions on shared state, deadlocks, and un-locked database transfers.', rate: '46%' },
    { name: 'LOGIC', desc: 'Off-by-one errors, reversed conditionals, and state corruption.', rate: '90%' },
    { name: 'RESOURCE', desc: 'Memory leaks, unclosed database handles, and O(N^2) dynamic loops.', rate: '55%' },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F5EC] text-[#17130F] overflow-x-hidden">
      {/* Editorial Header */}
      <header className="sticky top-0 z-40 border-b border-[#D8D0C0] bg-[#F8F5EC]/90 backdrop-blur-md px-6 py-4 sm:px-12">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#17130F] bg-[#17130F] font-mono text-sm font-bold text-[#F8F5EC]">
              &lt;/&gt;
            </div>
            <span className="font-serif text-2xl font-extrabold tracking-tight text-[#17130F]">
              CodeSight
            </span>
          </Link>

          <div className="flex items-center gap-4 font-mono text-xs">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="font-bold text-[#403A32] hover:text-[#17130F]"
            >
              {authMode === 'login' ? "DON'T HAVE AN ACCOUNT? CREATE AN ACCOUNT →" : 'ALREADY HAVE AN ACCOUNT? LOG IN →'}
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION WITH RISING ANIMATED HEADING & INTEGRATED AUTH */}
      <section className="relative pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Signature Hero Heading: Rising Diagonal / Ring Effect */}
          <div className="mb-10">
            <CodeSightRisingHeading
              text="TRAIN YOUR EYE FOR CODE."
              subtext="CodeSight is a coding platform that grades how well you think about code — not simply whether your program runs."
            />
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-start">
            {/* Product Philosophy Statement */}
            <div className="space-y-6">
              <div className="rounded-xl border border-[#17130F] bg-[#F5F1E7] p-8 shadow-sm">
                <h2 className="font-serif text-3xl font-extrabold text-[#17130F] sm:text-4xl leading-tight">
                  GRADED ON HOW GOOD IT IS. NOT WHETHER IT RUNS.
                </h2>
                <p className="mt-4 text-xs leading-relaxed text-[#403A32] font-mono sm:text-sm">
                  Passing the tests is the floor. CodeSight measures the time and space complexity of what you wrote against the best achievable for the problem, splits the score evenly between the two, and explains every point you left behind.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 font-mono text-xs">
                <Link href="/write" className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 transition-all hover:border-[#17130F]">
                  <div className="font-bold text-[#17130F]">STUDENT TRACK</div>
                  <div className="mt-1 text-[#17130F] font-semibold">Write Optimal Code</div>
                  <p className="mt-2 text-[#746D61] text-[11px]">Grade complexity against best achievable O(N) limits.</p>
                </Link>
                <Link href="/code-review" className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 transition-all hover:border-[#17130F]">
                  <div className="font-bold text-[#17130F]">AI ENGINEER TRACK</div>
                  <div className="mt-1 text-[#17130F] font-semibold">Fix What The AI Shipped</div>
                  <p className="mt-2 text-[#746D61] text-[11px]">Locate security, logic & boundary bugs in generated code.</p>
                </Link>
              </div>
            </div>

            {/* Integrated Login / Signup Form */}
            <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-[#D8D0C0] pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#746D61]">
                    AUTHENTICATION
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#17130F]">
                    {authMode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE7D7] text-[#17130F]">
                  <Key size={18} />
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs">
                {authMode === 'signup' && (
                  <div>
                    <label className="block mb-1 text-[#403A32] uppercase font-bold">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] outline-none focus:border-[#17130F]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-[#403A32] uppercase font-bold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@codesight.dev"
                    className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] outline-none focus:border-[#17130F]"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#403A32] uppercase font-bold">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] outline-none focus:border-[#17130F]"
                    required
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block mb-1 text-[#403A32] uppercase font-bold">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] outline-none focus:border-[#17130F]"
                      required
                    />
                  </div>
                )}

                <div className="pt-2">
                  <LiquidMetalCTA
                    text={authMode === 'login' ? 'LOG IN →' : 'CREATE ACCOUNT →'}
                    icon="arrow"
                    size="md"
                    className="w-full justify-center"
                  />
                </div>
              </form>

              <div className="mt-6 text-center font-mono text-xs text-[#746D61]">
                {authMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button onClick={() => setAuthMode('signup')} className="font-bold text-[#17130F] underline">
                      CREATE AN ACCOUNT →
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button onClick={() => setAuthMode('login')} className="font-bold text-[#17130F] underline">
                      LOG IN →
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDENT TRACK SECTION */}
      <section className="py-16 border-t border-[#D8D0C0] bg-[#F2EEE3]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#746D61]">
            STUDENT TRACK
          </div>
          <h2 className="font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            WRITE OPTIMAL CODE.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto font-mono text-xs text-[#403A32] leading-relaxed">
            Solve from scratch. We don't grade pass or fail — we grade your time and space complexity against the best achievable for that problem. A brute-force answer that passes still leaves points on the table.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold">
            {['WRITE', 'RUN', 'ANALYZE', 'COMPARE', 'SCORE', 'IMPROVE'].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] px-4 py-3 text-[#17130F] shadow-sm">
                  {step}
                </div>
                {idx < 5 && <ArrowRight size={14} className="text-[#17130F]" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI ENGINEER TRACK SECTION */}
      <section className="py-16 border-t border-[#D8D0C0]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#746D61]">
            AI ENGINEER TRACK
          </div>
          <h2 className="font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            FIX WHAT THE AI SHIPPED.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto font-mono text-xs text-[#403A32] leading-relaxed">
            Repair broken, AI-generated code in the editor. Points for the real bugs you catch and the efficiency you recover — points off for 'fixing' what was never broken.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold">
            {['AI-GENERATED CODE', 'INSPECT', 'FIND DEFECT', 'CLASSIFY', 'EXPLAIN', 'FIX'].map((step, idx) => (
              <React.Fragment key={step}>
                <div className="rounded-lg border border-[#D8D0C0] bg-[#F5F1E7] px-4 py-3 text-[#17130F] shadow-sm">
                  {step}
                </div>
                {idx < 5 && <ArrowRight size={14} className="text-[#17130F]" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STUDENT ↔ AI ENGINEER TACTILE SWITCH */}
      <section className="py-16 border-t border-[#D8D0C0] bg-[#F2EEE3]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <TactileTrackToggle />
        </div>
      </section>

      {/* 5. SIX LEVELS & VOLUME SHOWCASE */}
      <section className="py-16 border-t border-[#D8D0C0]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#746D61]">
            PROGRESSION SYSTEM
          </div>
          <h2 className="font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            SIX LEVELS. EVERY GATE IS A REAL EXAM.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto font-mono text-xs text-[#403A32] leading-relaxed">
            Solving problems keeps you sharp; it does not move you up. To advance you sit a timed promotion exam — full screen, submit only, no run button — and clear two to three problems before the clock runs out.
          </p>

          <div className="mt-8">
            <VolumeShowcase />
          </div>

          <div className="mt-8 font-mono text-xs font-bold text-[#17130F] flex items-center justify-center gap-3">
            <span>BEGINNER</span>
            <ArrowRight size={14} />
            <span className="rounded bg-[#EDE7D7] px-3 py-1 border border-[#D8D0C0]">PROMOTION EXAM</span>
            <ArrowRight size={14} />
            <span>INTERMEDIATE</span>
            <ArrowRight size={14} />
            <span className="rounded bg-[#EDE7D7] px-3 py-1 border border-[#D8D0C0]">PROMOTION EXAM</span>
            <ArrowRight size={14} />
            <span>PRO</span>
          </div>
        </div>
      </section>

      {/* 6. WEAKNESS PROFILE & DEFECT CLASSES */}
      <section className="py-16 border-t border-[#D8D0C0] bg-[#F2EEE3]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#746D61]">
            WEAKNESS PROFILE
          </div>
          <h2 className="font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            KNOW EXACTLY WHERE YOU MISS.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto font-mono text-xs text-[#403A32] leading-relaxed">
            Every problem carries one of six defect classes. We track your catch rate on each and chart it on your profile, so you practise where it counts.
          </p>

          {/* Interactive Defect Classes */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-left font-mono text-xs">
            {defectClassesList.map((item) => (
              <div
                key={item.name}
                onClick={() => setActiveDefectClass(activeDefectClass === item.name ? null : item.name)}
                className={`rounded-lg border p-5 cursor-pointer transition-all ${
                  activeDefectClass === item.name
                    ? 'border-[#17130F] bg-[#F8F5EC] shadow-md'
                    : 'border-[#D8D0C0] bg-[#F5F1E7] hover:border-[#17130F]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[#17130F]">
                  <span>{item.name}</span>
                  <span className="text-[#17130F] font-extrabold">{item.rate}</span>
                </div>
                <p className="mt-2 text-[#746D61] text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MULTIPLAYER ARENA */}
      <section className="py-16 border-t border-[#D8D0C0]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#746D61]">
            MULTIPLAYER ARENA
          </div>
          <h2 className="font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            BATTLE OTHER REVIEWERS.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto font-mono text-xs text-[#403A32] leading-relaxed">
            Friend rooms for low-stakes practice. Ranked one-versus-one with skill-based matchmaking, a speed bonus for the first valid fix, and a penalty for false positives.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold">
            <div className="rounded-lg border border-[#17130F] bg-[#F5F1E7] px-4 py-3">PLAYER 01 VS PLAYER 02</div>
            <ArrowRight size={14} className="text-[#17130F]" />
            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] px-4 py-3">RANK</div>
            <ArrowRight size={14} className="text-[#17130F]" />
            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] px-4 py-3">SPEED BONUS</div>
            <ArrowRight size={14} className="text-[#17130F]" />
            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] px-4 py-3">ACCURACY</div>
            <ArrowRight size={14} className="text-[#17130F]" />
            <div className="rounded-lg border border-[#17130F] bg-[#17130F] px-4 py-3 text-[#F8F5EC]">FALSE POSITIVE PENALTY</div>
          </div>

          <div className="mt-8">
            <LiquidMetalCTA
              text="ENTER BATTLE"
              icon="trophy"
              size="lg"
              onClick={() => setLocation('/arena')}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D8D0C0] bg-[#F8F5EC] py-8 text-center font-mono text-xs text-[#746D61]">
        <div>© 2026 CodeSight · Graded on how good it is. Not whether it runs.</div>
      </footer>
    </div>
  );
}
