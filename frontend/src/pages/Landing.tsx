import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Shield, Lock, AlertTriangle, Zap, GitBranch, Gauge,
  ArrowRight, CheckCircle2, Sparkles, GraduationCap, ChevronRight,
  Search, Eye, HelpCircle, Layers, Check, ExternalLink, Terminal,
  Cpu, Award, Users, Crosshair, Brain, TrendingUp, Bot, FileCode,
  Flame, Swords, Play, Compass, ArrowDown, BookOpen, ChevronDown
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { BrandLogo } from '../components/ui/BrandLogo'
import { defectClasses } from '../tokens'
import { useThemeStore } from '../store/themeStore'

import { FullscreenPixelHero } from '../components/landing/FullscreenPixelHero'

const UPPER_NAV_ITEMS = [
  { id: 'philosophy', title: 'Philosophy', icon: Brain, label: 'WHY CODESIGHT' },
  { id: 'student-track', title: 'Student Track', icon: GraduationCap, label: 'SOLVE CODE' },
  { id: 'pro-track', title: 'AI Pro Track', icon: Bot, label: 'DEBUG AI CODE' },
  { id: 'taxonomies', title: '6 Defect Classes', icon: Shield, label: 'TAXONOMY' },
  { id: 'complexity-math', title: 'Scoring Engine', icon: Gauge, label: 'TC / SC FORMULA' },
  { id: 'multiplayer', title: 'Battle Arena', icon: Swords, label: 'MULTIPLAYER' },
  { id: 'faqs', title: 'Platform FAQ', icon: HelpCircle, label: 'QUESTIONS' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -70
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const faqs = [
    {
      q: 'How does CodeSight differ from traditional coding platforms like LeetCode or HackerRank?',
      a: 'Traditional platforms only test pass/fail assertion output. CodeSight measures Time Complexity (TC) and Space Complexity (SC) relative to the optimal achievable bounds for that problem. In addition, CodeSight offers a dedicated AI Engineer track where you review, audit, and debug flawed AI-generated code rather than writing solutions from scratch.',
    },
    {
      q: 'What is the purpose of the Promotional Assessment before entering the Professional Track?',
      a: 'AI code review requires deep discernment — identifying security vulnerabilities, race conditions, and boundary defects without creating false positives on valid production code. The promotional assessment ensures practitioners have baseline code-reading competence before attempting high-stakes audits.',
    },
    {
      q: 'How are Time and Space Complexity calculated?',
      a: 'Our execution engine combines static AST parsing with dynamic runtime benchmarking to measure algorithmic loops, recursion depth, and auxiliary data structures against theoretical optimal bounds (O(1), O(log n), O(n), O(n log n), O(n²)), awarding up to 50 points for Time Complexity and 50 points for Space Complexity.',
    },
    {
      q: 'Can I switch between Student Track and AI-Assisted Professional Track?',
      a: 'Yes! You can switch tracks at any time via the Top Navigation or Role Selection page. Your progress, weakness profile, and mastery rates are tracked independently for each track.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* 1. Fullscreen Hero Opener with Pixel Canvas */}
      <div className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden">
        <FullscreenPixelHero />
        <Navbar variant="marketing" />

        <div className="relative z-20 max-w-5xl w-full mx-auto px-6 flex flex-col justify-center py-16 my-auto">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="navy" size="sm">
                DUAL-TRACK ENGINEERING ECOSYSTEM
              </Badge>
              <span className="text-2xs font-mono text-[#E5DFC9]/60">Relative TC/SC Complexity &amp; PR Auditing</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#E5DFC9] tracking-tight leading-[1.1]">
              Write Optimal Code. <br className="hidden sm:inline" />
              Catch Broken AI.
            </h1>

            <p className="text-base sm:text-lg text-[#E5DFC9]/80 leading-relaxed max-w-2xl">
              Master algorithmic problem-solving with asymptotic time and space grading, or sharpen your instincts to audit, inspect, and debug AI-generated pull requests before they reach production.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[#3A2F1D]/60">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/role-select')}
                iconRight={<ArrowRight size={16} />}
                className="font-bold text-xs shadow-xl"
              >
                Choose Stream &amp; Start
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => scrollToSection('jump-nav')}
                className="text-xs text-[#E5DFC9]/80 hover:text-[#E5DFC9]"
              >
                Explore Downwards ↓
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="relative z-20 pb-8 text-center">
          <button
            onClick={() => scrollToSection('jump-nav')}
            className="inline-flex flex-col items-center gap-1.5 text-2xs font-mono text-[#E5DFC9]/60 hover:text-[#E5DFC9] transition-colors group cursor-pointer"
          >
            <span>SCROLL DOWN TO EXPLORE CODESIGHT</span>
            <ArrowDown size={14} className="animate-bounce text-[#E5DFC9] group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. Sticky Secondary Jump Bar */}
      <div id="jump-nav" className="sticky top-0 z-30 w-full bg-[#1A130D]/95 backdrop-blur border-b border-[#3A2F1D] py-2.5 px-4 overflow-x-auto hide-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-2xs font-mono">
          <span className="text-[#E5DFC9]/50 uppercase tracking-widest hidden md:inline font-bold">
            JUMP TO:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {UPPER_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-3 py-1 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9]/80 hover:text-[#E5DFC9] hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/40 transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <item.icon size={11} className="text-[#E5DFC9]" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/role-select')}
            className="text-2xs font-bold px-3 py-1 flex-shrink-0"
          >
            Get Started →
          </Button>
        </div>
      </div>

      {/* HERO / OVERVIEW SECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <Badge variant="gold" size="sm">COMPREHENSIVE PLATFORM OVERVIEW</Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#E5DFC9] tracking-tight leading-tight">
          Everything You Need to Know About CodeSight
        </h1>
        <p className="text-sm sm:text-base text-[#E5DFC9]/80 max-w-2xl mx-auto leading-relaxed">
          CodeSight is a dual-track engineering ecosystem that trains developers to write optimal algorithms from scratch and teaches professionals to audit, inspect, and debug AI-generated code.
        </p>

        {/* 6 UPPER INTERACTIVE COMPONENT CARDS (Click to scroll down) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left pt-8">
          {UPPER_NAV_ITEMS.slice(0, 6).map((item, idx) => (
            <Card
              key={item.id}
              hover
              onClick={() => scrollToSection(item.id)}
              className="p-5 bg-[#1A130D] border-[#3A2F1D] cursor-pointer group hover:border-[#E5DFC9]/60 hover:bg-[#3A2F1D]/30 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon size={16} />
                  </div>
                  <span className="text-3xs font-mono font-bold text-[#E5DFC9]/50">0{idx + 1}</span>
                </div>
                <span className="text-3xs font-mono uppercase tracking-widest text-[#E5DFC9]/60 font-bold block">
                  {item.label}
                </span>
                <h3 className="text-sm font-bold text-[#E5DFC9] group-hover:text-[#E5DFC9]">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-2xs font-mono text-[#E5DFC9]/70 group-hover:text-[#E5DFC9] pt-3 mt-3 border-t border-[#3A2F1D]/50">
                <span>View Section Details</span>
                <ArrowDown size={11} className="group-hover:translate-y-0.5 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: CORE PHILOSOPHY (#philosophy)
          ========================================================================= */}
      <section id="philosophy" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="navy" size="sm">01 · PLATFORM PHILOSOPHY</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            Why Writing and Reviewing Require Different Training
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            Modern software engineering has split into two distinct competencies. Traditional learning platforms only address writing code, completely ignoring the skill required to review AI-generated code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
              <Code2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#E5DFC9]">1. The Construction Instinct (Students)</h3>
            <p className="text-xs text-[#E5DFC9]/70 leading-relaxed">
              When writing algorithms from scratch, developers must master data structures, optimal time bounds, and memory limits. A pass/fail test is dangerous because a brute-force $O(N^2)$ solution can pass small test inputs while failing disastrously in production.
            </p>
            <div className="p-3 rounded-lg bg-[#000000] border border-[#3A2F1D] font-mono text-2xs text-[#E5DFC9]/80">
              CodeSight Solution: Relative Complexity Scoring ($TC + SC$)
            </div>
          </Card>

          <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
              <Bot size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#E5DFC9]">2. The Audit Instinct (AI Professionals)</h3>
            <p className="text-xs text-[#E5DFC9]/70 leading-relaxed">
              AI code generation tools write fluent, syntactically convincing code that looks correct on first glance but frequently hides subtle security vulnerabilities, race conditions, and unhandled null edge cases.
            </p>
            <div className="p-3 rounded-lg bg-[#000000] border border-[#3A2F1D] font-mono text-2xs text-[#E5DFC9]/80">
              CodeSight Solution: Simulated PR Audits &amp; False-Positive Restraint
            </div>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: STUDENT TRACK (#student-track)
          ========================================================================= */}
      <section id="student-track" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="navy" size="sm">02 · STUDENT TRACK</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            Build Algorithmic Foundations with Real Execution
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            The Student Track is tailored for students and early-career developers who want to master algorithmic problem-solving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">STEP 1</span>
            <h4 className="font-bold text-[#E5DFC9]">Diagnostic Placement</h4>
            <p className="text-2xs text-[#E5DFC9]/70 leading-relaxed">
              Take the "Know Your Level" diagnostic to determine whether you should start at Beginner, Intermediate, or Pro tier.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">STEP 2</span>
            <h4 className="font-bold text-[#E5DFC9]">Monaco IDE with Working Runner</h4>
            <p className="text-2xs text-[#E5DFC9]/70 leading-relaxed">
              Write Python or JavaScript in Monaco Editor. Click <strong>SOLVE</strong> to run live test cases and view terminal stdout.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <span className="text-2xs font-mono text-[#E5DFC9]/60 font-bold block">STEP 3</span>
            <h4 className="font-bold text-[#E5DFC9]">AI Complexity Diagnostics</h4>
            <p className="text-2xs text-[#E5DFC9]/70 leading-relaxed">
              Receive immediate feedback on asymptotic efficiency, boundary condition failures, and tailored practice recommendations.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/student/level-select')}
            iconRight={<ArrowRight size={14} />}
            className="font-bold text-xs"
          >
            Explore Student Track →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: AI PRO TRACK (#pro-track)
          ========================================================================= */}
      <section id="pro-track" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="gold" size="sm">03 · AI-ASSISTED PROFESSIONAL TRACK</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            Train Your Ability to Review and Debug Code
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            Engineers in the modern workforce spend more time reviewing PRs and verifying AI-generated diffs than writing boilerplate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] space-y-3">
            <h4 className="text-base font-bold text-[#E5DFC9] flex items-center gap-2">
              <Eye size={16} className="text-[#E5DFC9]" /> Promotional Entrance Examination
            </h4>
            <p className="text-xs text-[#E5DFC9]/70 leading-relaxed">
              To unlock the professional track, developers must complete a real code review simulation. You will be given candidate code with deliberate defects and must locate the lines, specify the flaw, and explain the architectural impact.
            </p>
          </Card>

          <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] space-y-3">
            <h4 className="text-base font-bold text-[#E5DFC9] flex items-center gap-2">
              <Shield size={16} className="text-[#E5DFC9]" /> False-Positive Guardrails
            </h4>
            <p className="text-xs text-[#E5DFC9]/70 leading-relaxed">
              A sloppy reviewer flags harmless idioms as bugs, wasting team velocity. CodeSight penalizes unbacked assertions and rewards surgical precision in defect isolation.
            </p>
          </Card>
        </div>

        <div className="pt-2">
          <Button
            size="md"
            variant="gold"
            onClick={() => navigate('/pro/promotional-test')}
            iconRight={<ArrowRight size={14} />}
            className="font-bold text-xs"
          >
            Take Promotional Test →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 6 DEFECT TAXONOMIES (#taxonomies)
          ========================================================================= */}
      <section id="taxonomies" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="navy" size="sm">04 · DEFECT TAXONOMY</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            The 6 Universal Defect Classes
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            Every exercise and code review challenge maps directly into one of six core engineering defect domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {defectClasses.map((cls) => (
            <Card key={cls.id} className="p-5 bg-[#1A130D] border-[#3A2F1D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-[#E5DFC9]/60">{cls.id.toUpperCase()}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.color }} />
              </div>
              <h3 className="text-sm font-bold text-[#E5DFC9]">{cls.label}</h3>
              <p className="text-2xs text-[#E5DFC9]/70 leading-relaxed">{cls.description}</p>
              <div className="pt-2">
                <Link
                  to={`/learn/${cls.id}`}
                  className="text-3xs font-mono text-[#E5DFC9] hover:underline flex items-center gap-1"
                >
                  <span>Learn Pattern &amp; Anti-Pattern</span>
                  <ChevronRight size={11} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SCORING ENGINE (#complexity-math)
          ========================================================================= */}
      <section id="complexity-math" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="gold" size="sm">05 · SCORING MATHEMATICS</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            The Relative Complexity Scoring Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            How CodeSight evaluates submitted solutions against theoretical asymptotic optimal bounds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
              <span className="text-2xs text-[#E5DFC9]/60 uppercase font-bold block">
                Time Complexity (50% of Score)
              </span>
              <p className="text-2xs text-[#E5DFC9]/80 leading-relaxed">
                If submitted TC matches optimal ($O(N) == O(N)$) $\rightarrow$ <strong>50 pts</strong>.<br />
                If sub-optimal by one order ($O(N \log N)$ vs $O(N)$) $\rightarrow$ <strong>35 pts</strong>.<br />
                If quadratic nested loop ($O(N^2)$ vs $O(N)$) $\rightarrow$ <strong>25 pts</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] space-y-2">
              <span className="text-2xs text-[#E5DFC9]/60 uppercase font-bold block">
                Space Complexity (50% of Score)
              </span>
              <p className="text-2xs text-[#E5DFC9]/80 leading-relaxed">
                If auxiliary memory matches optimal ($O(1) == O(1)$) $\rightarrow$ <strong>50 pts</strong>.<br />
                If extra hash map allocated ($O(N)$ vs $O(1)$) $\rightarrow$ <strong>25 pts</strong>.<br />
                Unbounded buffer memory allocations are flagged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: MULTIPLAYER BATTLE ARENA (#multiplayer)
          ========================================================================= */}
      <section id="multiplayer" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="navy" size="sm">06 · MULTIPLAYER BATTLE ARENA</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            Head-to-Head Code Review Battles
          </h2>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70 leading-relaxed max-w-3xl">
            Compete against peers or artificial intelligence bots in live synchronized review lobbies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <Swords size={20} className="text-[#E5DFC9]" />
            <h4 className="font-bold text-[#E5DFC9]">Same Code, Independent Reviews</h4>
            <p className="text-2xs text-[#E5DFC9]/70">
              Every reviewer receives the identical pull request with a live 3-minute timer.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <Flame size={20} className="text-amber-400" />
            <h4 className="font-bold text-[#E5DFC9]">Speed &amp; Precision Bonuses</h4>
            <p className="text-2xs text-[#E5DFC9]/70">
              Fast submissions gain bonus multipliers; false positives heavily dock points.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A130D] border border-[#3A2F1D] space-y-2">
            <Award size={20} className="text-[#E5DFC9]" />
            <h4 className="font-bold text-[#E5DFC9]">Podium Rankings</h4>
            <p className="text-2xs text-[#E5DFC9]/70">
              Live podium with global leaderboard rankings and human vs AI comparative metrics.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/contest')}
            iconRight={<ArrowRight size={14} />}
            className="font-bold text-xs"
          >
            Enter Contest Arena →
          </Button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FAQS (#faqs)
          ========================================================================= */}
      <section id="faqs" className="py-20 px-6 max-w-5xl mx-auto border-t border-[#3A2F1D] space-y-8">
        <div className="space-y-2">
          <Badge variant="gold" size="sm">07 · FREQUENTLY ASKED QUESTIONS</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E5DFC9]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#3A2F1D] bg-[#1A130D] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#3A2F1D]/30 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#E5DFC9]">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#E5DFC9]/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#E5DFC9]/75 leading-relaxed border-t border-[#3A2F1D]/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6 border-t border-[#3A2F1D]">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9]">
          Ready to Train Your Instinct for Code?
        </h2>
        <p className="text-xs sm:text-sm text-[#E5DFC9]/70 max-w-lg mx-auto">
          Join engineers mastering algorithmic complexity and AI code review on CodeSight.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/role-select')}
            iconRight={<ArrowRight size={16} />}
            className="font-bold text-xs shadow-xl"
          >
            Choose Stream &amp; Get Started
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/role-select')}
            className="text-xs"
          >
            Choose Track
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#3A2F1D] text-2xs text-[#E5DFC9]/50 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <BrandLogo size="sm" variant={theme === 'light' ? 'light' : 'dark'} />
        <span>CodeSight 2.0 · Algorithmic Complexity &amp; AI Code Review Platform</span>
      </footer>
    </div>
  )
}
