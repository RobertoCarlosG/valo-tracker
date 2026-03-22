import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getWinRate } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function LeaderboardsPage() {
  const [region, setRegion] = useState('na')

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', region],
    queryFn: () => apiClient.getLeaderboard(region),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Premier Leaderboards</h1>
        <div className="flex gap-2">
          {['na', 'eu', 'ap', 'br', 'kr', 'latam'].map((r) => (
            <Button
              key={r}
              variant={region === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRegion(r)}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Teams - {region.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard?.data.map((team, index) => (
                <Link
                  key={team.team_id}
                  to={`/teams/${team.team_id}`}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition border"
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-2xl font-bold w-12 ${
                        index === 0
                          ? 'text-yellow-400'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-amber-700'
                          : 'text-muted-foreground'
                      }`}
                    >
                      #{team.rank}
                    </span>
                    {team.logo_url && (
                      <img src={team.logo_url} alt={team.team_name} className="w-12 h-12 rounded" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">
                        {team.team_name} <span className="text-muted-foreground">#{team.team_tag}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {team.division} • {team.conference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{team.points} pts</p>
                    <p className="text-sm text-muted-foreground">
                      {team.wins}W - {team.losses}L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getWinRate(team.wins, team.losses)}% WR
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {leaderboard?.is_demo_limited && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500 text-center">
                Demo mode: Limited results. Unlock full access to see complete leaderboards.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
