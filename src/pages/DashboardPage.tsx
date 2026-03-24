import { useAuthStore } from '@/stores/authStore'

/**
 * Dashboard principal del usuario (Fase 2).
 * Placeholder por ahora.
 */
export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Bienvenido, {user?.display_name ?? 'Usuario'}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Tu equipo y estadísticas aparecerán aquí (Fase 2).
      </p>
    </div>
  )
}
