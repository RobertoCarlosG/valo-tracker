import { useAuthStore } from '@/stores/authStore'

/**
 * Flujo de vinculación de equipo (Fase 2).
 * Placeholder por ahora.
 */
export default function OnboardingPage() {
  const { user } = useAuthStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Vincula tu equipo Premier</h1>
      <p className="text-muted-foreground mt-2">
        Hola, {user?.display_name ?? 'Usuario'}. El flujo de 5 pasos estará aquí en Fase 2.
      </p>
    </div>
  )
}
