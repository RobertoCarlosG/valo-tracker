import { useEffect, type ReactNode } from 'react'
import { getMe } from '@/lib/api'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import { useAuthStore } from '@/stores/authStore'

/**
 * Tras la rehidratación de Zustand (tokens en localStorage), restaura `user` con getMe().
 * Sin esperar a persist, el primer render ve accessToken null y la sesión queda rota.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated()
  const { setUser, setLoading, accessToken, logout } = useAuthStore()

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!accessToken) {
      setLoading(false)
      return
    }

    getMe()
      .then((user) => {
        if (user) {
          setUser(user)
        } else {
          logout()
        }
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [hydrated, accessToken, setUser, setLoading, logout])

  return <>{children}</>
}
