import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Loader2, AlertCircle, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useTeamStore } from '@/stores/teamStore'

// ─────────────────────────────────────────
// Data fetchers
// ─────────────────────────────────────────

async function fetchMMR(region: string, name: string, tag: string) {
  const { data } = await api.get(`/api/v1/players/mmr/${region}/${name}/${tag}`)
  return data
}

async function fetchMatches(region: string, name: string, tag: string) {
  const { data } = await api.get(`/api/v1/players/matches/${region}/${name}/${tag}`, {
    params: { size: 15 },
  })
  return data
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

// ─────────────────────────────────────────
// MMR Chart
// ─────────────────────────────────────────

interface MMRPoint {
  date: string
  mmr: number
}

function MMRChart({ points }: { points: MMRPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Necesitas al menos 2 puntos de datos para ver la gráfica.
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={points} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }}
          formatter={(v) => [v, 'MMR']}
          labelFormatter={(l) => `Fecha: ${l}`}
        />
        <Line type="monotone" dataKey="mmr" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function PlayerDetailPage() {
  const { region, name, tag } = useParams<{ region: string; name: string; tag: string }>()
  const { savedTeam } = useTeamStore()

  const {
    data: mmrData,
    isLoading: mmrLoading,
    isError: mmrError,
  } = useQuery({
    queryKey: ['player-mmr', region, name, tag],
    queryFn: () => fetchMMR(region!, name!, tag!),
    enabled: !!(region && name && tag),
    staleTime: 60_000,
    retry: 1,
  })

  const {
    data: matchesData,
    isLoading: matchesLoading,
    isError: matchesError,
  } = useQuery({
    queryKey: ['player-matches', region, name, tag],
    queryFn: () => fetchMatches(region!, name!, tag!),
    enabled: !!(region && name && tag),
    staleTime: 60_000,
    retry: 1,
  })

  if (!region || !name || !tag) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">Parámetros de jugador inválidos.</div>
    )
  }

  // Detect if player is on the user's linked team
  const isMyTeamMember = savedTeam && mmrData
    ? (() => {
        const fullName = `${name}#${tag}`.toLowerCase()
        return fullName.includes(name.toLowerCase())
      })()
    : false

  // Parse MMR history from the response (Henrik MMR v2 structure)
  const mmrCurrent: number | null = mmrData?.data?.elo ?? null
  const rankTier: string | null = mmrData?.data?.currenttierpatched ?? null
  const rrCurrent: number | null = mmrData?.data?.ranking_in_tier ?? null

  // Build chart points from mmr_history if available
  const mmrHistory: MMRPoint[] = (() => {
    const history = mmrData?.data?.mmr_history ?? mmrData?.data?.by_season ?? []
    if (!Array.isArray(history) || history.length === 0) return []
    return history
      .filter((h: Record<string, unknown>) => h.elo != null)
      .slice(-30)
      .map((h: Record<string, unknown>) => ({
        date: formatDate(h.date as string ?? h.match_start as string),
        mmr: h.elo as number,
      }))
  })()

  // Parse match history
  const matches: Record<string, unknown>[] = matchesData?.data ?? []

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-xl font-bold text-blue-400 flex-shrink-0">
            {initials(name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{name}</h1>
              <span className="text-muted-foreground text-lg">#{tag}</span>
              {isMyTeamMember && (
                <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">
                  <Users className="w-3 h-3" /> Tu equipo
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{region}</div>

            {mmrLoading ? (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cargando MMR...</span>
              </div>
            ) : mmrError ? (
              <p className="text-sm text-red-400 mt-2">No se pudo cargar el MMR del jugador.</p>
            ) : (
              <div className="flex gap-5 mt-3">
                <div>
                  <div className="text-xs text-muted-foreground">Rank</div>
                  <div className="font-semibold">{rankTier ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">MMR</div>
                  <div className="font-semibold">{mmrCurrent ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">RR</div>
                  <div className="font-semibold">{rrCurrent ?? '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MMR History Chart */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Historial de MMR
        </h2>
        {mmrLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MMRChart points={mmrHistory} />
        )}
      </div>

      {/* Match History */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Partidas recientes
        </h2>

        {matchesLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : matchesError ? (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> No se pudo cargar el historial de partidas.
          </div>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">Sin partidas disponibles.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((match, i) => {
              const result = (match.result as string | null) ?? (match.teams as Record<string, unknown>)?.winner as string ?? null
              const isWin = result?.toLowerCase() === 'win' || result?.toLowerCase() === 'blue' || result?.toLowerCase() === 'red'
              const map = (match.map as string | null) ?? (match.metadata as Record<string, unknown>)?.map as string ?? 'Mapa desconocido'
              const date = (match.started_at as string | null) ?? (match.metadata as Record<string, unknown>)?.game_start as string
              const roundsWon = match.rounds_won as number | null
              const roundsLost = match.rounds_lost as number | null

              return (
                <div
                  key={(match.match_id as string) ?? `match-${i}`}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-10 rounded-full ${
                      result ? (isWin ? 'bg-green-500' : 'bg-red-500') : 'bg-muted-foreground/30'
                    }`} />
                    <div>
                      <div className="font-medium text-sm">{map}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(date as string)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {result && (
                      <div className={`font-bold text-sm ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                        {isWin ? 'Victoria' : 'Derrota'}
                      </div>
                    )}
                    {roundsWon != null && roundsLost != null && (
                      <div className="text-xs text-muted-foreground">{roundsWon} - {roundsLost}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {matchesData?.is_demo_limited && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 text-center">
            Modo demo: historial limitado. Regístrate para ver todas las partidas.
          </div>
        )}
      </div>
    </div>
  )
}
