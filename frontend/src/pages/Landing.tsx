import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Code2, Shield, Lock, AlertTriangle, Zap, GitBranch, Gauge,
  ArrowRight, CheckCircle2, Sparkles, GraduationCap, ChevronRight,
  Search, Eye, HelpCircle, Layers, Check, ExternalLink, Terminal,
  Cpu, Award, Users, Crosshair, Brain, TrendingUp
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { BrandLogo } from '../components/ui/BrandLogo'
import { FullscreenPixelHero } from '../components/landing/FullscreenPixelHero'
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
    <div className="min-h-screen bg-[#0D1117] text-[#F4F1E8] selection:bg-[#35C6B0]/30 selection:text-[#F4F1E8]">
      {/* 1. FULLSCREEN OPENING EXPERIENCE: 30-FRAME PIXEL-ART SCENE WITH FIXED TOP NAV */}
      <FullscreenPixelHero />

      {/* 2. SECTION: PLATFORM (#platform) */}
      <section id="platform" className="py-28 px-6 max-w-6xl mx-auto border-b border-[#29333A]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="navy" size="sm">THE CODESIGHT PLATFORM</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F4F1E8] tracking-tight">
            Writing code is only half the job.
          </h2>
          <p className="text-[#DDD9CF] text-base sm:text-lg leading-relaxed">
            In an era where AI generates code instantly, the most critical engineering capability is knowing whether that code is correct, safe, and ready for production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Approach */}
          <div className="p-8 rounded-2xl border border-[#29333A] bg-[#151C24] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#AEB7B2] uppercase tracking-wider">
                Traditional Code Practice
              </span>
              <span className="text-xs text-[#E0646D] font-semibold">Passive Loop</span>
            </div>

            <div className="space-y-4 text-xs font-mono text-[#AEB7B2]">
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3">
                <span className="text-[#AEB7B2]">1.</span>
                <span>Write code against rigid unit tests</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3">
                <span className="text-[#AEB7B2]">2.</span>
                <span>Get a simple pass/fail score</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3">
                <span className="text-[#AEB7B2]">3.</span>
                <span>Move to the next puzzle with no error retention</span>
              </div>
            </div>

            <p className="text-xs text-[#AEB7B2] leading-relaxed pt-2 border-t border-[#29333A]">
              Fails to build instincts for edge cases, race conditions, unchecked return values, or subtle auth vulnerabilities.
            </p>
          </div>

          {/* CodeSight Approach */}
          <div className="p-8 rounded-2xl border border-[#35C6B0]/40 bg-[#151C24] shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#35C6B0]/10 blur-2xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#35C6B0] uppercase tracking-wider">
                The CodeSight Diagnostic Engine
              </span>
              <span className="text-xs text-[#35B889] font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active Retention Loop
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono text-[#F4F1E8]">
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3 shadow-sm">
                <span className="text-[#35C6B0] font-bold">1.</span>
                <span>Inspect real code &amp; submit solutions or line tags</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3 shadow-sm">
                <span className="text-[#35C6B0] font-bold">2.</span>
                <span>CodeSight identifies your exact weakness archetypes</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#202A31] flex items-center gap-3 shadow-sm">
                <span className="text-[#35C6B0] font-bold">3.</span>
                <span>Understand the missing pattern with diffs &amp; micro-checks</span>
              </div>
            </div>

            <p className="text-xs text-[#DDD9CF] leading-relaxed pt-2 border-t border-[#29333A]">
              Builds lasting code review and defensive coding instincts calibrated against real open-source pull requests.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION: HOW IT WORKS (#how-it-works) */}
      <section id="how-it-works" className="py-28 px-6 max-w-6xl mx-auto border-b border-[#29333A]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="navy" size="sm">THE 5-STEP LOOP</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F1E8] tracking-tight">
            Built around real review behavior.
          </h2>
          <p className="text-[#DDD9CF] text-base">
            Never just multiple-choice quizzes. CodeSight engages your actual diagnostic thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Inspect', desc: 'Read unfamiliar production code without spoilers or line counts.' },
            { step: '02', title: 'Locate', desc: 'Tag suspect lines and submit your findings or code solution.' },
            { step: '03', title: 'Diagnose', desc: 'See where you missed and what pattern was actually involved.' },
            { step: '04', title: 'Master', desc: 'Compare vulnerable vs. safer implementations with interactive diffs.' },
            { step: '05', title: 'Target', desc: 'Your next exercise automatically focuses on your detected blind spots.' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-[#151C24] border border-[#29333A] hover:border-[#35C6B0]/50 transition-colors space-y-3"
            >
              <span className="text-xs font-mono font-bold text-[#35C6B0]">{item.step}</span>
              <h3 className="text-base font-bold text-[#F4F1E8]">{item.title}</h3>
              <p className="text-xs text-[#AEB7B2] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: FOR STUDENTS (#students) & FOR PROFESSIONALS (#professionals) */}
      <section id="students" className="py-28 px-6 max-w-6xl mx-auto border-b border-[#29333A]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="navy" size="sm">PERSONALIZED PATHWAYS</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F1E8] tracking-tight">
            Two specialized engineering tracks.
          </h2>
          <p className="text-[#DDD9CF] text-base">
            Choose your learning objective. Seamlessly switch modes at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Track */}
          <div className="p-8 rounded-2xl border border-[#29333A] bg-[#151C24] flex flex-col justify-between shadow-xl hover:border-[#35C6B0]/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1117] border border-[#29333A] text-[#35C6B0] flex items-center justify-center mb-6">
                <GraduationCap size={24} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">STUDENT TRACK</Badge>
              <h3 className="text-2xl font-bold text-[#F4F1E8] mb-2 group-hover:text-[#35C6B0] transition-colors">
                For Students &amp; Learners
              </h3>
              <p className="text-sm font-semibold text-[#35C6B0] mb-3">
                Build your coding instincts &amp; uncover blind spots
              </p>
              <p className="text-xs text-[#AEB7B2] leading-relaxed mb-6">
                Write code in a dedicated Monaco IDE, run tests, and discover where your code fails on error handling and logic bounds.
              </p>

              <div className="space-y-2 mb-8 bg-[#0D1117] p-4 rounded-xl border border-[#202A31] text-xs text-[#DDD9CF]">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35B889]" />
                  <span>Monaco editor with automated test suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35B889]" />
                  <span>Personalized weakness &amp; blind spot analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35B889]" />
                  <span>Vulnerable vs. Safer code pattern diffs</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="primary"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={16} />}
            >
              Start as Student
            </Button>
          </div>

          {/* Professional Track (#professionals) */}
          <div id="professionals" className="p-8 rounded-2xl border border-[#29333A] bg-[#151C24] flex flex-col justify-between shadow-xl hover:border-[#35C6B0]/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1117] border border-[#29333A] text-[#58D8C5] flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <Badge variant="navy" size="sm" className="mb-2">PROFESSIONAL TRACK</Badge>
              <h3 className="text-2xl font-bold text-[#F4F1E8] mb-2 group-hover:text-[#35C6B0] transition-colors">
                For AI-Assisted Professionals
              </h3>
              <p className="text-sm font-semibold text-[#58D8C5] mb-3">
                Review AI-generated code with confidence
              </p>
              <p className="text-xs text-[#AEB7B2] leading-relaxed mb-6">
                Inspect large real-world codebases (200-500+ lines), spot security vulnerabilities, tag suspect lines, and benchmark against AI.
              </p>

              <div className="space-y-2 mb-8 bg-[#0D1117] p-4 rounded-xl border border-[#202A31] text-xs text-[#DDD9CF]">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35C6B0]" />
                  <span>Code X-Ray architectural risk mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35C6B0]" />
                  <span>Line-by-line review findings drawer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#35C6B0]" />
                  <span>AI vs. Human reviewer precision benchmark</span>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              variant="dark"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={16} />}
              className="bg-[#35C6B0] text-[#0D1117] hover:bg-[#58D8C5] font-bold border-none"
            >
              Start as Professional
            </Button>
          </div>
        </div>
      </section>

      {/* 5. SECTION: DEFECT CLASSES (#defects) */}
      <section id="defects" className="py-28 px-6 max-w-6xl mx-auto border-b border-[#29333A]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="navy" size="sm">SIX DEFECT TAXONOMIES</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F1E8] tracking-tight">
              Master the defect classes that matter.
            </h2>
            <p className="text-sm text-[#AEB7B2]">
              Targeted exercises calibrated against genuine pull requests and security disclosures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {defectClasses.map((cls) => {
              const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield
              return (
                <div
                  key={cls.id}
                  className="p-6 rounded-2xl bg-[#151C24] border border-[#29333A] hover:border-[#35C6B0]/50 transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0D1117] border border-[#29333A] flex items-center justify-center text-[#35C6B0] shadow-sm">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-[#F4F1E8]">{cls.label}</h4>
                  <p className="text-xs text-[#AEB7B2] leading-relaxed">{cls.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="py-28 px-6 bg-[#0D1117] text-[#F4F1E8] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" variant="dark" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F4F1E8]">
            See what your code instincts are really like.
          </h2>
          <p className="text-[#DDD9CF] text-base max-w-xl mx-auto">
            Join developers building critical review and coding skills for an AI-assisted world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/auth?mode=signup')}
              iconRight={<ArrowRight size={16} />}
              className="px-8 shadow-[0_0_24px_rgba(53,198,176,0.35)] font-bold"
            >
              Create Free Account
            </Button>
            <Button
              size="lg"
              variant="dark"
              onClick={() => navigate('/auth')}
              className="px-7 border-[#29333A] bg-[#151C24] hover:bg-[#0D1117] text-[#F4F1E8]"
            >
              Sign In to Workspace
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#151C24] text-[#AEB7B2] border-t border-[#29333A] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo size="sm" variant="dark" />
          <div className="flex items-center gap-6 text-[#AEB7B2]">
            <a href="#platform" className="hover:text-[#35C6B0] transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-[#35C6B0] transition-colors">How It Works</a>
            <a href="#students" className="hover:text-[#35C6B0] transition-colors">Students</a>
            <a href="#professionals" className="hover:text-[#35C6B0] transition-colors">Professionals</a>
            <a href="#defects" className="hover:text-[#35C6B0] transition-colors">Defect Classes</a>
            <Link to="/auth" className="hover:text-[#35C6B0] transition-colors">Sign In</Link>
          </div>
          <p className="text-[#AEB7B2]/70 font-mono text-2xs">
            &copy; 2026 CodeSight · Engineered for high-stakes software development.
          </p>
        </div>
      </footer>
    </div>
  )
}
