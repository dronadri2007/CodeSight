import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  activeToast: { id: string; message: string; type: 'success' | 'error' | 'info' } | null
  settingsAnimations: boolean
  settingsSound: boolean
  settingsMinimap: boolean
  settingsFontSize: number

  toggleSidebar: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  dismissToast: () => void
  setSetting: <K extends 'settingsAnimations' | 'settingsSound' | 'settingsMinimap'>(key: K, value: boolean) => void
  setFontSize: (size: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeToast: null,
  settingsAnimations: true,
  settingsSound: false,
  settingsMinimap: false,
  settingsFontSize: 14,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  showToast: (message, type = 'info') => {
    const id = Date.now().toString()
    set({ activeToast: { id, message, type } })
    setTimeout(() => set((state) => (state.activeToast?.id === id ? { activeToast: null } : {})), 3500)
  },

  dismissToast: () => set({ activeToast: null }),

  setSetting: (key, value) => set({ [key]: value }),
  setFontSize: (size) => set({ settingsFontSize: size }),
}))
