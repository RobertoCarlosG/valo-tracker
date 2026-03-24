import { create } from 'zustand'

export { useAuthStore } from '@/stores/authStore'

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
