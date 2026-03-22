import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  token: string | null
  email: string | null
  setAuth: (token: string, email: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      email: null,
      setAuth: (token, email) => set({ isAuthenticated: true, token, email }),
      clearAuth: () => set({ isAuthenticated: false, token: null, email: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface DemoStore {
  isDemoMode: boolean
  showDemoModal: boolean
  setDemoMode: (isDemoMode: boolean) => void
  setShowDemoModal: (show: boolean) => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemoMode: false,
  showDemoModal: false,
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  setShowDemoModal: (show) => set({ showDemoModal: show }),
}))
