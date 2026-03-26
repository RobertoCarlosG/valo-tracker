import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

/** True cuando Zustand persist terminó de leer localStorage (tokens disponibles en el store). */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return unsub
  }, [])

  return hydrated
}
