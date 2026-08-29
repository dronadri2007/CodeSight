import React from 'react';
import { Problem } from '../../types';
import { Layers, CheckCircle2, Clock } from 'lucide-react';

interface StatsOverviewProps {
  problems: Problem[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ problems }) => {
  const total = problems.length;
  const approved = problems.filter((p) => p.status === 'Approved').length;
  const pending = problems.filter((p) => p.status === 'Pending').length;

  const stats = [
    {
      label: 'Total Problems',
      value: total,
      icon: <Layers size={15} className="text-[#007AFF]" />,
      badge: 'Repository',
      color: 'from-[#007AFF]/10 to-transparent',
      borderColor: 'border-[#007AFF]/25 dark:border-[#007AFF]/25',
    },
    {
      label: 'Approved',
      value: approved,
      icon: <CheckCircle2 size={15} className="text-[#00B8A3]" />,
      badge: `${Math.round((approved / (total || 1)) * 100)}% Live`,
      color: 'from-[#00B8A3]/10 to-transparent',
      borderColor: 'border-[#00B8A3]/25 dark:border-[#00B8A3]/25',
    },
    {
      label: 'Pending Review',
      value: pending,
      icon: <Clock size={15} className="text-[#FFC01E]" />,
      badge: pending > 0 ? `${pending} Pending` : 'All Clear',
      color: 'from-[#FFC01E]/10 to-transparent',
      borderColor: 'border-[#FFC01E]/25 dark:border-[#FFC01E]/25',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.color} bg-white dark:bg-[#101116]/80 backdrop-blur-xl border border-slate-200/80 ${stat.borderColor} shadow-sm dark:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-white/50">
              {stat.label}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
              {stat.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              {stat.value}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-white/70 border border-slate-200 dark:border-white/[0.08]">
              {stat.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
