import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWinRate } from '@/lib/utils'

export default function SearchPage() {
  const [teamName, setTeamName] = useState('')
  const [teamTag, setTeamTag] = useState('')
  const [searchTrigger, setSearchTrigger] = useState(0)

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ['search', teamName, teamTag, searchTrigger],
    queryFn: () => apiClient.searchTeams({ name: teamName, tag: teamTag }),
    enabled: searchTrigger > 0,
  })

  const searchRows = results?.data ?? []

  const handleSearch = () => {
    if (teamName || teamTag) {
      setSearchTrigger((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Search Teams</h1>

      <Card>
        <CardHeader>
          <CardTitle>Find a Premier Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Input
              placeholder="Team Tag"
              value={teamTag}
              onChange={(e) => setTeamTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="whitespace-nowrap">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-center text-destructive py-6 text-sm">
              {error instanceof Error ? error.message : 'Could not load search results. Check the API URL and network.'}
            </p>
          )}

          {!isLoading && !isError && searchRows.length > 0 && (
            <div className="space-y-3">
              {searchRows.map((team) => (
                <Link
                  key={team.team_id || `${team.team_name}-${team.team_tag}`}
                  to={team.team_id ? `/teams/${team.team_id}` : '#'}
                  className={`block p-4 border rounded-lg transition ${team.team_id ? 'hover:bg-accent' : 'opacity-60 pointer-events-none'}`}
                  aria-disabled={!team.team_id}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {team.logo_url && (
                        <img src={team.logo_url} alt={team.team_name} className="w-12 h-12 rounded" />
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {team.team_name} <span className="text-muted-foreground">#{team.team_tag}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {team.region} • {team.division} • {team.conference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{team.points} pts</p>
                      <p className="text-sm text-muted-foreground">
                        {team.wins}W - {team.losses}L ({getWinRate(team.wins, team.losses)}%)
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !isError && searchTrigger > 0 && searchRows.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No teams found</p>
          )}

          {results?.is_demo_limited && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500 text-center">
                Demo mode: Limited to {searchRows.length} results. Unlock full access for unlimited searches.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
