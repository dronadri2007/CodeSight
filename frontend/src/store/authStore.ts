import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role?: 'student' | 'professional'
  avatar: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (name?: string, email?: string) => void
  logout: () => void
  setRole: (role: 'student' | 'professional') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (name = 'Afrid Shaik', email = 'afrid@example.com') => {
        set({
          isAuthenticated: true,
          user: {
            id: 'usr_1',
            name,
            email,
            avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'AF',
          },
        })
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        })
      },

      setRole: (role: 'student' | 'professional') => {
        set((state) => ({
          user: state.user
            ? { ...state.user, role }
            : { id: 'usr_1', name: 'Afrid Shaik', email: 'afrid@example.com', role, avatar: 'AF' },
        }))
      },
    }),
    {
      name: 'codesight-auth',
    }
  )
)
