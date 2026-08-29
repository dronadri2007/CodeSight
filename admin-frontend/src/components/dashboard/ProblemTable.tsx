import React, { useState, useEffect } from 'react';
import { Problem } from '../../types';
import { ProblemRow } from './ProblemRow';
import { Inbox, ArrowDown } from 'lucide-react';

interface ProblemTableProps {
  problems: Problem[];
  loading: boolean;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
  onAddProblem: () => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  loading,
  onEdit,
  onDelete,
  onAddProblem,
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(100);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    setVisibleCount(100);
  }, [problems.length]);

  const displayedProblems = problems.slice(0, visibleCount);
  const hasMore = visibleCount < problems.length;

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 100);
      setIsLoadingMore(false);
    }, 250);
  };

  return (
    <div className="w-full space-y-4">
      {/* Table Container */}
      <div className="w-full rounded-2xl bg-white dark:bg-[#0F1016]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/40">
                <th className="py-3.5 px-4 w-36">Question Number</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4 w-28">Difficulty</th>
                <th className="py-3.5 px-4 hidden xl:table-cell w-48">Tags</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-white/40 text-xs">
                    <div className="inline-block w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading problems...</p>
                  </td>
                </tr>
              ) : displayedProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 dark:text-white/40">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                        <Inbox size={20} className="text-slate-400 dark:text-white/40" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-white/70">No coding challenges found matching criteria</p>
                      <button
                        onClick={onAddProblem}
                        className="text-xs text-[#007AFF] hover:underline font-semibold"
                      >
                        + Create a new problem
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedProblems.map((problem, idx) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    index={idx + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom State: Show More Button or 'No more problems to load' */}
      {!loading && problems.length > 0 && (
        <div className="w-full flex items-center justify-center pt-3 pb-8">
          {hasMore ? (
            <button
              onClick={handleShowMore}
              disabled={isLoadingMore}
              className="group relative flex items-center justify-center space-x-2 py-3 px-8 rounded-2xl bg-white dark:bg-[#12131A]/90 hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shadow-md dark:shadow-xl transition-all hover:border-[#007AFF]/50 hover:shadow-[0_0_25px_rgba(0,122,255,0.25)] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
                  <span>Loading next 100 problems...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Show More →</span>
                  <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform text-[#007AFF]" />
                </div>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-white/35 font-medium tracking-wide">
              No more problems to load
            </span>
          )}
        </div>
      )}
    </div>
  );
};
