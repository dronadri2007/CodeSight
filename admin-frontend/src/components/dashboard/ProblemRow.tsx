import React from 'react';
import { Problem } from '../../types';
import { Badge } from '../common/Badge';
import { Edit2, Trash2 } from 'lucide-react';

interface ProblemRowProps {
  problem: Problem;
  index: number;
  onEdit: (problem: Problem) => void;
  onDelete: (problem: Problem) => void;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  index,
  onEdit,
  onDelete,
}) => {
  // LeetCode Color Coding for Difficulty
  const difficultyColors = {
    Easy: 'text-[#00B8A3] bg-[#00B8A3]/10 border-[#00B8A3]/25',
    Medium: 'text-[#FFC01E] bg-[#FFC01E]/10 border-[#FFC01E]/25',
    Hard: 'text-[#FF375F] bg-[#FF375F]/10 border-[#FF375F]/25',
  };

  return (
    <tr className="border-b border-slate-200/70 dark:border-white/[0.04] hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
      
      {/* 1. Sequential Question Number (1, 2, 3...) */}
      <td className="py-3 px-4 w-36">
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-white/60">
          {index}
        </span>
      </td>

      {/* 2. Problem Title */}
      <td className="py-3 px-4">
        <span
          onClick={() => onEdit(problem)}
          className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-[#007AFF] transition-colors cursor-pointer"
        >
          {problem.title}
        </span>
      </td>

      {/* 3. Difficulty */}
      <td className="py-3 px-4 w-28">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
            difficultyColors[problem.difficulty]
          }`}
        >
          {problem.difficulty}
        </span>
      </td>

      {/* 4. Tags */}
      <td className="py-3 px-4 hidden xl:table-cell w-48">
        <div className="flex flex-wrap gap-1">
          {problem.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-white/60 font-medium"
            >
              {tag}
            </span>
          ))}
          {problem.tags.length > 2 && (
            <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono">+{problem.tags.length - 2}</span>
          )}
        </div>
      </td>

      {/* 5. Status Badge */}
      <td className="py-3 px-4 w-32">
        <Badge type="status" value={problem.status} />
      </td>

      {/* 6. Quick Actions */}
      <td className="py-3 px-4 text-right w-24">
        <div className="flex items-center justify-end space-x-1 sm:space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Edit */}
          <button
            onClick={() => onEdit(problem)}
            title="Edit Problem"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-all hover:scale-105"
          >
            <Edit2 size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(problem)}
            title="Delete Problem"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 border border-slate-200 dark:border-white/[0.08] hover:border-red-500/20 transition-all hover:scale-105"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};
