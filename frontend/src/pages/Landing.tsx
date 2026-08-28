import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Shield, Lock, AlertTriangle, Zap, GitBranch, Gauge,
  ArrowRight, CheckCircle2, Sparkles, GraduationCap, ChevronRight,
  Search, Eye, HelpCircle, Layers, Check, ExternalLink, Terminal
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { BrandLogo } from '../components/ui/BrandLogo'
import { defectClasses } from '../tokens'

const iconMap = {
  Shield,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Gauge,
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-light-bg text-light-text selection:bg-aqua/20 selection:text-navy">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-aqua/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-light-card border border-light-border shadow-sm text-xs font-semibold text-light-textSecondary mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
          <span>CODE REVIEW + LEARNING PLATFORM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy leading-[1.08] max-w-4xl"
        >
          Train your eye <br className="hidden sm:inline" />
          <span className="text-gradient-navy">for code.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-light-textSecondary max-w-2xl font-normal leading-relaxed"
        >
          Learn where your coding skills fall short — and build the ability to review AI-assisted code with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            iconRight={<ArrowRight size={16} />}
            className="w-full sm:w-auto px-8 shadow-md"
          >
            Create Account
          </Button>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-7"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Realistic Product Interface Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-5xl mt-14 rounded-2xl border border-navy-border bg-navy-midnight shadow-2xl overflow-hidden text-left"
        >
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-surface border-b border-navy-border text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
              </div>
              <span className="font-mono text-slate text-2xs sm:text-xs">
                codesight / src / auth_gateway.py
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="navy" size="sm">Python</Badge>
              <Badge variant="warning" size="sm">Auth & Access Control</Badge>
            </div>
          </div>

          {/* Interactive Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-navy-border min-h-[380px]">
            {/* Code Panel */}
            <div className="lg:col-span-7 p-4 font-mono text-xs text-slate select-none overflow-x-auto">
              <div className="space-y-1">
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">1</span><span className="text-aqua">import</span> hmac, hashlib</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">2</span><span className="text-aqua">from</span> flask <span className="text-aqua">import</span> request, jsonify</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">3</span></div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">4</span><span className="text-slate">@app.route('/api/login', methods=['POST'])</span></div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">5</span><span className="text-aqua">def</span> <span className="text-warning">authenticate_user</span>():</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">6</span>    username = request.json.get('username')</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">7</span>    password = request.json.get('password')</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">8</span></div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">9</span>    stored_hash = db.get_user_hash(username)</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">10</span>   <span className="text-aqua">if</span> <span className="text-aqua">not</span> stored_hash:</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">11</span>       <span className="text-aqua">return</span> jsonify(&#123;'error': 'Not found'&#125;), 401</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">12</span></div>
                {/* Active Highlight Line */}
                <div className="flex bg-aqua/15 border-l-2 border-aqua text-white py-0.5 px-0.5 rounded-r">
                  <span className="w-6 text-right mr-4 text-aqua font-bold">13</span>
                  <span>   <span className="text-aqua">if</span> stored_hash == hash_password(password): <span className="text-aqua-bright text-[11px] font-sans ml-2">// [Suspect Finding]</span></span>
                </div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">14</span>       session['uid'] = username</div>
                <div className="flex"><span className="w-6 text-right mr-4 text-slate/50">15</span>       <span className="text-aqua">return</span> jsonify(&#123;'status': 'authenticated'&#125;)</div>
              </div>
            </div>

            {/* Analysis & Findings Panel */}
            <div className="lg:col-span-5 p-5 bg-navy-surface flex flex-col justify-between text-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate">Review Findings</span>
                  <Badge variant="navy" size="sm">Line 13 Tagged</Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-warning">Potential Timing Side-Channel</span>
                    <span className="text-2xs text-slate">Medium Severity</span>
                  </div>
                  <p className="text-slate leading-relaxed">
                    "Standard string comparison on password hashes leaks character-by-character timing data. Recommend <code className="text-aqua">hmac.compare_digest</code>."
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-midnight/60 border border-navy-border/60 text-xs">
                  <span className="text-2xs uppercase tracking-wider text-slate font-semibold block mb-1">AI Evaluator Feedback</span>
                  <p className="text-success font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Accurate Root-Cause Localization (100% Score)
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-border flex items-center justify-between">
                <span className="text-xs text-slate">Ready to practice</span>
                <Button size="sm" variant="dark" onClick={() => navigate('/auth?mode=signup')}>
                  Try Interactive Session
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Two Ways to Build Engineering Skills */}
      <section id="platform" className="py-24 px-6 border-t border-light-border bg-light-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Two ways to build stronger engineering skills.
            </h2>
            <p className="mt-4 text-light-textSecondary text-base sm:text-lg">
              Whether you are learning core fundamentals or reviewing complex pull requests generated by AI assistants, CodeSight calibrates to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Student Mode */}
            <Card hover className="p-8 border-light-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-aqua-soft text-navy flex items-center justify-center mb-6">
                  <GraduationCap size={24} className="text-navy" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent" size="sm">STUDENT TRACK</Badge>
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">
                  Build better coding instincts.
                </h3>
                <p className="text-sm text-light-textSecondary leading-relaxed mb-6">
                  Write code to solve authentic engineering problems. CodeSight evaluates your implementation, diagnoses your subconscious failure patterns, and provides targeted concept instruction.
                </p>

                <div className="space-y-2.5 mb-8 bg-light-elevated p-4 rounded-xl border border-light-border text-xs text-light-textSecondary">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>Real Monaco code-writing environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>Automated weakness & pattern analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>Curated concept lessons & mini-checks</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate('/student/dashboard')}
                iconRight={<ArrowRight size={14} />}
              >
                Explore Student Mode
              </Button>
            </Card>

            {/* Card 2: Professional Mode */}
            <Card hover className="p-8 border-light-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-navy text-aqua-bright flex items-center justify-center mb-6">
                  <Shield size={24} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="navy" size="sm">PROFESSIONAL TRACK</Badge>
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">
                  Review AI-generated code with confidence.
                </h3>
                <p className="text-sm text-light-textSecondary leading-relaxed mb-6">
                  Analyze large unfamiliar codebases. Map architectural risk zones, identify subtle bugs, explain your findings, and benchmark your review rigor against expert AI evaluations.
                </p>

                <div className="space-y-2.5 mb-8 bg-light-elevated p-4 rounded-xl border border-light-border text-xs text-light-textSecondary">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>Large codebase (200-500+ lines) inspection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>Code X-Ray structural risk mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-success" />
                    <span>AI Reviewer vs. You benchmark comparisons</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate('/pro/dashboard')}
                iconRight={<ArrowRight size={14} />}
              >
                Explore Professional Mode
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* The Core Loop: 5 Steps */}
      <section id="how-it-works" className="py-24 px-6 border-t border-light-border bg-light-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              How CodeSight helps you improve
            </h2>
            <p className="mt-4 text-light-textSecondary text-base sm:text-lg">
              A systematic engineering feedback loop designed to transform knowledge into instinct.
            </p>
          </div>

          {/* 5-Step Progression */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: '1', title: 'Code / Review', desc: 'Write solutions or inspect unfamiliar codebases.' },
              { num: '2', title: 'Analyze', desc: 'AI evaluates your syntax, reasoning, and test cases.' },
              { num: '3', title: 'Understand', desc: 'Pinpoint exact root causes and failure vectors.' },
              { num: '4', title: 'Learn', desc: 'Master the underlying defect pattern with safe diffs.' },
              { num: '5', title: 'Improve', desc: 'Prove measurable skill growth across retries.' },
            ].map((step, idx) => (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-light-card border border-light-border shadow-card relative flex flex-col justify-between"
              >
                <div>
                  <span className="w-7 h-7 rounded-lg bg-aqua-soft text-navy font-bold font-mono text-xs flex items-center justify-center mb-3">
                    0{step.num}
                  </span>
                  <h4 className="text-base font-bold text-navy mb-1.5">{step.title}</h4>
                  <p className="text-xs text-light-textSecondary leading-relaxed">{step.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-light-borderStrong">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Six Defect / Review Areas */}
      <section id="defects" className="py-24 px-6 border-t border-light-border bg-light-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="accent" size="sm" className="mb-4">Taxonomy</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Six Critical Defect Archetypes
            </h2>
            <p className="mt-4 text-light-textSecondary text-base sm:text-lg">
              Master the vulnerability patterns responsible for over 90% of production rollbacks and security advisories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defectClasses.map((cls) => {
              const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield
              return (
                <Card
                  key={cls.id}
                  hover
                  onClick={() => navigate('/auth?mode=signup')}
                  className="p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: cls.bgColor, border: `1px solid ${cls.borderColor}` }}
                    >
                      <Icon size={20} style={{ color: cls.color }} />
                    </div>
                    <h3 className="text-base font-bold text-navy group-hover:text-aqua transition-colors">
                      {cls.label}
                    </h3>
                    <p className="text-xs text-light-textSecondary mt-2 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-light-border flex items-center justify-between text-2xs font-semibold text-light-textMuted group-hover:text-navy">
                    <span>Explore exercises</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why CodeSight: More than finding problems */}
      <section className="py-24 px-6 border-t border-light-border bg-light-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              More than finding problems.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-light-card border border-light-border shadow-card">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-aqua block mb-2">UNDERSTAND</span>
              <h3 className="text-lg font-bold text-navy mb-2">Know why something is wrong.</h3>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                CodeSight decomposes the underlying root cause. You won't just see a failed test; you'll learn the precise mechanical failure mode.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-card border border-light-border shadow-card">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-navy block mb-2">LEARN</span>
              <h3 className="text-lg font-bold text-navy mb-2">Turn weaknesses into focus.</h3>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                Your historical blind spots automatically generate curated learning modules with side-by-side safe code pattern replacements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-card border border-light-border shadow-card">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-success block mb-2">IMPROVE</span>
              <h3 className="text-lg font-bold text-navy mb-2">See whether you got better.</h3>
              <p className="text-xs text-light-textSecondary leading-relaxed">
                Track objective retention metrics over time. Prove that retried exercises reflect improved architectural discernment.
              </p>
            </div>
          </div>

          <div className="mt-14 p-8 rounded-2xl bg-navy text-white text-center shadow-xl">
            <p className="text-xl sm:text-2xl font-extrabold leading-snug">
              “CodeSight doesn’t just tell you what went wrong. <br className="hidden sm:inline" />
              It shows you what to work on next.”
            </p>
          </div>
        </div>
      </section>

      {/* Real-World Code Practices */}
      <section className="py-24 px-6 border-t border-light-border bg-light-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="default" size="sm" className="mb-4">Real Engineering</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Practice with real engineering patterns.
            </h2>
            <p className="mt-4 text-light-textSecondary text-sm sm:text-base">
              The exercise corpus is calibrated against genuine pull request bug fixes and security disclosures from popular open-source repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-light-elevated border border-light-border">
              <div className="flex items-center justify-between text-2xs font-mono text-light-textMuted mb-2">
                <span>flask / login_session.py</span>
                <Badge variant="muted" size="sm">Python</Badge>
              </div>
              <p className="text-sm font-bold text-navy">Timing-safe session comparison</p>
              <p className="text-2xs text-light-textSecondary mt-2">Auth & Access Control · OWASP Top 10</p>
            </div>

            <div className="p-5 rounded-2xl bg-light-elevated border border-light-border">
              <div className="flex items-center justify-between text-2xs font-mono text-light-textMuted mb-2">
                <span>node / worker_pool.js</span>
                <Badge variant="muted" size="sm">JavaScript</Badge>
              </div>
              <p className="text-sm font-bold text-navy">Unhandled async task queue rejections</p>
              <p className="text-2xs text-light-textSecondary mt-2">Error & Exception Handling · Node 18+</p>
            </div>

            <div className="p-5 rounded-2xl bg-light-elevated border border-light-border">
              <div className="flex items-center justify-between text-2xs font-mono text-light-textMuted mb-2">
                <span>go-service / counter.go</span>
                <Badge variant="muted" size="sm">Go</Badge>
              </div>
              <p className="text-sm font-bold text-navy">Concurrent goroutine race condition</p>
              <p className="text-2xs text-light-textSecondary mt-2">Concurrency & State · Race Detector</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-24 px-6 bg-navy-midnight text-white text-center border-t border-navy-border relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" variant="dark" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            See what your code instincts are really like.
          </h2>
          <p className="text-slate text-base max-w-xl mx-auto">
            Join developers building critical review and coding skills for an AI-assisted world.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="dark"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={16} />}
              className="px-8 bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Create Account
            </Button>
            <Button
              size="lg"
              variant="dark"
              onClick={() => navigate('/auth')}
              className="px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-border bg-navy text-slate py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <BrandLogo size="sm" variant="dark" />

          <div className="flex items-center gap-6 text-slate">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#students" className="hover:text-white transition-colors">Students</a>
            <a href="#professionals" className="hover:text-white transition-colors">Professionals</a>
            <a href="#defects" className="hover:text-white transition-colors">Learn</a>
            <Link to="/auth" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
