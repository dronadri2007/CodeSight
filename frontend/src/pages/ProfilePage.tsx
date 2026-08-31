import React from 'react';
import { Trophy, Flame, Zap, Award, ShieldAlert, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { useAuth, LEVEL_TIERS, DefectClass } from '@/contexts/AuthContext';

interface ProfilePageProps {
  onTakeExam: () => void;
  onViewSubmissionResult: (sub: any) => void;
}

export function ProfilePage({ onTakeExam, onViewSubmissionResult }: ProfilePageProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 animate-rise">
      {/* User Header Profile Card */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-[#C96A32] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="display text-2xl font-bold text-[#F5EFE6]">{user.name}</h1>
              <span className="mono text-xs text-[#AAA2B5]">{user.handle}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="badge-expert rounded px-2.5 py-0.5 mono text-[10px] font-bold uppercase">
                Tier {user.levelIndex + 1}: {user.level}
              </span>
            </div>
          </div>
        </div>

        {/* Action button to promote tier */}
        <button
          onClick={onTakeExam}
          className="btn-primary flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-bold shadow-md"
        >
          <Award size={16} /> Take Promotion Exam
        </button>
      </div>

      {/* Quick Metrics Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#AAA2B5]">
            <Trophy size={16} className="text-[#C96A32]" /> Total XP
          </div>
          <div className="display text-2xl font-bold mt-2 text-[#F5EFE6]">{user.xp.toLocaleString()}</div>
        </div>

        <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#AAA2B5]">
            <Award size={16} className="text-[#4ADE80]" /> Solved Count
          </div>
          <div className="display text-2xl font-bold mt-2 text-[#F5EFE6]">{user.solvedCount}</div>
        </div>

        <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#AAA2B5]">
            <Flame size={16} className="text-[#C96A32]" /> Current Streak
          </div>
          <div className="display text-2xl font-bold mt-2 text-[#F5EFE6]">{user.streakDays} Days</div>
        </div>

        <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#AAA2B5]">
            <Zap size={16} className="text-[#C9A7FF]" /> Global Rank
          </div>
          <div className="display text-2xl font-bold mt-2 text-[#F5EFE6]">#{user.globalRank}</div>
        </div>
      </div>

      {/* Six-Level Tier Progression */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E2238] pb-3">
          <div>
            <div className="eyebrow text-[#C96A32]">SIX-LEVEL PROGRESSION TRACK</div>
            <h2 className="display text-lg font-bold text-[#F5EFE6]">Developer Tier Journey</h2>
          </div>
          <span className="mono text-xs font-bold text-[#C96A32]">
            Exam Required for Promotion
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {LEVEL_TIERS.map((tierName, idx) => {
            const isCurrent = idx === user.levelIndex;
            const isUnlocked = idx <= user.levelIndex;

            return (
              <div
                key={tierName}
                className={`rounded-lg border p-3 text-center transition-all ${
                  isCurrent
                    ? 'border-[#C96A32] bg-[#211827] text-[#C96A32] shadow-md ring-2 ring-[#C96A32]/40'
                    : isUnlocked
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#4ADE80]'
                    : 'border-[#2E2238] bg-[#0B0A0F] text-[#AAA2B5] opacity-60'
                }`}
              >
                <div className="mono text-[9px] font-bold uppercase">Tier {idx + 1}</div>
                <div className="text-xs font-bold mt-1 leading-tight">{tierName}</div>
                <div className="mt-2 flex justify-center">
                  {isUnlocked ? (
                    <CheckCircle2 size={16} className={isCurrent ? 'text-[#C96A32]' : 'text-[#4ADE80]'} />
                  ) : (
                    <LockKeyhole size={16} className="text-[#AAA2B5]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Six-Class Weakness & Mastery System */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-4">
        <div className="border-b border-[#2E2238] pb-3">
          <div className="eyebrow text-[#C96A32]">DEFECT CLASS MASTERY TRACKING</div>
          <h2 className="display text-lg font-bold text-[#F5EFE6]">Defect Weakness Radar</h2>
          <p className="mt-1 text-xs text-[#AAA2B5]">Calculated as (Successful Optimizations / Total Attempts) * 100%.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {(Object.keys(user.defectStats) as DefectClass[]).map(defect => {
            const stat = user.defectStats[defect] || { successful: 0, total: 1 };
            const pct = stat.total > 0 ? Math.round((stat.successful / stat.total) * 100) : 0;
            const barColor = pct >= 80 ? 'bg-[#22C55E]' : pct >= 60 ? 'bg-[#C96A32]' : 'bg-[#EF4444]';

            return (
              <div key={defect} className="rounded-lg border border-[#2E2238] bg-[#0B0A0F] p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#F5EFE6]">{defect}</span>
                  <span className="mono font-bold text-[#C96A32]">{pct}% ({stat.successful}/{stat.total})</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#2E2238] overflow-hidden">
                  <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${barColor}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-4">
        <div className="border-b border-[#2E2238] pb-3">
          <div className="eyebrow text-[#C96A32]">SUBMISSION HISTORY</div>
          <h2 className="display text-lg font-bold text-[#F5EFE6]">Recent Submissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2E2238] bg-[#0B0A0F] font-mono text-[10px] text-[#AAA2B5] uppercase">
              <tr>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2238]">
              {user.history.map(sub => (
                <tr key={sub.id} className="hover:bg-[#211827]">
                  <td className="py-3 px-3 font-semibold text-[#F5EFE6]">{sub.title}</td>
                  <td className="py-3 px-3 font-mono text-[#AAA2B5] uppercase">{sub.mode}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#4ADE80]">{sub.score} / 100</td>
                  <td className="py-3 px-3 text-[#AAA2B5]">{sub.date}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onViewSubmissionResult(sub)}
                      className="btn-secondary text-[10px] font-bold px-2.5 py-1 rounded border border-[#2E2238] bg-[#211827] text-[#F5EFE6]"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
