import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar } from 'lucide-react'
import { getWinRate } from '@/lib/utils'

/** Forma flexible de la respuesta Premier/Henrik en el detalle de equipo. */
interface PremierTeamPayload {
  name?: string
  tag?: string
  customization?: { icon?: string }
  division?: string
  conference?: string
  region?: string
  wins?: number
  losses?: number
  score?: number
  members?: Array<{ puuid?: string; name?: string; tag?: string }>
}

/** Backend puede devolver el objeto del equipo o un wrapper `{ data: ... }` (API Henrik). */
function unwrapTeamPayload(payload: unknown): PremierTeamPayload | null {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as Record<string, unknown>
  if ('data' in obj && obj.data && typeof obj.data === 'object') {
    return obj.data as PremierTeamPayload
  }
  return obj as PremierTeamPayload
}

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()

  const { data: teamData, isLoading: teamLoading, isError: teamError, error: teamQueryError } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => apiClient.getTeamById(teamId!),
    enabled: !!teamId,
  })

  const { data: historyData, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ['team-history', teamId],
    queryFn: () => apiClient.getTeamHistoryById(teamId!),
    enabled: !!teamId,
  })

  if (teamLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (teamError) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-destructive text-sm">
          {teamQueryError instanceof Error
            ? teamQueryError.message
            : 'Could not load this team.'}
        </p>
        <p className="text-muted-foreground text-xs">
          With demo mode on, team endpoints need a Bearer token. In Postman, test with{' '}
          <code className="text-xs">Authorization: Bearer …</code>.
        </p>
      </div>
    )
  }

  const team = unwrapTeamPayload(teamData)
  if (!team) {
    return <div className="text-center py-12">Team not found</div>
  }

  const roster = team.members ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {team.customization?.icon && (
              <img
                src={team.customization.icon}
                alt={team.name ?? 'Team'}
                className="w-24 h-24 rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold">
                {team.name} <span className="text-muted-foreground">#{team.tag}</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {team.division} • {team.conference} • {team.region}
              </p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold text-primary">{team.score}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Record</p>
                  <p className="text-2xl font-bold">
                    {team.wins}W - {team.losses}L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">
                    {getWinRate(team.wins ?? 0, team.losses ?? 0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roster.length > 0 ? (
            <div className="grid gap-3">
              {roster.map((member) => (
                <div
                  key={member.puuid ?? `${member.name}-${member.tag}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <p className="font-medium">
                    {member.name}#{member.tag}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No roster in this response. Henrik sometimes omits members on team-by-id; the API still returned
              the team shell above.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Match History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : historyError ? (
            <p className="text-center text-destructive text-sm py-6">Match history could not be loaded.</p>
          ) : Array.isArray(historyData?.data) && historyData.data.length > 0 ? (
            <div className="space-y-3">
              {historyData!.data!.map((match: { id?: string; map?: string; started_at?: string; result?: string }) => (
                <div
                  key={match.id ?? `${match.map}-${match.started_at}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{match.map || 'Unknown Map'}</p>
                    <p className="text-sm text-muted-foreground">
                      {match.started_at
                        ? new Date(match.started_at).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        match.result === 'win' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {match.result?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No match history available</p>
          )}
          {historyData?.is_demo_limited && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500 text-center">
                Demo mode: Limited match history. Unlock full access to see all matches.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
