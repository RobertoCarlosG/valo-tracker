import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CompareResponse } from '@/types/api'

export function useCompare(
  rivalTeamId: string | null,
  rivalRegion: string,
  days: number = 30
) {
  return useQuery({
    queryKey: ['compare', rivalTeamId, rivalRegion, days],
    queryFn: async (): Promise<CompareResponse> => {
      const { data } = await api.get<CompareResponse>('/api/v1/compare/teams', {
        params: {
          rival_team_id: rivalTeamId,
          rival_region: rivalRegion,
          days,
        },
      })
      return data
    },
    enabled: !!rivalTeamId,
    staleTime: 120_000,
    retry: 1,
  })
}
