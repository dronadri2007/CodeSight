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

// backend tier <-> dashboard difficulty
const TIER_TO_DIFF: Record<string, Problem['difficulty']> = { beginner: 'Easy', intermediate: 'Medium', pro: 'Hard' };
const DIFF_TO_TIER: Record<string, string> = { Easy: 'beginner', Medium: 'intermediate', Hard: 'pro' };
// dashboard status <-> backend review_status
const STATUS_TO_REVIEW: Record<string, string> = { Approved: 'approved', Pending: 'unreviewed', Draft: 'edited', Archived: 'rejected' };

export const adminService = {
  // POST /admin/login — the password is the shared ADMIN_PASSWORD (email is
  // display only). Mock mode keeps a client-only gate.
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const user: AdminUser = { id: 'usr_admin_001', name: (email.split('@')[0] || 'Admin').toUpperCase(), email, role: 'admin' };
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 300));
      return { token: `local_${Date.now()}`, user };
    }
    const res = await fetch(`${apiConfig.baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.status === 503) throw new Error('Admin API is disabled on the server (ADMIN_PASSWORD not set).');
    if (!res.ok) throw new Error('Wrong admin password.');
    const { token } = (await res.json()) as { token: string };
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

  // Full record incl. answers (GET /admin/exercises/{id}) — for the edit modal.
  async getExerciseDetail(id: string): Promise<Record<string, unknown> | null> {
    if (apiConfig.useMock) return null;
    const res = await fetch(`${apiConfig.baseUrl}/admin/exercises/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to load exercise (${res.status})`);
    return res.json();
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

    const d = problemData as any;
    const res = await fetch(`${apiConfig.baseUrl}/admin/exercises`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: d.title,
        defect_class: d.defect_class,
        difficulty: DIFF_TO_TIER[d.difficulty] || 'beginner',
        code: d.code || '',
        real_lines: d.real_lines || [],
        fix_diff: d.fix_diff || '',
        reference: d.reference || '',
        hints: d.hints || [],
        review_status: STATUS_TO_REVIEW[d.status] || 'approved',
      }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.detail || `Create failed (${res.status}).`);
    }
    const { id } = (await res.json()) as { id: string };
    return { ...(problemData as Problem), id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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

    const u = updates as any;
    const body: Record<string, unknown> = {};
    if (u.title !== undefined) body.title = u.title;
    if (u.defect_class !== undefined) body.defect_class = u.defect_class;
    if (u.difficulty !== undefined) body.difficulty = DIFF_TO_TIER[u.difficulty] || 'beginner';
    if (u.code !== undefined) body.code = u.code;
    if (u.real_lines !== undefined) body.real_lines = u.real_lines;
    if (u.fix_diff !== undefined) body.fix_diff = u.fix_diff;
    if (u.reference !== undefined) body.reference = u.reference;
    if (u.hints !== undefined) body.hints = u.hints;
    if (Object.keys(body).length) {
      const res = await fetch(`${apiConfig.baseUrl}/admin/exercises/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || `Update failed (${res.status})`);
      }
    }
    if (u.status !== undefined) {
      const res = await fetch(`${apiConfig.baseUrl}/admin/exercises/${id}/review`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ status: STATUS_TO_REVIEW[u.status] || 'unreviewed' }),
      });
      if (!res.ok) throw new Error(`Status change failed (${res.status})`);
    }
    return { id, ...updates, updatedAt: new Date().toISOString() } as Problem;
  },

  // Delete problem
  async deleteProblem(id: string): Promise<boolean> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 250));
      const list = getStoredProblems().filter((p) => p.id !== id);
      saveProblems(list);
      return true;
    }

    const res = await fetch(`${apiConfig.baseUrl}/admin/exercises/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    return true;
  },

  // Approve problem
  async approveProblem(id: string): Promise<Problem> {
    if (apiConfig.useMock) {
      return this.updateProblem(id, { status: 'Approved' });
    }

    const res = await fetch(`${apiConfig.baseUrl}/admin/exercises/${id}/review`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ status: 'approved' }),
    });
    if (!res.ok) throw new Error(`Approve failed (${res.status})`);
    return { id, status: 'Approved' } as Problem;
  },
};
