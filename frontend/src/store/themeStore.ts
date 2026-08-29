import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

interface ThemeState {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('codesight-theme') as ThemeMode
    if (saved === 'dark' || saved === 'light') return saved
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  }
  return 'dark'
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
      document.body.style.backgroundColor = '#F8F5EC'
      document.body.style.color = '#1A130D'
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
      document.body.style.backgroundColor = '#000000'
      document.body.style.color = '#E5DFC9'
    }
    localStorage.setItem('codesight-theme', theme)
  }
}

// Initial application
const initial = getInitialTheme()
applyThemeToDOM(initial)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyThemeToDOM(next)
    set({ theme: next })
  },

  setTheme: (theme: ThemeMode) => {
    applyThemeToDOM(theme)
    set({ theme })
  },
}))
