import React from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (d: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  onRefresh: () => void;
  onAddProblem: () => void;
  loading: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  onRefresh,
  onAddProblem,
  loading,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
      
      {/* Search Input */}
      <div className="relative flex-1 max-w-xl">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/35" />
        <input
          type="text"
          placeholder="Search problems by title, tags, or question..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2.5 pl-9 pr-4 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#12131A]/90 border border-slate-200 dark:border-white/[0.09] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/30 transition-all font-sans shadow-sm dark:shadow-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white text-xs font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Dropdowns + Refresh + Create Problem Button */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Difficulty Select */}
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="py-2 px-3 rounded-xl text-xs font-medium bg-white dark:bg-[#14151D] border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:border-[#007AFF] cursor-pointer transition-colors shadow-sm dark:shadow-none"
        >
          <option value="All">Difficulty: All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status Select */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="py-2 px-3 rounded-xl text-xs font-medium bg-white dark:bg-[#14151D] border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:border-[#007AFF] cursor-pointer transition-colors shadow-sm dark:shadow-none"
        >
          <option value="All">Status: All</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Problems"
          className="p-2 rounded-xl bg-white dark:bg-[#14151D] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.09] transition-all disabled:opacity-50 shadow-sm dark:shadow-none"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Create Problem Button */}
        <button
          onClick={onAddProblem}
          className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#007AFF] to-[#0A84FF] hover:from-[#0A84FF] hover:to-[#0056B3] shadow-[0_4px_16px_rgba(0,122,255,0.35)] hover:shadow-[0_6px_22px_rgba(0,122,255,0.5)] transition-all active:scale-[0.98] border border-white/20 ml-1"
        >
          <Plus size={14} />
          <span>Create Problem</span>
        </button>

      </div>
    </div>
  );
};
