import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedTeamOut, TeamLiveData } from '@/types/api'

interface TeamStore {
  region: string | null
  savedTeam: SavedTeamOut | null
  liveData: TeamLiveData | null

  setRegion: (region: string) => void
  setTeam: (team: SavedTeamOut) => void
  setLiveData: (data: TeamLiveData) => void
  clearTeam: () => void
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      region: null,
      savedTeam: null,
      liveData: null,

      setRegion: (region) => set({ region }),
      setTeam: (savedTeam) => set({ savedTeam }),
      setLiveData: (liveData) => set({ liveData }),
      clearTeam: () => set({ savedTeam: null, liveData: null }),
    }),
    {
      name: 'valotracker-team',
      partialize: (state) => ({ region: state.region, savedTeam: state.savedTeam }),
    }
  )
)
