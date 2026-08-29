import { useState, useEffect, useCallback } from 'react';
import { Problem, Difficulty, ProblemStatus } from '../types';
import { adminService } from '../services/adminService';

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDefect, setSelectedDefect] = useState<string>('All');

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getProblems();
      setProblems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Actions
  const createProblem = async (data: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await adminService.createProblem(data);
    setProblems((prev) => [created, ...prev]);
    return created;
  };

  const updateProblem = async (id: string, updates: Partial<Problem>) => {
    const updated = await adminService.updateProblem(id, updates);
    setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProblem = async (id: string) => {
    await adminService.deleteProblem(id);
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const approveProblem = async (id: string) => {
    const approved = await adminService.approveProblem(id);
    setProblems((prev) => prev.map((p) => (p.id === id ? approved : p)));
    return approved;
  };

  // Filtered list
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      !searchQuery ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.defectClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesStatus =
      selectedStatus === 'All' ||
      problem.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesDefect =
      selectedDefect === 'All' ||
      problem.defectClass.toLowerCase() === selectedDefect.toLowerCase();

    return matchesSearch && matchesDifficulty && matchesStatus && matchesDefect;
  });

  return {
    problems: filteredProblems,
    allProblems: problems,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedStatus,
    setSelectedStatus,
    selectedDefect,
    setSelectedDefect,
    createProblem,
    updateProblem,
    deleteProblem,
    approveProblem,
    refresh: fetchProblems,
  };
}
