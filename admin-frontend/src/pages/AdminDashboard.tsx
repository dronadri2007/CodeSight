import React, { useState } from 'react';
import { useProblems } from '../hooks/useProblems';
import { useTheme } from '../context/ThemeContext';
import { NavigationBar } from '../components/dashboard/NavigationBar';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ProblemTable } from '../components/dashboard/ProblemTable';
import { ProblemModal } from '../components/dashboard/ProblemModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { Problem } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const {
    problems,
    allProblems,
    loading,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedStatus,
    setSelectedStatus,
    createProblem,
    updateProblem,
    deleteProblem,
    refresh,
  } = useProblems();

  // Modal States
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingProblem(null);
    setIsProblemModalOpen(true);
  };

  const handleOpenEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setIsProblemModalOpen(true);
  };

  const handleSaveProblem = async (problemData: any) => {
    try {
      if (editingProblem) {
        await updateProblem(editingProblem.id, problemData);
        showToast(`Problem "${problemData.title}" updated successfully!`);
      } else {
        await createProblem(problemData);
        showToast(`Problem "${problemData.title}" created successfully!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save problem', 'error');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProblem) return;
    setIsDeleting(true);
    try {
      await deleteProblem(deletingProblem.id);
      showToast(`Problem "${deletingProblem.title}" removed.`);
      setDeletingProblem(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete problem', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#07080A] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-[#007AFF]/30 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Theme Background Images with Smooth Crossfade */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
        {/* Dark Themed Background Image */}
        <img
          src="/assets/dashboard-bg-dark.png"
          alt="Dark Background"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Light Themed Background Image */}
        <img
          src="/assets/dashboard-bg-light.png"
          alt="Light Background"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            !isDark ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Frosted glass backdrop overlay */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Clean Edge-to-Edge Navigation Bar */}
      <NavigationBar />

      {/* Main Full-Width Dashboard */}
      <main className="relative z-10 flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-10 py-6">
        
        {/* Compact Stats Grid (3 cards) */}
        <StatsOverview problems={allProblems} />

        {/* Filter Bar with Search, Dropdowns, and Create Problem CTA */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onRefresh={refresh}
          onAddProblem={handleOpenAdd}
          loading={loading}
        />

        {/* LeetCode Style Problem Repository Table */}
        <ProblemTable
          problems={problems}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={setDeletingProblem}
          onAddProblem={handleOpenAdd}
        />
      </main>

      {/* Modals */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSave={handleSaveProblem}
        initialData={editingProblem}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProblem}
        problem={deletingProblem}
        onClose={() => setDeletingProblem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

      {/* Action Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-2 py-3 px-4 rounded-xl shadow-2xl backdrop-blur-2xl border text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-[#00B8A3]/20 border-[#00B8A3]/40 text-[#00B8A3] bg-white/90 dark:bg-[#111218]/90'
                : 'bg-red-500/20 border-red-500/40 text-red-500 bg-white/90 dark:bg-[#111218]/90'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
