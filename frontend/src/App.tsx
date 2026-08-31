import React, { useState, useMemo, useEffect } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ArrowRight, BookOpen, Check, ChevronRight, CircleAlert, Clock3, Code2,
  Filter, Flame, Layers3, Lightbulb, ListFilter, LockKeyhole, Play, RotateCcw, Search,
  Send, Sparkles, Target, Trophy, X, Zap
} from 'lucide-react';
import BrandMark from '@/components/layout/BrandMark';
import AppShell from '@/components/layout/AppShell';
import { achievements, challenges, learningTopics, leaderboard, phaseOneLanguages, phaseOneTopics, phaseOneProblems, getPhaseOneProblem, getPhaseOneRecommendations, PhaseOneResource, PhaseOneProblem } from '@/data/codesight';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider } from './contexts/SoundContext';
import { Toaster, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import DebugArenaPage from './pages/DebugArena';
import { PremiumActivityChart, TodayGoalCard, XpProgressionChart } from '@/components/dashboard/DashboardWidgets';
import { CodeEditor, AnalysisPanel } from '@/components/code/CodeEditor';
import { AuthProvider } from './contexts/AuthContext';
import { TrackProvider, useTrack } from './contexts/TrackContext';
import Home from './pages/Home';
import HomeDashboard from './pages/HomeDashboard';
import AIEngineerDashboard from './pages/AIEngineerDashboard';
import CodeReviewPage from './pages/CodeReviewPage';
import CodeXRayPage from './pages/CodeXRayPage';
import FalsePositivePage from './pages/FalsePositivePage';
import AdminPage from './pages/AdminPage';
import { BestsellersBookShowcase } from './components/animations/BestsellersBookShowcase';
import { OnboardingExplainer } from './components/OnboardingExplainer';
import { AuthModal } from './components/AuthModal';
import { ProblemsPage } from './pages/ProblemsPage';
import { PracticeWorkspace } from './components/PracticeWorkspace';
import { ResultsPage } from './pages/ResultsPage';
import { PromotionExamModal } from './components/PromotionExamModal';
import { BattlePage } from './pages/BattlePage';
import { ConceptLearnPage } from './pages/ConceptLearnPage';
import { ProfilePage as EnhancedProfilePage } from './pages/ProfilePage';

const badge = (text: string, tone = 'slate') => {
  const lower = text.toLowerCase();
  let badgeClass = 'border-[#2E2238] bg-[#17121C] text-[#AAA2B5]';

  if (lower === 'easy' || tone === 'easy' || tone === 'mint' || tone === 'green') {
    badgeClass = 'border-[#22C55E]/40 bg-[#22C55E]/15 text-[#4ADE80]';
  } else if (lower === 'medium' || tone === 'medium' || tone === 'amber' || tone === 'yellow') {
    badgeClass = 'border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#FBBF24]';
  } else if (lower === 'hard' || tone === 'hard' || tone === 'coral' || tone === 'red') {
    badgeClass = 'border-[#EF4444]/40 bg-[#EF4444]/15 text-[#FCA5A5]';
  } else if (lower === 'expert' || tone === 'expert' || tone === 'purple') {
    badgeClass = 'border-[#C96A32]/40 bg-[#C96A32]/15 text-[#C9A7FF]';
  } else if (tone === 'blue' || tone === 'cyan' || tone === 'primary') {
    badgeClass = 'border-[#C96A32]/40 bg-[#C96A32]/15 text-[#C9A7FF]';
  }

  return (
    <span className={`rounded border px-2 py-0.5 mono text-[9px] font-bold uppercase tracking-[.08em] ${badgeClass}`}>
      {text}
    </span>
  );
};

const Stat = ({ label, value, note, icon: Icon, tone = 'blue' }: { label: string; value: string; note: string; icon: React.ElementType; tone?: string }) => (
  <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm transition-transform hover:-translate-y-0.5">
    <div className="flex items-center justify-between">
      <span className="eyebrow text-[#AAA2B5]">{label}</span>
      <Icon size={16} className={tone === 'amber' || tone === 'orange' ? 'text-[#C96A32]' : tone === 'coral' || tone === 'red' ? 'text-[#EF4444]' : tone === 'green' ? 'text-[#4ADE80]' : 'text-[#C96A32]'} />
    </div>
    <div className="mt-3 display text-[26px] font-semibold tracking-[-.05em] text-[#F5EFE6]">{value}</div>
    <div className="mt-1 text-[11px] text-[#AAA2B5]">{note}</div>
  </div>
);

const PageHeading = ({ eyebrow, title, body, action }: { eyebrow: string; title: string; body: string; action?: React.ReactNode }) => (
  <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div>
      <div className="diag-rail mb-3">
        <span className="mono text-[9px] text-[#AAA2B5]">TRACE / ACTIVE</span>
        <span className="eyebrow text-[#C96A32]">{eyebrow}</span>
      </div>
      <h1 className="display text-[32px] font-semibold tracking-[-.055em] text-[#F5EFE6] sm:text-[40px]">{title}</h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-5 text-[#AAA2B5]">{body}</p>
    </div>
    {action}
  </div>
);



function Dashboard() {
  return (
    <>
      <PageHeading
        eyebrow="Workspace / dashboard"
        title="Inspect yesterday's signal."
        body="Your practice is building momentum. Read the evidence from your last seven days and choose the next gap to investigate."
        action={
          <Link href="/arena" className="btn-primary inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-[11px] font-bold shadow-sm">
            Read the evidence <ArrowRight size={14}/>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active chain" value="3 days" note="Best: 12 days" icon={Flame} tone="orange"/>
        <Stat label="Verified XP" value="2,450" note="+320 this week" icon={Zap} tone="orange"/>
        <Stat label="Cases closed" value="137" note="+8 this week" icon={BugIcon} tone="coral"/>
        <Stat label="Trace accuracy" value="82%" note="+4.6% vs last week" icon={Target} tone="green"/>
      </div>

      <PhaseJourney/>

      <div className="mt-7 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="eyebrow text-[#C96A32]">Weekly debugging activity</div>
              <h2 className="display mt-2 text-[22px] font-semibold text-[#F5EFE6]">Keep the signal moving.</h2>
            </div>
            <span className="mono text-[10px] font-bold text-[#C96A32]">+18% / 7D</span>
          </div>
          <PremiumActivityChart/>
        </div>

        <TodayGoalCard/>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <SectionTitle label="Recommended next" link="/challenges"/>
          <div className="space-y-2">
            {challenges.slice(1,4).map(c => <ChallengeRow challenge={c} key={c.id}/>)}
          </div>
        </div>

        <div>
          <SectionTitle label="Recent evidence" link="/profile"/>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {achievements.slice(0,3).map(a => {
              const achievementColor =
                a.title === 'First Fix' || a.title === 'Perfect Fix' ? '#4ADE80' :
                a.title === 'Bug Hunter' || a.title === 'Master Debugger' ? '#C96A32' :
                a.title === 'Logic Detective' ? '#C9A7FF' : '#C96A32';

              const bgTone =
                a.title === 'First Fix' || a.title === 'Perfect Fix' ? 'bg-[#22C55E]/15 text-[#4ADE80]' :
                a.title === 'Bug Hunter' || a.title === 'Master Debugger' ? 'bg-[#C96A32]/15 text-[#C96A32]' :
                a.title === 'Logic Detective' ? 'bg-[#C9A7FF]/15 text-[#C9A7FF]' : 'bg-[#C96A32]/15 text-[#C96A32]';

              return (
                <div key={a.title} className={`achievement-card flex items-center gap-3 rounded-[10px] border border-[#2E2238] bg-[#17121C] p-3.5 shadow-sm ${a.earned ? 'achievement-earned' : ''}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-md font-bold ${a.earned ? bgTone : 'bg-[#211827] text-[#AAA2B5]'}`}>
                    {a.earned ? (a.title === 'Bug Hunter' ? <BugIcon size={16}/> : <Sparkles size={16}/>) : <Target size={15}/>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-[12px] font-semibold text-[#F5EFE6]">{a.title}</div>
                      <span className="mono text-[10px] font-bold" style={{ color: a.earned ? achievementColor : '#AAA2B5' }}>
                        +{a.title === 'First Fix' ? 50 : a.title === 'Bug Hunter' ? 250 : 180} XP
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-[#AAA2B5]">{a.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function PhaseJourney() {
  return (
    <div className="mt-5 rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="eyebrow text-[#C96A32]">CodeSight journey</div>
          <h2 className="display mt-2 text-[20px] font-semibold text-[#F5EFE6]">Write first. Then investigate.</h2>
        </div>
        <Link href="/write" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#C96A32]">
          Open Phase 1 <ArrowRight size={13}/>
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-[#C96A32]/40 bg-[#C96A32]/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] font-bold text-[#C96A32]">PHASE 1 / PROGRESS</span>
            <span className="mono text-[10px] font-bold text-[#F5EFE6]">90%</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-[#F5EFE6]">Write code + personalized analysis</div>
              <p className="mt-1 text-[10px] leading-4 text-[#AAA2B5]">Master every required topic before the next phase unlocks.</p>
            </div>
            <span className="mono whitespace-nowrap text-[10px] font-bold text-[#C96A32]">9 / 10 passed</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2E2238]">
            <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-[#C96A32] to-[#C96A32] transition-all duration-700"/>
          </div>
          <div className="mt-2 flex justify-between mono text-[9px] text-[#AAA2B5]">
            <span>1 topic remaining</span>
            <span className="font-semibold text-[#C96A32]">IN PROGRESS</span>
          </div>
        </div>

        <div className="rounded-md border border-[#2E2238] bg-[#0B0A0F] p-4">
          <div className="flex items-center justify-between">
            <span className="mono text-[10px] text-[#AAA2B5]">PHASE 2</span>
            <span className="mono text-[10px] font-bold text-[#C96A32]">READY TO PRACTICE</span>
          </div>
          <div className="mt-2 text-[12px] font-semibold text-[#F5EFE6]">Find + fix the bug</div>
          <p className="mt-1 text-[10px] leading-4 text-[#AAA2B5]">Read code written by others, build a case, and earn XP for independent fixes.</p>
          <Link href="/arena" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#C96A32]">
            Enter Debug Arena <ChevronRight size={12}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BugIcon(props: {size?: number; className?: string}) { return <CircleAlert {...props}/>; }

function SectionTitle({label, link}:{label:string; link:string}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="display text-[18px] font-semibold text-[#F5EFE6]">{label}</h2>
      <Link href={link} className="text-[11px] font-semibold text-[#C96A32]">View all →</Link>
    </div>
  );
}

function ChallengeRow({challenge: c}:{challenge: typeof challenges[number]}) {
  return (
    <Link
      href={`/arena?challenge=${c.id}`}
      className="group flex items-center gap-3 rounded-[10px] border border-[#2E2238] bg-[#17121C] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#C96A32] hover:shadow-md"
    >
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[#C96A32]/15 text-[#C96A32] transition-all group-hover:bg-[#C96A32] group-hover:text-[#F5EFE6]">
        <Code2 size={16}/>
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold text-[#F5EFE6]">{c.title}</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {badge(c.difficulty)}
          {badge(c.language)}
        </div>
      </div>
      <span className="hidden mono text-[10px] text-[#AAA2B5] sm:block">
        <strong className="text-[#C96A32]">+{c.xp}</strong> XP
      </span>
      <ChevronRight className="text-[#AAA2B5] transition-transform group-hover:translate-x-1 group-hover:text-[#C96A32]" size={15}/>
    </Link>
  );
}

function Arena() {
  const [hint, setHint] = useState(0);
  return (
    <>
      <PageHeading
        eyebrow="Workspace / debug arena"
        title="Find the line that changes the story."
        body="The Vanishing Index · Python · Off-by-one error"
        action={
          <div className="flex items-center gap-2">
            {badge('medium')}
            <span className="mono text-[10px] text-[#AAA2B5]">12 min target</span>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[8px] border border-[#C96A32]/40 bg-[#C96A32]/10 px-4 py-3 text-[11px] text-[#F5EFE6]">
        <Lightbulb size={14} className="text-[#C96A32]"/>
        <span><strong className="text-[#C96A32]">Objective:</strong> Diagnose why the average skips a reading. Think before you patch.</span>
        <span className="ml-auto mono text-[10px] font-bold text-[#C96A32]">STEP 2 / 5 · DETECT</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-[.62fr_1.55fr_.72fr]">
        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
          <div className="eyebrow text-[#C96A32]">Problem brief</div>
          <h2 className="display mt-3 text-[21px] font-semibold text-[#F5EFE6]">The Vanishing Index</h2>
          <p className="mt-3 text-[12px] leading-5 text-[#AAA2B5]">A function should return the average of all readings. It runs without errors for some inputs, but the result is unexpectedly low.</p>
          <div className="mt-5 space-y-3 border-t border-[#2E2238] pt-4 text-[11px]">
            <div className="flex justify-between"><span className="text-[#AAA2B5]">Input</span><span className="mono font-semibold text-[#F5EFE6]">[18, 20, 22, 21]</span></div>
            <div className="flex justify-between"><span className="text-[#AAA2B5]">Expected</span><span className="mono font-bold text-[#4ADE80]">20.25</span></div>
            <div className="flex justify-between"><span className="text-[#AAA2B5]">Observed</span><span className="mono font-bold text-[#EF4444]">20.00</span></div>
          </div>
          <div className="mt-6 rounded-md bg-[#0B0A0F] border border-[#2E2238] p-3 text-[11px] leading-5 text-[#AAA2B5]">
            Read the code, select the suspicious line, then run it. The answer stays hidden until you build a case.
          </div>
        </div>
        <CodeEditor/>
        <AnalysisPanel onHint={setHint}/>
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] text-[#AAA2B5]">
        <span className="mono">{hint > 0 ? `Hint ${hint} active` : 'No hints used'} · Progress is saved locally for this demo</span>
        <button onClick={() => toast.success('Challenge marked for later.')} className="font-semibold text-[#C96A32]">Save for later</button>
      </div>
    </>
  );
}

function ChallengesPage() {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const filtered = useMemo(() => challenges.filter(c => (difficulty === 'All' || c.difficulty === difficulty) && `${c.title} ${c.summary} ${c.bugType}`.toLowerCase().includes(query.toLowerCase())), [query, difficulty]);

  return (
    <>
      <PageHeading
        eyebrow="Library / challenges"
        title="Choose your next bug."
        body="Small, focused investigations across languages and bug categories. Every challenge ends with an explanation, not just a result."
        action={<div className="mono text-[10px] text-[#AAA2B5]">{filtered.length} of {challenges.length} visible</div>}
      />

      <div className="mb-5 flex flex-col gap-3 rounded-[12px] border border-[#2E2238] bg-[#17121C] p-3 sm:flex-row shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-[#2E2238] bg-[#0B0A0F] px-3">
          <Search size={15} className="text-[#AAA2B5]"/>
          <input
            aria-label="Search challenges"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, bug, or concept"
            className="w-full bg-transparent py-2 text-[12px] text-[#F5EFE6] outline-none placeholder:text-[#AAA2B5]"
          />
        </div>

        <div className="flex items-center gap-2">
          <ListFilter size={14} className="text-[#AAA2B5]"/>
          {['All', 'Easy', 'Medium', 'Hard', 'Expert'].map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all ${difficulty === d ? 'bg-[#C96A32]/20 text-[#C9A7FF] border border-[#C96A32]' : 'text-[#AAA2B5] hover:bg-[#211827]'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(c => (
          <div key={c.id} className="group flex min-h-[220px] flex-col rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 transition-all hover:-translate-y-0.5 hover:border-[#C96A32] shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-md ${c.completed ? 'bg-[#22C55E]/15 text-[#4ADE80]' : 'bg-[#C96A32]/15 text-[#C96A32]'}`}>
                {c.completed ? <Check size={16}/> : <Code2 size={16}/>}
              </span>
              {badge(c.difficulty)}
            </div>

            <h3 className="display mt-5 text-[20px] font-semibold text-[#F5EFE6]">{c.title}</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#AAA2B5]">{c.summary}</p>

            <div className="mt-auto flex items-center justify-between border-t border-[#2E2238] pt-4">
              <div className="flex gap-2">
                {badge(c.language)}
                {badge(c.bugType)}
              </div>
              <Link href={`/arena?challenge=${c.id}`} className="text-[11px] font-semibold text-[#C96A32]">
                {c.completed ? 'Review' : 'Inspect'} <ArrowRight className="ml-1 inline" size={12}/>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length && (
        <div className="rounded-[12px] border border-dashed border-[#2E2238] p-12 text-center bg-[#17121C]">
          <Filter className="mx-auto text-[#AAA2B5]" size={24}/>
          <p className="mt-3 text-sm text-[#AAA2B5]">No challenges match that signal.</p>
        </div>
      )}
    </>
  );
}

function ProgressPage() {
  return (
    <>
      <TopicProgress />
      <PageHeading
        eyebrow="Workspace / progress"
        title="Make improvement visible."
        body="Your accuracy is a practice signal—not a score to chase. Watch the categories where explanation is still catching up."
        action={
          <div className="flex items-center gap-2">
            {badge('CYBER DEBUG LAB', 'blue')}
            <span className="mono text-[10px] text-[#AAA2B5]">Diagnostic engine active</span>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="XP progression" value="2,450" note="+320 this period" icon={Zap} tone="orange" />
        <Stat label="Debugging accuracy" value="82%" note="+4.6% this period" icon={Target} tone="green" />
        <Stat label="Bugs solved" value="137" note="8 this period" icon={BugIcon} tone="coral" />
        <Stat label="Average debug time" value="4m 32s" note="18s faster" icon={Clock3} tone="orange" />
      </div>

      <div className="mt-7 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
          <XpProgressionChart />
        </div>

        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#2E2238] pb-3">
            <div>
              <div className="eyebrow text-[#C96A32]">Category performance</div>
              <h3 className="display mt-1 text-[16px] font-semibold text-[#F5EFE6]">Mastery by error pattern</h3>
            </div>
            <span className="mono text-[10px] font-bold text-[#C96A32]">ACCURACY TRACE</span>
          </div>

          <div className="mt-5 space-y-5">
            {[
              ['Logic errors', '88%', '#4ADE80', 'Strong mastery', '+3.2%'],
              ['Runtime errors', '74%', '#C96A32', 'Active practice', '+1.8%'],
              ['Off-by-one', '69%', '#C96A32', 'Needs focus', '-0.5%'],
              ['Type errors', '52%', '#EF4444', 'Weak area', '-2.1%'],
            ].map(([name, v, color, label, trend]) => (
              <div key={name} className="group">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-[#F5EFE6]">{name}</span>
                    <span className="mono text-[9px] text-[#AAA2B5]">({label})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] text-[#AAA2B5]">{trend}</span>
                    <span className="mono font-bold text-[#F5EFE6]">{v}</span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#0B0A0F] border border-[#2E2238] p-0.5">
                  <div
                    style={{ width: v, backgroundColor: color }}
                    className="h-full rounded-full transition-all duration-700 ease-out"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TopicProgress() {
  return (
    <div className="mb-7 rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow text-[#C96A32]">Phase 1 / topic progress</div>
          <h2 className="display mt-2 text-[21px] font-semibold text-[#F5EFE6]">Master every required concept.</h2>
          <p className="mt-1 text-[11px] text-[#AAA2B5]">One successful problem in each topic unlocks Phase 2.</p>
        </div>
        <span className="mono text-[10px] font-bold text-[#C96A32]">9 / 10 passed</span>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {phaseOneTopics.map((topic) => {
          const isPassed = topic.completed;
          const isWeak = !isPassed && topic.accuracy < 70;

          const cardClass = isPassed
            ? 'border-[#22C55E]/40 bg-[#22C55E]/15 text-[#F5EFE6]'
            : isWeak
            ? 'border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F5EFE6]'
            : 'border-[#C96A32]/40 bg-[#C96A32]/15 text-[#F5EFE6]';

          const badgeColor = isPassed ? 'text-[#4ADE80]' : isWeak ? 'text-[#EF4444]' : 'text-[#C96A32]';
          const barColor = isPassed ? 'bg-[#4ADE80]' : isWeak ? 'bg-[#EF4444]' : 'bg-[#C96A32]';

          return (
            <div
              key={topic.name}
              className={`rounded-md border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${cardClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">{topic.name}</span>
                <span className={`mono text-[9px] font-bold ${badgeColor}`}>{isPassed ? '✓' : `${topic.accuracy}%`}</span>
              </div>
              <div className="mt-2 text-[9px] text-[#AAA2B5]">
                {topic.problems} problems · {topic.mistakes === 'None' ? 'clean signal' : topic.mistakes}
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#0B0A0F] border border-[#2E2238]">
                <div style={{ width: `${topic.accuracy}%` }} className={`h-full rounded-full ${barColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LearnPage() {
  const [active, setActive] = useState(learningTopics[0]);

  return (
    <>
      <PageHeading
        eyebrow="Library / learn"
        title="Study the why."
        body="Short lessons that turn debugging patterns into reusable mental models."
      />

      <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <div className="space-y-2">
          {learningTopics.map(topic => (
            <button
              key={topic.title}
              onClick={() => setActive(topic)}
              className={`w-full rounded-[10px] border p-4 text-left transition-colors ${active.title === topic.title ? 'border-[#C96A32] bg-[#C96A32]/15' : 'border-[#2E2238] bg-[#17121C] hover:bg-[#211827]'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-md ${active.title === topic.title ? 'bg-[#C96A32] text-[#F5EFE6]' : 'bg-[#211827] text-[#C96A32]'}`}>
                  <BookOpen size={15}/>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-[#F5EFE6]">{topic.title}</span>
                  <span className="mt-1 block text-[10px] text-[#AAA2B5]">{topic.level} · {topic.duration}</span>
                </span>
                <span className="mono text-[10px] font-bold text-[#C96A32]">{topic.progress}%</span>
              </div>
              <div className="mt-3 h-1 rounded bg-[#2E2238]">
                <div style={{width: `${topic.progress}%`}} className="h-full rounded bg-[#C96A32]"/>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-6 sm:p-8 shadow-sm">
          <div className="eyebrow text-[#C96A32]">Lesson / {active.level}</div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="display text-[30px] font-semibold tracking-[-.05em] text-[#F5EFE6]">{active.title}</h2>
              <p className="mt-3 max-w-[610px] text-[13px] leading-6 text-[#AAA2B5]">{active.description}</p>
            </div>
            <span className="hidden rounded-full border border-[#C96A32]/40 bg-[#C96A32]/15 px-3 py-1 mono text-[10px] font-bold text-[#C96A32] sm:block">
              {active.progress}% read
            </span>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-[#2E2238] bg-[#0B0A0F] p-4">
              <div className="eyebrow text-[#C96A32]">Mental model</div>
              <p className="mt-3 text-[13px] leading-6 text-[#F5EFE6]">
                A stack trace is not a verdict. It is a map. Start at the failure, then walk backward through the calls until the behavior becomes explainable.
              </p>
            </div>

            <div className="rounded-md border border-[#2E2238] bg-[#0B0A0F] p-4 text-[#F5EFE6]">
              <div className="eyebrow text-[#C9A7FF]">Try it in code</div>
              <div className="mt-3 mono text-[11px] leading-6">
                trace = ["main", "parse", "read"]<br/>
                <span className="text-[#AAA2B5]"># read from failure → cause</span><br/>
                <span className="text-[#C96A32]">print</span>(trace[-1])
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.success('Lesson marked as reviewed.')}
            className="btn-primary rounded-md mt-7 inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold shadow-sm"
          >
            Mark lesson reviewed <Check size={13}/>
          </button>
        </div>
      </div>
    </>
  );
}

function LeaderboardPage() {
  const [tab, setTab] = useState('XP');

  return (
    <>
      <PageHeading
        eyebrow="Community / leaderboard"
        title="Compare practice, not noise."
        body="A calm view of consistent debugging work across the CodeSight community."
        action={
          <div className="flex rounded-md border border-[#2E2238] bg-[#0B0A0F] p-1">
            {['XP', 'Bugs fixed', 'Accuracy'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded px-3 py-1.5 text-[10px] font-semibold transition-all ${tab === t ? 'bg-[#C96A32]/20 text-[#C9A7FF] border border-[#C96A32]' : 'text-[#AAA2B5]'}`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      <div className="overflow-hidden rounded-[12px] border border-[#2E2238] bg-[#17121C] shadow-sm">
        <div className="grid grid-cols-[48px_1fr_100px_100px_90px] gap-3 border-b border-[#2E2238] bg-[#0B0A0F] px-5 py-3 mono text-[9px] uppercase tracking-[.12em] text-[#AAA2B5]">
          <span>#</span>
          <span>Developer</span>
          <span>XP</span>
          <span>Bugs fixed</span>
          <span>Accuracy</span>
        </div>

        {leaderboard.map(row => (
          <div
            key={row.rank}
            className={`grid grid-cols-[48px_1fr_100px_100px_90px] items-center gap-3 border-b border-[#2E2238] px-5 py-4 text-[12px] last:border-0 ${row.name === 'You' ? 'bg-[#C96A32]/10' : 'hover:bg-[#211827]'}`}
          >
            <span className={`mono font-bold ${row.rank < 4 ? 'text-[#C96A32]' : 'text-[#AAA2B5]'}`}>
              {String(row.rank).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#C96A32]/40 bg-[#C96A32]/15 text-[10px] font-semibold text-[#C96A32]">
                {row.name.split(' ').map(n => n[0]).join('')}
              </span>
              <span>
                <span className="block font-medium text-[#F5EFE6]">{row.name}</span>
                <span className="mono text-[9px] text-[#AAA2B5]">{row.handle}</span>
              </span>
            </div>
            <span className="mono font-bold text-[#C96A32]">{row.xp.toLocaleString()}</span>
            <span className="mono text-[#AAA2B5]">{row.bugs}</span>
            <span className="mono font-semibold text-[#C96A32]">{row.accuracy}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <PageHeading
        eyebrow="Account / profile"
        title="Alex Morgan"
        body="Your debugging profile, practice history, and the habits you are making visible."
        action={
          <button
            onClick={() => toast('Profile editing is a frontend placeholder for the next backend phase.')}
            className="rounded-md border border-[#2E2238] px-3.5 py-2 text-[11px] font-semibold text-[#AAA2B5] hover:bg-[#211827]"
          >
            Edit profile
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-[#C96A32]/40 bg-[#C96A32]/15 text-lg font-bold text-[#C96A32]">
              AM
            </span>
            <div>
              <h2 className="display text-[23px] font-semibold text-[#F5EFE6]">Alex Morgan</h2>
              <div className="mono mt-1 text-[10px] text-[#AAA2B5]">@alexm · Level 12</div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {[
              ['2,450', 'XP'],
              ['137', 'Bugs fixed'],
              ['82%', 'Accuracy'],
              ['3 days', 'Streak']
            ].map(([v, l]) => (
              <div key={l} className="rounded-md border border-[#2E2238] bg-[#0B0A0F] p-3.5">
                <div className="display text-[21px] font-bold text-[#C96A32]">{v}</div>
                <div className="mt-1 text-[10px] text-[#AAA2B5]">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle label="Achievements" link="/profile"/>
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map(a => {
              const bgTone =
                a.title === 'First Fix' || a.title === 'Perfect Fix' ? 'border-[#22C55E]/40 bg-[#22C55E]/15' :
                a.title === 'Bug Hunter' || a.title === 'Master Debugger' ? 'border-[#C96A32]/40 bg-[#C96A32]/15' :
                a.title === 'Logic Detective' ? 'border-[#C9A7FF]/40 bg-[#C9A7FF]/15' : 'border-[#C96A32]/40 bg-[#C96A32]/15';

              const iconTone =
                a.title === 'First Fix' || a.title === 'Perfect Fix' ? 'text-[#4ADE80]' :
                a.title === 'Bug Hunter' || a.title === 'Master Debugger' ? 'text-[#C96A32]' :
                a.title === 'Logic Detective' ? 'text-[#C9A7FF]' : 'text-[#C96A32]';

              return (
                <div key={a.title} className={`rounded-[10px] border p-4 shadow-sm ${a.earned ? bgTone : 'border-[#2E2238] bg-[#17121C]'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-md ${a.earned ? iconTone : 'bg-[#211827] text-[#AAA2B5]'}`}>
                      {a.earned ? <Sparkles size={16}/> : <LockKeyhole size={14}/>}
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#F5EFE6]">{a.title}</div>
                      <div className="mt-1 text-[10px] text-[#AAA2B5]">{a.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function WriteLab() {
  const [language, setLanguage] = useState('Python');
  const [topic, setTopic] = useState('Loops');
  const [difficulty, setDifficulty] = useState('Medium');
  const [submitted, setSubmitted] = useState(false);
  const [ran, setRan] = useState(false);
  const [code, setCode] = useState(phaseOneProblems[0].starterCode);

  const problem = getPhaseOneProblem(language, topic, difficulty) || phaseOneProblems.find(p => p.language === language && p.topic === topic) || phaseOneProblems[0];
  const recommendations = getPhaseOneRecommendations(language, topic);

  useEffect(() => { setCode(problem.starterCode); setSubmitted(false); setRan(false); }, [problem.id]);

  const completedTopics = phaseOneTopics.filter(t => t.completed).length;
  const phaseComplete = completedTopics === phaseOneTopics.length;
  const submit = () => { setSubmitted(true); toast.success('Code analyzed — review the evidence below.'); };

  return (
    <>
      <PageHeading
        eyebrow="Phase 1 / write lab"
        title="Write code. Learn from the failure."
        body="Choose a language, topic, and difficulty. Solve the problem yourself, then use CodeSight’s analysis to turn mistakes into a learning path."
        action={
          <div className="flex items-center gap-2">
            {badge('PHASE 1', 'blue')}
            <span className="mono text-[10px] text-[#AAA2B5]">{completedTopics}/{phaseOneTopics.length} topics complete</span>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-[10px] border border-[#C96A32]/40 bg-[#C96A32]/10 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#C96A32] text-[#F5EFE6]">
            <Code2 size={14}/>
          </span>
          <div>
            <div className="eyebrow text-[#C96A32]">Write → Run → Submit → Understand</div>
            <div className="mt-1 text-[11px] text-[#F5EFE6]">Phase 1 builds the foundation required to enter the Debug Arena.</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-[#AAA2B5]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C96A32]"/>
          {phaseComplete ? 'Phase 2 unlocked' : 'Phase 2 locked until every topic is passed'}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.7fr_1.3fr_.76fr]">
        <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
          <div className="eyebrow text-[#C96A32]">Configure your problem</div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#AAA2B5]">Language</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full rounded-md border border-[#2E2238] bg-[#0B0A0F] px-3 py-2.5 text-[12px] text-[#F5EFE6] outline-none focus:border-[#C96A32]"
              >
                {phaseOneLanguages.map(option => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#AAA2B5]">Topic</span>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full rounded-md border border-[#2E2238] bg-[#0B0A0F] px-3 py-2.5 text-[12px] text-[#F5EFE6] outline-none focus:border-[#C96A32]"
              >
                {['Variables','Conditions','Loops','Functions','Lists','Dictionaries','OOP','Recursion','Error Handling'].map(option => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#AAA2B5]">Difficulty</span>
                {badge(difficulty)}
              </div>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full rounded-md border border-[#2E2238] bg-[#0B0A0F] px-3 py-2.5 text-[12px] text-[#F5EFE6] outline-none focus:border-[#C96A32]"
              >
                {['Easy','Medium','Hard','Expert'].map(option => <option key={option}>{option}</option>)}
              </select>
            </label>

            <div className="border-t border-[#2E2238] pt-4">
              <div className="eyebrow text-[#C96A32]">Required topics</div>
              <div className="mt-3 space-y-2">
                {phaseOneTopics.map(t => (
                  <div key={t.name} className="flex items-center gap-2 text-[11px]">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${t.completed ? 'bg-[#22C55E] text-[#FFFFFF]' : 'bg-[#EF4444] text-[#FFFFFF]'}`}>
                      {t.completed ? <Check size={10}/> : <span className="text-[10px] font-bold">!</span>}
                    </span>
                    <span className={t.completed ? 'text-[#AAA2B5]' : 'text-[#EF4444] font-semibold'}>{t.name}</span>
                    <span className="ml-auto mono text-[9px] text-[#AAA2B5]">{t.completed ? 'passed' : `${t.accuracy}%`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[#2E2238] bg-[#17121C] shadow-sm">
          <div className="border-b border-[#2E2238] bg-[#0B0A0F] px-5 py-4">
            <div className="eyebrow text-[#C96A32]">Problem / {problem.topic}</div>
            <h2 className="display mt-2 text-[23px] font-semibold text-[#F5EFE6]">{problem.title}</h2>
            <p className="mt-2 max-w-[680px] text-[12px] leading-5 text-[#AAA2B5]">{problem.prompt}</p>
          </div>

          <div className="border-b border-[#2E2238] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[10px] text-[#AAA2B5]">solution.{language.toLowerCase().replace('+','-')}</span>
              {badge(difficulty)}
            </div>

            <div className="mt-2 grid grid-cols-[38px_1fr] rounded-md border border-[#2E2238] bg-[#0B0A0F] py-3 mono text-[12px] leading-7 text-[#F5EFE6]">
              <div className="select-none border-r border-[#2E2238] pr-3 text-right text-[#AAA2B5]">
                {code.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
              </div>
              <textarea
                aria-label="Write your solution"
                value={code}
                onChange={e => { setCode(e.target.value); setSubmitted(false); }}
                spellCheck={false}
                className="min-h-[230px] resize-y bg-transparent px-3 text-[#F5EFE6] outline-none placeholder:text-[#AAA2B5]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2238] bg-[#0B0A0F] px-4 py-3">
            <span className="mono text-[10px] text-[#AAA2B5]">
              {ran ? 'Tests complete · 1 failing case' : 'Run tests before submitting your code.'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setRan(true); toast('Tests complete — inspect the failing case.'); }}
                className="rounded-md border border-[#2E2238] px-3 py-2 text-[10px] font-semibold text-[#F5EFE6] hover:bg-[#211827] inline-flex items-center gap-1.5"
              >
                <Play size={12}/> Run code
              </button>
              <button
                onClick={submit}
                className="btn-primary rounded-md px-3.5 py-2 text-[10px] font-bold inline-flex items-center gap-1.5"
              >
                <SendIcon/> Submit code
              </button>
            </div>
          </div>

          {submitted && (
            <div className="animate-rise border-t border-[#EF4444]/40 bg-[#EF4444]/10 p-5">
              <div className="flex items-center gap-2">
                <CircleAlert size={15} className="text-[#EF4444]"/>
                <span className="eyebrow text-[#EF4444]">Bug detected · personalized analysis</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 text-[#F5EFE6]">
                <div><div className="mono text-[10px] text-[#AAA2B5]">CONCEPT</div><div className="mt-1 text-[13px] font-semibold">{problem.concept}</div></div>
                <div><div className="mono text-[10px] text-[#AAA2B5]">MISTAKE</div><div className="mt-1 text-[13px] font-semibold text-[#EF4444]">{problem.analysis.type}</div></div>
                <div><div className="mono text-[10px] text-[#AAA2B5]">LOCATION</div><div className="mt-1 text-[13px] font-semibold">{problem.analysis.location}</div></div>
                <div><div className="mono text-[10px] text-[#AAA2B5]">WHY</div><div className="mt-1 text-[12px] leading-5 text-[#AAA2B5]">{problem.analysis.why}</div></div>
              </div>
              <div className="mt-4 rounded-md border border-[#EF4444]/40 bg-[#17121C] p-3.5 text-[11px] leading-5 text-[#F5EFE6]">
                <strong className="text-[#EF4444]">Suggestion:</strong> {problem.analysis.suggestion}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
            <div className="eyebrow text-[#C96A32]">Personalized next steps</div>
            <p className="mt-2 text-[12px] leading-5 text-[#AAA2B5]">
              Based on your current weak concept: <strong className="text-[#F5EFE6]">{problem.concept}</strong>
            </p>
            <div className="mt-4 space-y-2">
              {recommendations.map(rec => (
                <div key={rec.title} className="rounded-md border border-[#2E2238] bg-[#0B0A0F] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[11px] font-semibold text-[#F5EFE6]">{rec.title}</div>
                    {badge(rec.type, rec.type === 'lesson' ? 'blue' : 'slate')}
                  </div>
                  <div className="mt-1 text-[10px] leading-4 text-[#AAA2B5]">{rec.detail}</div>
                  <div className="mt-2 mono text-[9px] font-semibold text-[#C96A32]">{rec.duration} · {rec.type === 'reference' ? 'API-ready resource slot' : 'Open resource'}</div>
                  <ResourceAction resource={rec}/>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
            <div className="eyebrow text-[#C96A32]">Phase 1 gate</div>
            <div className="mt-3 flex items-end justify-between">
              <span className="display text-[25px] font-semibold text-[#F5EFE6]">{completedTopics} / {phaseOneTopics.length}</span>
              <span className="mono text-[10px] font-bold text-[#C96A32]">{phaseComplete ? 'UNLOCKED' : 'IN PROGRESS'}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#2E2238]">
              <div style={{width: `${(completedTopics/phaseOneTopics.length)*100}%`}} className="h-full rounded-full bg-[#C96A32]"/>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#AAA2B5]">Complete one successful problem in every required topic before Phase 2 becomes available.</p>
            {phaseComplete ? (
              <Link href="/arena" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#C96A32]">
                Enter Debug Arena <ArrowRight size={13}/>
              </Link>
            ) : (
              <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#C96A32]">
                <LockKeyhole size={13}/> OOP remains to be mastered
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ResourceAction({resource}:{resource: PhaseOneResource}) {
  if (resource.type === 'video' && resource.url) return <a href={resource.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#C96A32]">Open resource <ArrowRight size={12}/></a>;
  if (resource.route) return <Link href={resource.route} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#C96A32]">Open resource <ArrowRight size={12}/></Link>;
  return <span className="mt-3 block text-[10px] text-[#AAA2B5]">No learning resources available yet.</span>;
}

function SendIcon() { return <span className="inline-block rotate-[-8deg]">↑</span>; }

function DashboardWrapper() {
  return <HomeDashboard />;
}

function Router({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [, setLocation] = useLocation();
  const [activeProblem, setActiveProblem] = useState<PhaseOneProblem | null>(null);
  const [activeMode, setActiveMode] = useState<'student' | 'engineer'>('student');
  const [activeResults, setActiveResults] = useState<any | null>(null);
  const [showExam, setShowExam] = useState(false);
  const [learnDefect, setLearnDefect] = useState<string | undefined>(undefined);

  const handleSelectProblem = (prob: PhaseOneProblem, mode: 'student' | 'engineer') => {
    setActiveResults(null);
    setActiveMode(mode);
    setActiveProblem(prob);
  };

  if (showExam) {
    return <PromotionExamModal onClose={() => setShowExam(false)} />;
  }

  if (activeResults) {
    return (
      <ResultsPage
        results={activeResults}
        onNext={() => {
          const idx = phaseOneProblems.findIndex(p => p.id === activeResults.problemId);
          const nextProb = phaseOneProblems[(idx + 1) % phaseOneProblems.length];
          setActiveResults(null);
          setActiveProblem(nextProb);
        }}
        onLearn={(defect) => {
          setActiveResults(null);
          setActiveProblem(null);
          setLearnDefect(defect);
          window.location.hash = '/learn';
        }}
        onHome={() => {
          setActiveResults(null);
          setActiveProblem(null);
        }}
      />
    );
  }

  if (activeProblem) {
    return (
      <PracticeWorkspace
        problem={activeProblem}
        mode={activeMode}
        onBack={() => setActiveProblem(null)}
        onViewResults={(res) => setActiveResults(res)}
      />
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/intro" component={Home}/>
      <Route path="/auth" component={Home}/>
      <Route path="/login" component={Home}/>
      <Route path="/register" component={Home}/>
      <Route path="/home">{() => <HomeDashboard onSelectProblem={handleSelectProblem} />}</Route>
      <Route path="/dashboard">{() => <HomeDashboard onSelectProblem={handleSelectProblem} />}</Route>
      <Route path="/student">{() => <BestsellersBookShowcase />}</Route>
      <Route path="/levels">{() => <BestsellersBookShowcase />}</Route>
      <Route path="/student/level-select">{() => <BestsellersBookShowcase />}</Route>
      <Route path="/pro/level-select">{() => <BestsellersBookShowcase />}</Route>
      <Route path="/student/beginner">
        <ProblemsPage onSelectProblem={handleSelectProblem} levelTitle="BEGINNER" />
      </Route>
      <Route path="/student/intermediate">
        <ProblemsPage onSelectProblem={handleSelectProblem} levelTitle="INTERMEDIATE" />
      </Route>
      <Route path="/student/pro">
        <ProblemsPage onSelectProblem={handleSelectProblem} levelTitle="PRO" />
      </Route>
      <Route path="/problems">
        <ProblemsPage onSelectProblem={handleSelectProblem} levelTitle="BEGINNER" />
      </Route>
      <Route path="/practice">
        {() => {
          const prob = activeProblem || phaseOneProblems.find(p => p.title.includes('Safe User Profile Lookup')) || phaseOneProblems[0];
          return (
            <PracticeWorkspace
              problem={prob}
              mode={activeMode}
              onBack={() => {
                setActiveProblem(null);
                setLocation('/home');
              }}
              onViewResults={(res) => setActiveResults(res)}
            />
          );
        }}
      </Route>
      <Route path="/practice/:id">
        {() => {
          const prob = activeProblem || phaseOneProblems.find(p => p.title.includes('Safe User Profile Lookup')) || phaseOneProblems[0];
          return (
            <PracticeWorkspace
              problem={prob}
              mode={activeMode}
              onBack={() => {
                setActiveProblem(null);
                setLocation('/home');
              }}
              onViewResults={(res) => setActiveResults(res)}
            />
          );
        }}
      </Route>
      <Route path="/contest" component={BattlePage}/>
      <Route path="/arena" component={BattlePage}/>
      <Route path="/ai-engineer" component={CodeReviewPage}/>
      <Route path="/code-review" component={CodeReviewPage}/>
      <Route path="/code-xray" component={CodeXRayPage}/>
      <Route path="/false-positive" component={FalsePositivePage}/>
      <Route path="/admin" component={AdminPage}/>
      <Route path="/write" component={WriteLab}/>
      <Route path="/challenges" component={ChallengesPage}/>
      <Route path="/learn">
        <ConceptLearnPage initialDefect={learnDefect} />
      </Route>
      <Route path="/progress" component={ProgressPage}/>
      <Route path="/leaderboard" component={LeaderboardPage}/>
      <Route path="/profile">
        <EnhancedProfilePage
          onTakeExam={() => setShowExam(true)}
          onViewSubmissionResult={(sub) => setActiveResults(sub)}
        />
      </Route>
      <Route><NotFound/></Route>
    </Switch>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0B0A0F] p-6 text-center text-[#F5EFE6]">
      <div>
        <div className="eyebrow text-[#C96A32]">404 / signal lost</div>
        <h1 className="display mt-3 text-4xl font-semibold">This route is not in the trace.</h1>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-lg shadow-md">
          Return to workspace <ArrowRight size={14}/>
        </Link>
      </div>
    </div>
  );
}

function MainContent() {
  const [location, setLocation] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    if (location === '/login' || location === '/register') {
      setShowAuthModal(true);
    }
  }, [location]);

  return (
    <>
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setLocation('/dashboard');
          }}
        />
      )}
      <AppShell>
        <Router onOpenAuth={() => {
          setShowAuthModal(true);
          if (location !== '/login') setLocation('/login');
        }} />
      </AppShell>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TrackProvider>
          <ThemeProvider defaultTheme="dark">
            <SoundProvider>
              <TooltipProvider>
                <Toaster />
                <MainContent />
              </TooltipProvider>
            </SoundProvider>
          </ThemeProvider>
        </TrackProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
