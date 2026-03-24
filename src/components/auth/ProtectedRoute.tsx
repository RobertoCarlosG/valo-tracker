import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  /** Si true, requiere auth + equipo. Si false, solo auth (ej. onboarding). */
  requireTeam?: boolean
}

/**
 * Protege rutas que requieren autenticación.
 * requireTeam=true: redirige a /login o /onboarding si no tiene equipo.
 * requireTeam=false: solo requiere auth (para onboarding).
 */
export function ProtectedRoute({ children, requireTeam = true }: ProtectedRouteProps) {
  const { isAuthenticated, hasTeam, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireTeam && !hasTeam) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
