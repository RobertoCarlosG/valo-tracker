/**
 * Store de autenticación.
 * NO persistir tokens (regla ética: httpOnly cookies).
 * Los tokens se envían automáticamente mediante credentials: 'include'.
 */
import { create } from 'zustand'
import type { UserMeOut } from '@/types/api'

export interface AuthState {
  user: UserMeOut | null
  isAuthenticated: boolean
  hasTeam: boolean
  isLoading: boolean

  setUser: (user: UserMeOut | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasTeam: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      hasTeam: user?.has_team ?? false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      hasTeam: false,
    }),
}))
