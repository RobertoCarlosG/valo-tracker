import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/lib/api'

/**
 * Página de callback tras OAuth de Google.
 * El backend redirige aquí con ?access_token=...&refresh_token=...
 * Los guardamos en el store (memoria) y limpiamos la URL de inmediato.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser, setTokens } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const run = async () => {
      // Leer tokens de la URL antes de limpiarla
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      // Limpiar tokens de la URL inmediatamente (seguridad)
      window.history.replaceState({}, '', '/auth/callback')

      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken)
      }

      const user = await getMe()
      if (mounted && user) {
        setUser(user)
        navigate(user.has_team ? '/dashboard' : '/onboarding', { replace: true })
      } else if (mounted) {
        navigate('/login?error=oauth_failed', { replace: true })
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [navigate, setUser, setTokens])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Iniciando sesión...</div>
    </div>
  )
}
