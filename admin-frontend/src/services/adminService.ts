import { Problem, AdminUser, DefectClass } from '../types';
import { INITIAL_PROBLEMS } from './mockData';
import { apiConfig, getAuthHeaders } from './api';

const STORAGE_KEY = 'codesight_admin_problems_v1';

// --- CodeSight backend (read-only corpus view) --------------------------
// The real backend has no admin auth and no exercise CRUD — exercises are
// committed JSON and review happens via scripts/review_exercises.py. When
// VITE_USE_MOCK_API=false we show the live corpus + review progress from
// GET /admin/exercises; create/update/delete/approve are not available.

interface AdminExerciseRow {
  id: string
  title: string
  defect_class: string
  difficulty: string
  difficulty_label: string
  source: string
  review_status: string
  status_label: string
  reports: number
  line_count: number
  hint_count: number
}

function rowToProblem(r: AdminExerciseRow): Problem {
  return {
    id: r.id,
    title: r.title,
    slug: r.id,
    difficulty: (r.difficulty_label as Problem['difficulty']) || 'Medium',
    defectClass: r.defect_class as DefectClass,
    tags: [r.defect_class, r.source, ...(r.reports ? [`${r.reports} report${r.reports > 1 ? 's' : ''}`] : [])],
    status: (r.status_label as Problem['status']) || 'Pending',
    statement: `Review exercise · ${r.line_count} lines · ${r.hint_count} hints · source: ${r.source}`,
    starterCode: {},
    optimalTimeComplexity: '-',
    optimalSpaceComplexity: '-',
    testCases: [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }
}

const NO_MUTATION =
  'Exercises are managed in the repo (app/data/*.json + scripts/review_exercises.py). This dashboard is read-only against the live backend.'

function getStoredProblems(): Problem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROBLEMS));
      return INITIAL_PROBLEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROBLEMS;
  }
}

function saveProblems(problems: Problem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

export const adminService = {
  // Admin login. The CodeSight backend has no auth, so this is a client-side
  // gate in every mode — any credentials mint a local token.
  async login(email: string, _password: string): Promise<{ token: string; user: AdminUser }> {
    await new Promise((res) => setTimeout(res, 400));
    const user: AdminUser = {
      id: 'usr_admin_001',
      name: (email.split('@')[0] || 'Admin').toUpperCase(),
      email,
      role: 'admin',
    };
    const token = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { token, user };
  },

  // Get all problems
  async getProblems(filters?: { search?: string; difficulty?: string; status?: string }): Promise<Problem[]> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 250));
      let list = getStoredProblems();
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.defectClass.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filters?.difficulty && filters.difficulty !== 'All') {
        list = list.filter((p) => p.difficulty.toLowerCase() === filters.difficulty?.toLowerCase());
      }
      if (filters?.status && filters.status !== 'All') {
        list = list.filter((p) => p.status.toLowerCase() === filters.status?.toLowerCase());
      }
      return list;
    }

    const res = await fetch(`${apiConfig.baseUrl}/admin/exercises?limit=2000`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch exercises (${res.status})`);
    const body = (await res.json()) as { exercises: AdminExerciseRow[] };
    return body.exercises.map(rowToProblem);
  },

  // Corpus + review-progress totals (GET /admin/stats).
  async getStats(): Promise<Record<string, unknown> | null> {
    if (apiConfig.useMock) return null;
    const res = await fetch(`${apiConfig.baseUrl}/admin/stats`, { headers: getAuthHeaders() });
    return res.ok ? res.json() : null;
  },

  // Create problem
  async createProblem(problemData: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 300));
      const list = getStoredProblems();
      const newProblem: Problem = {
        ...problemData,
        id: `CS-${100 + list.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProblems([newProblem, ...list]);
      return newProblem;
    }

    throw new Error(NO_MUTATION);
  },

  // Update problem
  async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 250));
      const list = getStoredProblems();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Problem not found');
      const updated: Problem = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      list[index] = updated;
      saveProblems(list);
      return updated;
    }

    throw new Error(NO_MUTATION);
  },

  // Delete problem
  async deleteProblem(id: string): Promise<boolean> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 250));
      const list = getStoredProblems().filter((p) => p.id !== id);
      saveProblems(list);
      return true;
    }

    throw new Error(NO_MUTATION);
  },

  // Approve problem
  async approveProblem(id: string): Promise<Problem> {
    if (apiConfig.useMock) {
      return this.updateProblem(id, { status: 'Approved' });
    }

    throw new Error(NO_MUTATION);
  },
};
