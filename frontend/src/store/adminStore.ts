import { create } from 'zustand'
import { adminLogin } from '../api/admin'
import { ApiError } from '../api/client'

/**
 * Admin session — a single HMAC bearer token from POST /admin/login, kept in
 * sessionStorage so it dies with the tab (the server TTL is short anyway and an
 * admin surface shouldn't linger). Separate from the Firebase auth store.
 */
const KEY = 'codesight-admin-token'

function load(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

function save(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ignore — private mode / storage disabled */
  }
}

interface AdminState {
  token: string | null
  busy: boolean
  error: string | null
  login: (password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  token: load(),
  busy: false,
  error: null,

  login: async (password) => {
    set({ busy: true, error: null })
    try {
      const { token } = await adminLogin(password)
      save(token)
      set({ token, busy: false })
      return true
    } catch (e) {
      const error =
        e instanceof ApiError && e.status === 401
          ? 'Wrong password.'
          : e instanceof ApiError && e.status === 503
            ? 'The admin API is disabled on the server (ADMIN_PASSWORD unset).'
            : 'Could not reach the server. Check your connection.'
      set({ busy: false, error })
      return false
    }
  },

  logout: () => {
    save(null)
    set({ token: null, error: null })
  },

  clearError: () => set({ error: null }),
}))
