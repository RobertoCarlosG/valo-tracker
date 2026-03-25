/**
 * Store de autenticación.
 * Tokens en memoria (NO localStorage/sessionStorage).
 * Se pierden al recargar la página — el refresh token en cookie los renueva.
 */
import { create } from 'zustand'
import type { UserMeOut } from '@/types/api'

export interface AuthState {
  user: UserMeOut | null
  isAuthenticated: boolean
  hasTeam: boolean
  isLoading: boolean
  /** Access token en memoria (no persistido). */
  accessToken: string | null
  /** Refresh token en memoria (no persistido). */
  refreshToken: string | null

  setUser: (user: UserMeOut | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setHasTeam: (v: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasTeam: false,
  isLoading: true,
  accessToken: null,
  refreshToken: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      hasTeam: user?.has_team ?? false,
    }),

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

  setHasTeam: (hasTeam) => set({ hasTeam }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      hasTeam: false,
      accessToken: null,
      refreshToken: null,
    }),
}))
