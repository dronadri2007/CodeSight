import { Problem, AdminUser } from '../types';
import { INITIAL_PROBLEMS } from './mockData';
import { apiConfig, getAuthHeaders } from './api';

const STORAGE_KEY = 'codesight_admin_problems_v1';

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
  // Admin Login
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 600)); // Simulate network latency
      if (email.toLowerCase().includes('admin') || password === 'admin123' || email.endsWith('@codesight.dev')) {
        const user: AdminUser = {
          id: 'usr_admin_001',
          name: email.split('@')[0].toUpperCase() || 'Admin Lead',
          email,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        const token = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return { token, user };
      } else {
        // Still allow for demo flexibility
        const user: AdminUser = {
          id: 'usr_admin_002',
          name: email.split('@')[0] || 'Demo Admin',
          email,
          role: 'admin',
        };
        const token = `jwt_mock_${Date.now()}`;
        return { token, user };
      }
    }

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid admin credentials');
    }
    return res.json();
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

    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.difficulty) queryParams.set('difficulty', filters.difficulty);
    if (filters?.status) queryParams.set('status', filters.status);

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/problems?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch problems');
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

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/problems`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(problemData),
    });
    if (!res.ok) throw new Error('Failed to create problem');
    return res.json();
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

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/problems/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update problem');
    return res.json();
  },

  // Delete problem
  async deleteProblem(id: string): Promise<boolean> {
    if (apiConfig.useMock) {
      await new Promise((res) => setTimeout(res, 250));
      const list = getStoredProblems().filter((p) => p.id !== id);
      saveProblems(list);
      return true;
    }

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/problems/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete problem');
    return true;
  },

  // Approve problem
  async approveProblem(id: string): Promise<Problem> {
    if (apiConfig.useMock) {
      return this.updateProblem(id, { status: 'Approved' });
    }

    const res = await fetch(`${apiConfig.baseUrl}/api/admin/problems/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to approve problem');
    return res.json();
  },
};
