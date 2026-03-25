import { useEffect, type ReactNode } from 'react'
import { getMe } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Al montar la app, intenta restaurar la sesión del usuario.
 * Los tokens se cargan automáticamente desde localStorage via el store persistido.
 * Aquí solo se rehidrata el objeto user (que no se persiste por ser stale-prone).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading, accessToken, logout } = useAuthStore()

  useEffect(() => {
    // Si no hay token persistido, no hay sesión que restaurar
    if (!accessToken) {
      setLoading(false)
      return
    }

    // Con token disponible, obtener perfil actualizado del servidor
    getMe()
      .then((user) => {
        if (user) {
          setUser(user)
        } else {
          // Token inválido/expirado y refresh también falló
          logout()
        }
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo al montar — accessToken inicial viene del store persistido

  return <>{children}</>
}
