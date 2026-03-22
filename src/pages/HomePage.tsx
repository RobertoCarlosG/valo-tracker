import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, TrendingUp } from 'lucide-react'
import { getWinRate } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [region] = useState('na')

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', region],
    queryFn: () => apiClient.getLeaderboard(region),
  })

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
          Valorant Premier Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track the best Premier teams and players. Real-time stats, leaderboards, and detailed match history.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/leaderboards">
            <Button size="lg">
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboards
            </Button>
          </Link>
          <Link to="/search">
            <Button size="lg" variant="outline">
              Search Teams
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Teams - North America
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard?.data.slice(0, 5).map((team) => (
                  <Link
                    key={team.team_id}
                    to={`/teams/${team.team_id}`}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition border"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{team.rank}
                      </span>
                      {team.logo_url && (
                        <img src={team.logo_url} alt={team.team_name} className="w-10 h-10 rounded" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {team.team_name} <span className="text-muted-foreground">#{team.team_tag}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {team.division} • {team.conference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{team.points} pts</p>
                      <p className="text-sm text-muted-foreground">
                        {team.wins}W - {team.losses}L ({getWinRate(team.wins, team.losses)}%)
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {leaderboard?.is_demo_limited && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-500">
                  Demo mode: Showing top 5 only. Unlock full access to see all teams.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
