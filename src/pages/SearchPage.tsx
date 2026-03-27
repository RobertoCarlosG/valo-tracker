import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWinRate } from '@/lib/utils'

const PLAYER_REGIONS = [
  { code: 'NA', label: 'NA' },
  { code: 'EU', label: 'EU' },
  { code: 'AP', label: 'AP' },
  { code: 'KR', label: 'KR' },
  { code: 'LATAM', label: 'LATAM' },
  { code: 'BR', label: 'BR' },
]

export default function SearchPage() {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [teamTag, setTeamTag] = useState('')
  const [searchTrigger, setSearchTrigger] = useState(0)

  const [pName, setPName] = useState('')
  const [pTag, setPTag] = useState('')
  const [pRegion, setPRegion] = useState('NA')

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

  const goPlayerProfile = () => {
    const n = pName.trim()
    const t = pTag.trim()
    if (!n || !t) return
    navigate(`/players/${pRegion}/${encodeURIComponent(n)}/${encodeURIComponent(t)}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Buscar</h1>
      <p className="text-muted-foreground text-sm -mt-2">
        Equipos Premier o jugadores (MMR, partidas). Inicia sesión si la API está en modo demo.
      </p>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Buscar jugador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Abre el perfil con rank, MMR, historial y partidas recientes (mismos datos que para tu equipo en el roster).
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="sm:w-28">
              <label className="text-xs text-muted-foreground">Región</label>
              <select
                value={pRegion}
                onChange={(e) => setPRegion(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&>option]:bg-popover [&>option]:text-foreground"
              >
                {PLAYER_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Nombre en juego"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goPlayerProfile()}
            />
            <Input
              placeholder="Tag (ej. 1234)"
              value={pTag}
              onChange={(e) => setPTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goPlayerProfile()}
            />
            <Button type="button" onClick={goPlayerProfile} disabled={!pName.trim() || !pTag.trim()}>
              Ver perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
