import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/lib/api'

/**
 * Página de callback tras OAuth de Google.
 * Los tokens están en cookies (httpOnly). Limpiamos la URL y cargamos el usuario.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const run = async () => {
      // Limpiar tokens de la URL por seguridad (ya están en cookies)
      window.history.replaceState({}, '', '/auth/callback')

      const user = await getMe()
      if (mounted && user) {
        setUser(user)
        navigate(user.has_team ? '/dashboard' : '/onboarding', { replace: true })
      } else if (mounted) {
        navigate('/login', { replace: true })
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [navigate, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Iniciando sesión...</div>
    </div>
  )
}
