import React from 'react';
import { Link } from 'wouter';
import { useTrack } from '../contexts/TrackContext';
import { TactileTrackToggle } from '../components/animations/TactileTrackToggle';
import { LiquidMetalCTA } from '../components/animations/LiquidMetalCTA';
import { Shield, Zap, Target, Bug, ArrowRight, Award } from 'lucide-react';

export default function AIEngineerDashboard() {
  const { level } = useTrack();

  const defectTaxonomy = [
    { name: 'Injection / Input Validation', score: 90, color: '#17130F', count: '14 bugs fixed' },
    { name: 'Auth & Access Control', score: 75, color: '#403A32', count: '10 bugs fixed' },
    { name: 'Error & Exception Handling', score: 82, color: '#17130F', count: '12 bugs fixed' },
    { name: 'Concurrency & State', score: 65, color: '#746D61', count: '8 bugs fixed' },
    { name: 'Logic & Boundary', score: 88, color: '#17130F', count: '16 bugs fixed' },
    { name: 'Resource & Performance', score: 70, color: '#403A32', count: '9 bugs fixed' },
  ];

  return (
    <div className="space-y-8 pb-12 text-[#17130F]">
      {/* Header with Track Switcher */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#D8D0C0] pb-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#746D61]">
            <Zap size={14} className="text-[#17130F]" />
            <span>AI ENGINEER COMMAND CENTER</span>
          </div>
          <h1 className="mt-1 font-serif text-4xl font-extrabold text-[#17130F] sm:text-5xl">
            Review AI Code. Find Defects.
          </h1>
          <p className="mt-2 text-sm text-[#403A32] font-mono">
            Level: <strong className="uppercase text-[#17130F]">{level}</strong> · Audit codebases, run Code X-Ray diagnostic scans, and prevent false alarms.
          </p>
        </div>

        <TactileTrackToggle />
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#746D61]">
            <span className="text-xs uppercase font-bold">Review Skill Score</span>
            <Award size={18} className="text-[#17130F]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-extrabold text-[#17130F]">2,450 XP</div>
          <div className="mt-1 text-[11px] font-bold text-[#17130F]">+320 XP this week</div>
        </div>

        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#746D61]">
            <span className="text-xs uppercase font-bold">Catch Rate</span>
            <Target size={18} className="text-[#17130F]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-extrabold text-[#17130F]">88%</div>
          <div className="mt-1 text-[11px] text-[#746D61]">Top 5% precision</div>
        </div>

        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#746D61]">
            <span className="text-xs uppercase font-bold">False Positive Rate</span>
            <Shield size={18} className="text-[#17130F]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-extrabold text-[#17130F]">4.2%</div>
          <div className="mt-1 text-[11px] font-bold text-[#17130F]">Low noise threshold</div>
        </div>

        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#746D61]">
            <span className="text-xs uppercase font-bold">Active Cases</span>
            <Bug size={18} className="text-[#17130F]" />
          </div>
          <div className="mt-3 font-serif text-3xl font-extrabold text-[#17130F]">137</div>
          <div className="mt-1 text-[11px] text-[#746D61]">Cases closed</div>
        </div>
      </div>

      {/* Primary Action Launcher */}
      <div className="relative overflow-hidden rounded-xl border border-[#17130F] bg-[#F5F1E7] p-8 shadow-sm">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="rounded-full border border-[#17130F] bg-[#EDE7D7] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#17130F]">
              FEATURED WORKSPACE
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#17130F]">
              Code X-Ray Diagnostic Scanner
            </h2>
            <p className="mt-2 max-w-xl text-xs font-mono text-[#403A32]">
              Scan AI-generated repositories for hidden state corruption, race conditions, and boundary flaws.
            </p>
          </div>

          <Link href="/code-xray">
            <LiquidMetalCTA text="RUN CODE X-RAY" icon="zap" size="lg" />
          </Link>
        </div>
      </div>

      {/* 6 Defect Taxonomy Mastery Bars */}
      <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm font-mono">
        <div className="flex items-center justify-between border-b border-[#D8D0C0] pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#746D61]">
              THE 6 DEFECT CLASSES
            </div>
            <h3 className="mt-1 font-serif text-2xl font-bold text-[#17130F]">
              Defect Taxonomy Mastery
            </h3>
          </div>
          <span className="text-xs font-bold text-[#17130F]">OVERALL 82%</span>
        </div>

        <div className="mt-6 space-y-6">
          {defectTaxonomy.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17130F]">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#746D61]">{item.count}</span>
                  <span className="font-bold text-[#17130F]">{item.score}%</span>
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EDE7D7] border border-[#D8D0C0]">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-[#17130F]"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards to Workspaces */}
      <div className="grid gap-6 md:grid-cols-3 font-mono">
        <Link href="/code-review" className="group rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 transition-all hover:border-[#17130F] hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EDE7D7] text-[#17130F] group-hover:bg-[#17130F] group-hover:text-[#F8F5EC]">
            <Bug size={24} />
          </div>
          <h4 className="mt-4 font-serif text-2xl font-bold text-[#17130F]">Code Review</h4>
          <p className="mt-2 text-xs text-[#746D61]">Inspect AI code, select line numbers, and state findings with progressive hints.</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#17130F]">
            <span>OPEN WORKSPACE</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link href="/false-positive" className="group rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 transition-all hover:border-[#17130F] hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EDE7D7] text-[#17130F] group-hover:bg-[#17130F] group-hover:text-[#F8F5EC]">
            <Shield size={24} />
          </div>
          <h4 className="mt-4 font-serif text-2xl font-bold text-[#17130F]">False Positive Challenge</h4>
          <p className="mt-2 text-xs text-[#746D61]">Train restraint by submitting zero findings when code is clean and bug-free.</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#17130F]">
            <span>START CHALLENGE</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        <Link href="/arena" className="group rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 transition-all hover:border-[#17130F] hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EDE7D7] text-[#17130F] group-hover:bg-[#17130F] group-hover:text-[#F8F5EC]">
            <Zap size={24} />
          </div>
          <h4 className="mt-4 font-serif text-2xl font-bold text-[#17130F]">AI vs Human Review</h4>
          <p className="mt-2 text-xs text-[#746D61]">Pit your manual review skills against automated AI scanners in competitive battles.</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#17130F]">
            <span>ENTER ARENA</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
}
