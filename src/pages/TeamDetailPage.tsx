import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Calendar } from 'lucide-react'
import { getWinRate } from '@/lib/utils'

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => apiClient.getTeamById(teamId!),
    enabled: !!teamId,
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
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

  if (!teamData) {
    return <div className="text-center py-12">Team not found</div>
  }

  const team = teamData.data || teamData

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {team.customization?.icon && (
              <img src={team.customization.icon} alt={team.name} className="w-24 h-24 rounded-lg" />
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
                  <p className="text-2xl font-bold">{getWinRate(team.wins, team.losses)}%</p>
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
          <div className="grid gap-3">
            {team.members?.map((member: any) => (
              <div
                key={member.puuid}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <p className="font-medium">
                  {member.name}#{member.tag}
                </p>
              </div>
            ))}
          </div>
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
          ) : historyData?.data && historyData.data.length > 0 ? (
            <div className="space-y-3">
              {historyData.data.map((match: any) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{match.map || 'Unknown Map'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.started_at).toLocaleDateString()}
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
