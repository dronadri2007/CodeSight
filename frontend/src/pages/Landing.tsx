import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye, ArrowRight, CheckCircle2, Shield, Lock, AlertTriangle,
  Zap, GitBranch, Gauge, ChevronRight, Crosshair, Brain,
  TrendingUp, Terminal, Sparkles, AlertCircle, ArrowUpRight
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
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
  const [activeTab, setActiveTab] = useState<'traditional' | 'codesight'>('codesight')

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-accent/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/80 bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-accent-glow transition-transform group-hover:scale-105">
              <Eye size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">
              CodeSight
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
            <a href="#categories" className="hover:text-text-primary transition-colors">Defect Classes</a>
            <a href="#blindspots" className="hover:text-text-primary transition-colors">Blind Spots</a>
            <Link to="/learn" className="hover:text-text-primary transition-colors">Concepts</Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:inline-flex"
            >
              Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/practice')}
              iconRight={<ArrowRight size={14} />}
            >
              Start Reviewing
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6"
        >
          <Sparkles size={12} />
          Human Code Review Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] max-w-4xl text-text-primary"
        >
          Train your eye <br className="hidden sm:inline" />
          <span className="text-gradient-accent">for real code review.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl font-normal leading-relaxed"
        >
          CodeSight doesn’t review code for you. It trains you to review code.
          Analyze unfamiliar pull requests, explain your reasoning, and eliminate your engineering blind spots.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => navigate('/practice')}
            iconRight={<ArrowRight size={16} />}
            className="w-full sm:w-auto shadow-lg shadow-accent/25 px-7 text-base font-semibold"
          >
            Start Reviewing
          </Button>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-base"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Hero Interactive Workspace Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-5xl mt-14 rounded-2xl border border-border bg-bg-surface shadow-2xl overflow-hidden text-left card-inset-border"
        >
          {/* Mock window top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-3">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="font-mono text-text-muted">codesight / exercise-08-auth-patch.py</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="muted" size="sm">Python</Badge>
              <Badge variant="warning" size="sm">Auth & Access Control</Badge>
              <span className="font-mono text-text-muted hidden sm:inline">02:45 remaining</span>
            </div>
          </div>

          {/* Workspace preview grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border bg-bg-primary/50 min-h-[380px]">
            {/* Code editor side */}
            <div className="lg:col-span-7 p-4 font-mono text-xs leading-relaxed overflow-x-auto select-none">
              <div className="space-y-1">
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">1</span><span className="text-accent">import</span> hashlib, hmac</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">2</span><span className="text-accent">from</span> flask <span className="text-accent">import</span> Flask, request, jsonify</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">3</span></div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">4</span><span className="text-text-secondary">@app.route('/login', methods=['POST'])</span></div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">5</span><span className="text-accent">def</span> <span className="text-warning">login</span>():</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">6</span>    username = request.json.get('username', '')</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">7</span>    password = request.json.get('password', '')</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">8</span></div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">9</span>    stored_hash = get_stored_hash(username)</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">10</span>   <span className="text-accent">if</span> stored_hash <span className="text-accent">is</span> None:</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">11</span>       <span className="text-accent">return</span> jsonify(&#123;'error': 'Invalid credentials'&#125;), 401</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">12</span></div>
                {/* Highlighted suspicious lines */}
                <div className="flex bg-accent-subtle/80 border-l-2 border-accent text-text-primary py-0.5">
                  <span className="w-6 text-right mr-4 text-accent font-bold">13</span>
                  <span>   <span className="text-accent">if</span> stored_hash == hash_password(password): <span className="text-accent-secondary text-[11px] ml-2 font-sans">// [Line 13 Selected]</span></span>
                </div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">14</span>       session['user'] = username</div>
                <div className="flex text-text-muted"><span className="w-6 text-right mr-4 text-text-muted/50">15</span>       <span className="text-accent">return</span> jsonify(&#123;'status': 'ok'&#125;)</div>
              </div>
            </div>

            {/* Review inspector side */}
            <div className="lg:col-span-5 p-5 bg-bg-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Your Review</span>
                  <Badge variant="accent" size="sm">Line 13 Selected</Badge>
                </div>
                <div className="mt-4">
                  <label className="text-xs text-text-secondary font-medium block mb-2">What did you find?</label>
                  <div className="p-3 rounded-lg bg-bg-secondary border border-border-strong text-xs font-sans text-text-secondary leading-relaxed">
                    "Line 13 uses standard == string comparison for password hashes. This is vulnerable to timing attacks that leak character matches. Should use hmac.compare_digest()."
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted">Ready to grade</span>
                <Button size="sm" onClick={() => navigate('/practice/ex-08')}>
                  Try Interactive Demo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Philosophy / Contrast Section */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border bg-bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="accent" size="sm" className="mb-4">Core Methodology</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              Writing code is only half the job.
            </h2>
            <p className="mt-4 text-text-secondary text-base sm:text-lg">
              Senior engineers spend up to 40% of their time reviewing code written by humans and AI.
              Traditional courses teach you to write; CodeSight teaches you to critique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional path */}
            <Card className="p-6 border-border/80 bg-bg-surface/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-text-muted font-mono text-xs uppercase tracking-wider mb-4">
                  <AlertCircle size={14} className="text-text-muted" /> Traditional Learning
                </div>
                <h3 className="text-xl font-bold text-text-secondary mb-3">Passive Coding Drills</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-6">
                  You write toy algorithms, hit submit, and run test suites. You never develop the visual acuity to spot architectural pitfalls, logic bugs, or security gaps in someone else's PR.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-bg-secondary p-3 rounded-lg border border-border">
                Write Code <ChevronRight size={12} /> Run Tests <ChevronRight size={12} /> Pass/Fail Grade
              </div>
            </Card>

            {/* CodeSight path */}
            <Card className="p-6 border-accent/40 bg-accent-subtle/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider mb-4 font-semibold">
                  <Sparkles size={14} className="text-accent" /> The CodeSight Loop
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Active Review Cognition</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  You inspect real production patches. You localize the suspicious lines and justify why they fail. AI evaluates your review rigor, exposes what you missed, and sharpens your instincts.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-text-primary bg-bg-secondary p-3 rounded-lg border border-accent/30 overflow-x-auto hide-scrollbar">
                <span className="text-accent font-semibold">Review</span>
                <ChevronRight size={12} className="text-text-muted" />
                <span className="text-accent-secondary font-semibold">Explain</span>
                <ChevronRight size={12} className="text-text-muted" />
                <span className="text-warning font-semibold">AI Grade</span>
                <ChevronRight size={12} className="text-text-muted" />
                <span className="text-success font-semibold">Master Pattern</span>
              </div>
            </Card>
          </div>

          {/* Three Steps Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <Crosshair size={20} />
              </div>
              <h4 className="text-lg font-bold text-text-primary mb-2">1. Find</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Spot defect vectors in real Python, JavaScript, and Go code without cheat hints or bug counters.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-lg bg-accent-secondary/20 text-accent-secondary flex items-center justify-center mb-4">
                <Brain size={20} />
              </div>
              <h4 className="text-lg font-bold text-text-primary mb-2">2. Understand</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Learn why your mental model failed. Compare your review against real engineer pull request diffs.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-lg bg-success-subtle text-success flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <h4 className="text-lg font-bold text-text-primary mb-2">3. Improve</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Adaptive practice schedules exercises specifically in your highest false-positive and blind-spot classes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Six Defect Classes */}
      <section id="categories" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="muted" size="sm" className="mb-4">Comprehensive Curriculum</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Six Professional Defect Classes
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg">
            Master the vulnerability archetypes that cause 90% of production incidents and pull request rollbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defectClasses.map((cls) => {
            const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield
            return (
              <Card
                key={cls.id}
                hover
                onClick={() => navigate(`/practice?class=${cls.id}`)}
                className="p-6 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${cls.color}15`, border: `1px solid ${cls.color}35` }}
                  >
                    <Icon size={20} style={{ color: cls.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                    {cls.label}
                  </h3>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {cls.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-text-primary">
                  <span>Practice category</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Blind Spots Section */}
      <section id="blindspots" className="py-20 px-6 border-t border-border bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <Badge variant="warning" size="sm" className="mb-4">Blind Spot Analytics</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary leading-tight">
                Your blind spots become your practice roadmap.
              </h2>
              <p className="mt-4 text-text-secondary text-sm sm:text-base leading-relaxed">
                CodeSight tracks not just what you caught, but what you overlooked. If you consistently miss unchecked promise rejections or time-of-check bugs, CodeSight generates targeted exercises until it becomes muscle memory.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Button onClick={() => navigate('/progress')}>
                  View Sample Skill Profile
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="p-6 border-border bg-bg-surface shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Review Skill Distribution</h4>
                    <p className="text-xs text-text-muted">Aggregated catch-rate by defect taxonomy</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-accent">Skill Score: 72/100</span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">Logic & Boundary</span>
                      <span className="text-success font-mono font-bold">82% (Strong)</span>
                    </div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">Injection / Input Validation</span>
                      <span className="text-accent font-mono font-bold">78%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-warning-subtle/40 border border-warning/30">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-warning font-semibold flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Error & Exception Handling (Focus Area)
                      </span>
                      <span className="text-warning font-mono font-bold">43%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: '43%' }} />
                    </div>
                    <span className="text-[11px] text-text-muted mt-1.5 block">
                      3 missed unchecked return errors detected in recent attempts.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">Auth & Access Control</span>
                      <span className="text-text-secondary font-mono font-bold">61%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-text-muted rounded-full" style={{ width: '61%' }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Ready to train your eye for code?
        </h2>
        <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto">
          Start reviewing real patches today. Build the intuition that distinguishes senior engineers.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/practice')}
            iconRight={<ArrowRight size={16} />}
            className="px-8 font-semibold shadow-lg shadow-accent/20"
          >
            Start Free Practice
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-text-muted">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <Eye size={12} className="text-white" />
            </div>
            <span className="font-bold text-text-primary">CodeSight</span>
            <span>—</span>
            <span>Train your eye for code.</span>
          </div>

          <div className="text-xs text-center sm:text-right font-mono">
            <p className="text-text-secondary font-medium">Team HackHive</p>
            <p className="text-text-muted mt-0.5">Tech Eximius 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
