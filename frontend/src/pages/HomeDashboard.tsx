import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { BestsellersBookShowcase } from '@/shaders/landing-pages/LandingPages';
import { PromotionExamModal } from '@/components/PromotionExamModal';
import { 
  Shuffle,
  ArrowRight,
  GraduationCap,
  Bot,
  LockKeyhole,
  CheckCircle2, 
  Flame, 
  Trophy, 
  Award, 
  Zap, 
  Bug,
  Network,
  BarChart3,
  Target
} from 'lucide-react';
import { phaseOneProblems, PhaseOneProblem } from '@/data/codesight';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';

interface HomeDashboardProps {
  onSelectProblem?: (problem: PhaseOneProblem, mode: 'student' | 'engineer') => void;
}

export default function HomeDashboard({ onSelectProblem }: HomeDashboardProps = {}) {
  const [, setLocation] = useLocation();
  const [showExam, setShowExam] = useState(false);
  const [analysisTrack, setAnalysisTrack] = useState<'student' | 'engineer'>('student');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CODESIGHT_BOOK_CLICK') {
        const book = event.data.book;
        if (book === 'codex') {
          setLocation('/student/beginner');
        } else if (book === 'claude') {
          setLocation('/student/intermediate');
        } else if (book === 'cursor') {
          setLocation('/student/pro');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setLocation]);

  const studentSkillsData = [
    { subject: 'Input Validation', score: 88, fullMark: 100, level: 'Proficient' },
    { subject: 'Auth & Access', score: 92, fullMark: 100, level: 'Mastered' },
    { subject: 'Error Handling', score: 45, fullMark: 100, level: 'Needs Practice' },
    { subject: 'Concurrency', score: 78, fullMark: 100, level: 'Proficient' },
    { subject: 'Logic & Boundary', score: 64, fullMark: 100, level: 'Developing' },
    { subject: 'Resource & Perf', score: 82, fullMark: 100, level: 'Proficient' },
  ];

  const engineerSkillsData = [
    { subject: 'Hallucination Spotting', score: 94, fullMark: 100, level: 'Mastered' },
    { subject: 'Prompt Injection Def', score: 86, fullMark: 100, level: 'Proficient' },
    { subject: 'Context Window Opt', score: 72, fullMark: 100, level: 'Developing' },
    { subject: 'Guardrail Audit', score: 90, fullMark: 100, level: 'Mastered' },
    { subject: 'Boundary Fix Eff', score: 58, fullMark: 100, level: 'Needs Practice' },
    { subject: 'Benchmark Validation', score: 84, fullMark: 100, level: 'Proficient' },
  ];

  const activeSkillsData = analysisTrack === 'student' ? studentSkillsData : engineerSkillsData;

  const defectClasses = [
    {
      title: 'Logic & Boundary Conditions',
      detail: '(Loop invariants, off-by-one, quadratic searches)',
      rate: '58%',
      progress: 58,
    },
    {
      title: 'Injection & Input Validation',
      detail: '(SQL injection, command injection, unescaped params)',
      rate: '88%',
      progress: 88,
    },
    {
      title: 'Auth & Access Control',
      detail: '(Timing attacks, session hijacking, broken ACLs)',
      rate: '92%',
      progress: 92,
    },
    {
      title: 'Concurrency & Race Conditions',
      detail: '(Deadlocks, non-deterministic lock ordering)',
      rate: '78%',
      progress: 78,
    },
    {
      title: 'Error & Exception Handling',
      detail: '(NoneType subscript errors, swallowed exceptions)',
      rate: '45%',
      progress: 45,
    },
    {
      title: 'Resource Leaks & Performance',
      detail: '(Unbounded memory loads, unclosed descriptors)',
      rate: '82%',
      progress: 82,
    },
  ];

  return (
    <div className="w-full space-y-10 pb-20 text-[#17130F]">
      {showExam && <PromotionExamModal onClose={() => setShowExam(false)} />}

      {/* 1. CENTRAL DASHBOARD HEADER WITH TOP RIGHT ACTION BUTTONS */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mono text-[11px] font-bold tracking-widest text-[#786F65] uppercase">
              CENTRAL DASHBOARD
            </div>
            <h1 className="display mt-1 text-3xl font-bold text-[#17130F] tracking-tight">
              Welcome back, Prapul
            </h1>
            <p className="mt-1 text-sm text-[#786F65]">
              Select your track or resume your adaptive practice recommendations.
            </p>
          </div>

          {/* Top Right Action Buttons (Switch Track & View All Problems) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/ai-engineer')}
              className="flex items-center gap-2 rounded-xl border border-[#D8D0C0] bg-[#E2DCCF] px-4 py-2.5 text-xs font-bold text-[#17130F] transition-all hover:bg-[#D8D0C0] shadow-sm"
            >
              <Shuffle size={14} />
              <span>Switch Track</span>
            </button>

            <button
              onClick={() => setLocation('/problems')}
              className="flex items-center gap-2 rounded-xl bg-[#17130F] px-4 py-2.5 text-xs font-bold text-[#FFF7ED] transition-all hover:bg-[#2C241D] shadow-sm"
            >
              <span>View All Problems</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 2. 3D LEVEL SELECTION SHOWCASE (2ND PHOTO) */}
        <div className="w-full h-[calc(100vh-140px)] min-h-[620px] overflow-hidden rounded-2xl border border-[#D8D0C0] shadow-xl">
          <BestsellersBookShowcase
            headingFont="iowan-old-style"
            bodyFont="iowan-old-style"
            headingWeight="500"
            bodyWeight="400"
            primaryColor="#c3a47b"
            headingSize={325}
            bodySize={17}
            headingLetterSpacing={-0.085}
            className="w-full h-full"
          />
        </div>

        {/* 3. TRACK CARDS GRID (BELOW THE 2ND PHOTO SHOWCASE - FULLY WORKING) */}
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          {/* Student Track Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-6 shadow-md transition-all hover:border-[#17130F]/40">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-[#D8D0C0] bg-[#F7F4EC] text-[#17130F]">
                  <GraduationCap size={18} />
                </div>
                <span className="mono rounded-md border border-[#D8D0C0] bg-[#F7F4EC] px-3 py-1 text-[10px] font-bold tracking-wider text-[#17130F] uppercase">
                  LEVEL: BEGINNER
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#17130F]">Student Track</h2>
              <p className="mt-2 text-xs leading-5 text-[#655D54]">
                Build algorithmic instincts from scratch. Graded on Time Complexity ($TC$) & Space Complexity ($SC$) relative to optimal bounds.
              </p>

              <div className="mt-5 rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-4 text-xs font-mono text-[#17130F]">
                <div className="flex items-center justify-between">
                  <span className="text-[#786F65]">Primary Action:</span>
                  <span className="rounded bg-[#E2DCCF] px-2.5 py-0.5 font-bold">SOLVE</span>
                </div>
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#E2DCCF]">
                  <span className="text-[#786F65]">Evaluator:</span>
                  <span className="font-semibold">TC & SC Relative Grading (50/50)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setLocation('/student/beginner')}
                className="flex-1 rounded-xl bg-[#17130F] py-3 text-xs font-bold text-[#FFF7ED] transition-all hover:bg-[#2C241D] inline-flex items-center justify-center gap-2 shadow-sm"
              >
                Continue Student Track <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setLocation('/student/beginner')}
                className="rounded-xl border border-[#D8D0C0] bg-[#E2DCCF] px-4 py-3 text-xs font-bold text-[#17130F] hover:bg-[#D8D0C0]"
              >
                Level
              </button>
            </div>
          </div>

          {/* AI-Assisted Professional Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-6 shadow-md transition-all hover:border-[#17130F]/40">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-[#D8D0C0] bg-[#F7F4EC] text-[#17130F]">
                  <Bot size={18} />
                </div>
                <span className="mono rounded-md border border-[#C99700]/40 bg-[#F5E8C7] px-3 py-1 text-[10px] font-bold tracking-wider text-[#8A6300] uppercase">
                  PROMOTIONAL TEST REQUIRED
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#17130F]">AI-Assisted Professional</h2>
              <p className="mt-2 text-xs leading-5 text-[#655D54]">
                Train to review, inspect, and debug AI-generated code. Graded on bug localization, explanation clarity, and false-positive avoidance.
              </p>

              <div className="mt-5 rounded-xl border border-[#E8D49E] bg-[#F7EFC9]/60 p-4 text-xs font-semibold text-[#8A6300] flex items-center gap-2">
                <LockKeyhole size={16} className="shrink-0 text-[#C99700]" />
                <span>Locked until promotional code-review assessment is cleared.</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowExam(true)}
                className="w-full rounded-xl bg-[#17130F] py-3 text-xs font-bold text-[#FFF7ED] transition-all hover:bg-[#2C241D] inline-flex items-center justify-center gap-2 shadow-sm"
              >
                TAKE PROMOTIONAL TEST →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE SNAPSHOT & DEFECT CLASS CATCH RATES */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[#D8D0C0] pb-3">
          <span className="mono text-[11px] font-bold tracking-widest text-[#786F65] uppercase">
            PERFORMANCE SNAPSHOT
          </span>
          <div className="flex items-center gap-6 mono text-[11px] text-[#786F65]">
            <span className="uppercase tracking-widest font-bold">DEFECT CLASS CATCH RATES</span>
            <button 
              onClick={() => setLocation('/learn')}
              className="font-bold text-[#17130F] hover:underline inline-flex items-center gap-1"
            >
              View Full Mastery →
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: 4 Stat Boxes + Adaptive Recommendation */}
          <div className="space-y-6 lg:col-span-5">
            {/* 4 Stat Boxes (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-[#786F65]">
                  <CheckCircle2 size={15} className="text-[#17130F]" />
                  <span>Solved</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#17130F]">18</div>
                <div className="mt-1 text-[11px] text-[#786F65]">Exercises cleared</div>
              </div>

              <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-[#786F65]">
                  <Flame size={15} className="text-[#D97706]" />
                  <span>Streak</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#17130F]">4 <span className="text-sm font-normal text-[#786F65]">days</span></div>
                <div className="mt-1 text-[11px] text-[#786F65]">Consistent review</div>
              </div>

              <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-[#786F65]">
                  <Award size={15} className="text-[#17130F]" />
                  <span>Total XP</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#17130F]">2847</div>
                <div className="mt-1 text-[11px] text-[#786F65]">Score accumulated</div>
              </div>

              <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-[#786F65]">
                  <Trophy size={15} className="text-[#17130F]" />
                  <span>Global Rank</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#17130F]">#1</div>
                <div className="mt-1 text-[11px] text-[#786F65]">Top percentile</div>
              </div>
            </div>

            {/* ADAPTIVE RECOMMENDATION CARD */}
            <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-6 shadow-sm">
              <div className="mono text-[10px] font-bold tracking-widest text-[#D97706] uppercase flex items-center gap-1.5">
                <Zap size={14} className="fill-[#D97706]" />
                ADAPTIVE RECOMMENDATION
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#17130F]">
                Safe User Profile Lookup with Error Boundaries
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#655D54]">
                Targeting your lowest catch rate in <strong className="text-[#17130F]">Error & Exception Handling</strong>.
              </p>
              <button
                onClick={() => {
                  const prob = phaseOneProblems.find(p => p.title.includes('Safe User Profile Lookup')) || phaseOneProblems[0];
                  if (onSelectProblem) {
                    onSelectProblem(prob, 'student');
                  }
                  setLocation('/practice');
                }}
                className="mt-5 w-full rounded-xl bg-[#17130F] py-3 text-xs font-bold text-[#FFF7ED] transition-all hover:bg-[#2C241D] shadow-sm"
              >
                Practice This Weakness
              </button>
            </div>
          </div>

          {/* Right Column: Concept Mastery & Skill Graph Analysis */}
          <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-6 shadow-sm lg:col-span-7">
            {/* Header with Title and Control Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8D0C0] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#17130F]">Concept Mastery & Skill Graph</h3>
                <p className="mt-1 text-xs text-[#786F65]">
                  Real-time skill analysis for {analysisTrack === 'student' ? 'Student Track' : 'AI Engineer Track'}.
                </p>
              </div>

              {/* View Mode Switcher (Skill Graph vs List) */}
              <div className="flex items-center gap-1 rounded-xl border border-[#D8D0C0] bg-[#E2DCCF] p-1">
                <button
                  onClick={() => setViewMode('graph')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    viewMode === 'graph'
                      ? 'bg-[#17130F] text-[#FFF7ED] shadow-sm'
                      : 'text-[#655D54] hover:text-[#17130F]'
                  }`}
                >
                  <Network size={13} />
                  <span>Skill Graph</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#17130F] text-[#FFF7ED] shadow-sm'
                      : 'text-[#655D54] hover:text-[#17130F]'
                  }`}
                >
                  <BarChart3 size={13} />
                  <span>List View</span>
                </button>
              </div>
            </div>

            {/* Track Analysis Option Selector */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-3">
              <span className="mono text-[11px] font-bold text-[#786F65] uppercase flex items-center gap-1.5">
                <Target size={13} className="text-[#17130F]" />
                Analysis Track Option:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAnalysisTrack('student')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    analysisTrack === 'student'
                      ? 'border-[#17130F] bg-[#17130F] text-[#FFF7ED] shadow-sm'
                      : 'border-[#D8D0C0] bg-[#ECE7DA] text-[#655D54] hover:bg-[#D8D0C0] hover:text-[#17130F]'
                  }`}
                >
                  <GraduationCap size={13} />
                  <span>Student Track</span>
                </button>

                <button
                  onClick={() => setAnalysisTrack('engineer')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    analysisTrack === 'engineer'
                      ? 'border-[#17130F] bg-[#17130F] text-[#FFF7ED] shadow-sm'
                      : 'border-[#D8D0C0] bg-[#ECE7DA] text-[#655D54] hover:bg-[#D8D0C0] hover:text-[#17130F]'
                  }`}
                >
                  <Bot size={13} />
                  <span>AI Engineer Track</span>
                </button>
              </div>
            </div>

            {/* CONTENT DISPLAY: RADAR SKILL GRAPH VS LIST VIEW */}
            {viewMode === 'graph' ? (
              <div className="mt-5 space-y-4">
                {/* Interactive Recharts Radar Chart */}
                <div className="relative h-64 w-full rounded-2xl border border-[#D8D0C0] bg-[#F7F4EC] p-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={activeSkillsData}>
                      <PolarGrid stroke="#D8D0C0" strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#17130F', fontSize: 11, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#A39B8E" fontSize={10} />
                      <Radar
                        name="Skill Mastery"
                        dataKey="score"
                        stroke="#17130F"
                        strokeWidth={2}
                        fill="#17130F"
                        fillOpacity={0.25}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-[#D8D0C0] bg-[#17130F] p-3 text-[#FFF7ED] shadow-lg">
                                <div className="text-xs font-bold">{data.subject}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs">
                                  <span className="mono text-[#D97706] font-bold">{data.score}%</span>
                                  <span className="rounded bg-[#2C241D] px-1.5 py-0.5 text-[10px] text-[#E2DCCF]">
                                    {data.level}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stat Footer Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-3 text-center">
                    <div className="mono text-[10px] font-bold text-[#786F65] uppercase">Overall Mastery</div>
                    <div className="mt-1 text-base font-extrabold text-[#17130F]">
                      {analysisTrack === 'student' ? '74.8%' : '80.6%'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-3 text-center">
                    <div className="mono text-[10px] font-bold text-[#786F65] uppercase">Strongest Skill</div>
                    <div className="mt-1 text-xs font-bold text-[#17130F] truncate">
                      {analysisTrack === 'student' ? 'Auth & Access (92%)' : 'Hallucination Spotting (94%)'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-3 text-center">
                    <div className="mono text-[10px] font-bold text-[#D97706] uppercase">Focus Weakness</div>
                    <div className="mt-1 text-xs font-bold text-[#17130F] truncate">
                      {analysisTrack === 'student' ? 'Error Handling (45%)' : 'Boundary Fix Eff (58%)'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List View Progress Bars */
              <div className="mt-5 space-y-3">
                {defectClasses.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#D8D0C0] bg-[#F7F4EC] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ECE7DA] text-[#17130F]">
                          <Bug size={13} />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#17130F]">{item.title}</span>
                          <span className="ml-1 text-[11px] text-[#786F65]">{item.detail}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="mono text-xs font-bold text-[#17130F]">{item.rate}</span>
                        <button
                          onClick={() => setLocation('/learn')}
                          className="text-xs font-semibold text-[#17130F] hover:underline"
                        >
                          Deep Dive →
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E2DCCF]">
                      <div
                        style={{ width: `${item.progress}%` }}
                        className="h-full rounded-full bg-[#17130F] transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
