import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyTeam, getTeamSnapshots, getPlayerSnapshots, linkTeam, unlinkTeam } from '@/lib/api'
import type { TeamLinkRequest } from '@/types/api'

export function useMyTeam() {
  return useQuery({
    queryKey: ['my-team'],
    queryFn: getMyTeam,
    staleTime: 60_000,
    retry: 1,
  })
}

export function useTeamSnapshots(days: number = 30) {
  return useQuery({
    queryKey: ['team-snapshots', days],
    queryFn: () => getTeamSnapshots(days),
    staleTime: 300_000,
    retry: 1,
  })
}

export function usePlayerSnapshots(days: number = 14) {
  return useQuery({
    queryKey: ['player-snapshots', days],
    queryFn: () => getPlayerSnapshots(days),
    staleTime: 300_000,
    retry: 1,
  })
}

export function useLinkTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TeamLinkRequest) => linkTeam(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-team'] })
    },
  })
}

export function useUnlinkTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: unlinkTeam,
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['my-team'] })
      qc.removeQueries({ queryKey: ['team-snapshots'] })
      qc.removeQueries({ queryKey: ['player-snapshots'] })
    },
  })
}
