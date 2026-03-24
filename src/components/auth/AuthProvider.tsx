import { useEffect, type ReactNode } from 'react'
import { getMe } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Al montar la app, intenta restaurar la sesión desde cookies (getMe).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    getMe().then((user) => {
      setUser(user ?? null)
      setLoading(false)
    }).catch(() => {
      setUser(null)
      setLoading(false)
    })
  }, [setUser, setLoading])

  return <>{children}</>
}
