import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Riot name/tag/región del jugador (solo en este dispositivo).
 * No sustituye datos en servidor; sirve de atajo a /players/... desde Perfil.
 */
interface ValorantIdentityState {
  riotName: string | null
  riotTag: string | null
  riotRegion: string | null
  setIdentity: (name: string, tag: string, region: string) => void
  clear: () => void
}

export const useValorantIdentityStore = create<ValorantIdentityState>()(
  persist(
    (set) => ({
      riotName: null,
      riotTag: null,
      riotRegion: null,
      setIdentity: (riotName, riotTag, riotRegion) =>
        set({ riotName: riotName.trim(), riotTag: riotTag.trim(), riotRegion }),
      clear: () => set({ riotName: null, riotTag: null, riotRegion: null }),
    }),
    { name: 'valotracker-valorant-identity' }
  )
)
