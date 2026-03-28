import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Loader2, AlertCircle, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useMyTeam } from '@/hooks/useMyTeam'

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

/** Fecha desde ISO, texto local de Henrik o unix (`date_raw` en segundos). */
function formatDateFromHenrik(dateStr: unknown, dateRaw?: unknown): string {
  if (typeof dateRaw === 'number' && dateRaw > 0) {
    const ms = dateRaw < 1e12 ? dateRaw * 1000 : dateRaw
    const d = new Date(ms)
    if (!Number.isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
    }
  }
  if (typeof dateStr === 'string' && dateStr.trim()) {
    const d = new Date(dateStr)
    if (!Number.isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
    }
  }
  return '—'
}

/** Snapshot actual: Henrik v2 usa `data.current_data`; respuestas antiguas pueden tener campos en la raíz de `data`. */
function getMmrCurrentSlice(mmrResponse: Record<string, unknown> | undefined): Record<string, unknown> | null {
  const inner = mmrResponse?.data as Record<string, unknown> | undefined
  if (!inner) return null
  const cur = inner.current_data
  if (cur && typeof cur === 'object') return cur as Record<string, unknown>
  if (typeof inner.elo === 'number' || typeof inner.currenttierpatched === 'string') return inner
  return inner
}

function mapNameFromMatch(m: Record<string, unknown>): string {
  const map = m.map
  if (map && typeof map === 'object' && map !== null && 'name' in map) {
    return String((map as { name: string }).name)
  }
  if (typeof map === 'string') return map
  const meta = m.metadata as Record<string, unknown> | undefined
  const mm = meta?.map
  if (mm && typeof mm === 'object' && mm !== null && 'name' in mm) {
    return String((mm as { name: string }).name)
  }
  if (typeof mm === 'string') return mm
  return 'Mapa desconocido'
}

/** Derrota/Victoria del jugador en la partida (estructura típica Henrik v3). */
function playerWonMatch(
  m: Record<string, unknown>,
  name: string,
  tag: string
): boolean | null {
  const players = m.players as Record<string, unknown> | undefined
  const all = players?.all_players as Record<string, unknown>[] | undefined
  if (!Array.isArray(all)) return null
  const me = all.find(
    (p) =>
      String(p.name || '').toLowerCase() === name.toLowerCase() &&
      String(p.tag || '').toLowerCase() === tag.toLowerCase()
  )
  if (!me) return null
  const team = String(me.team || '').toLowerCase()
  const teams = m.teams as Record<string, unknown> | undefined
  const red = teams?.red as Record<string, unknown> | undefined
  const blue = teams?.blue as Record<string, unknown> | undefined
  const redWon = red?.has_won === true
  const blueWon = blue?.has_won === true
  if (team === 'red') return redWon ? true : blueWon ? false : null
  if (team === 'blue') return blueWon ? true : redWon ? false : null
  return null
}

/** Rondas a favor / en contra desde el punto de vista del jugador. */
function roundScoreLine(m: Record<string, unknown>, name: string, tag: string): string | null {
  const teams = m.teams as Record<string, unknown> | undefined
  const red = teams?.red as Record<string, unknown> | undefined
  const blue = teams?.blue as Record<string, unknown> | undefined
  const rw = typeof red?.rounds_won === 'number' ? red.rounds_won : null
  const bw = typeof blue?.rounds_won === 'number' ? blue.rounds_won : null
  if (rw == null || bw == null) return null
  const players = m.players as Record<string, unknown> | undefined
  const all = players?.all_players as Record<string, unknown>[] | undefined
  const me = Array.isArray(all)
    ? all.find(
        (p) =>
          String(p.name || '').toLowerCase() === name.toLowerCase() &&
          String(p.tag || '').toLowerCase() === tag.toLowerCase()
      )
    : undefined
  const team = String(me?.team || '').toLowerCase()
  if (team === 'red') return `${rw} - ${bw}`
  if (team === 'blue') return `${bw} - ${rw}`
  return `${rw} - ${bw}`
}

function playerKdLine(m: Record<string, unknown>, name: string, tag: string): string | null {
  const players = m.players as Record<string, unknown> | undefined
  const all = players?.all_players as Record<string, unknown>[] | undefined
  const me = Array.isArray(all)
    ? all.find(
        (p) =>
          String(p.name || '').toLowerCase() === name.toLowerCase() &&
          String(p.tag || '').toLowerCase() === tag.toLowerCase()
      )
    : undefined
  const stats = me?.stats as Record<string, unknown> | undefined
  if (!stats) return null
  const k = stats.kills
  const d = stats.deaths
  const a = stats.assists
  if (typeof k !== 'number' && typeof d !== 'number') return null
  const parts = [`${k ?? '—'}/${d ?? '—'}`]
  if (typeof a === 'number') parts.push(`${a} ast`)
  return parts.join(' · ')
}

function matchQueueLabel(m: Record<string, unknown>): string | null {
  const meta = m.metadata as Record<string, unknown> | undefined
  const raw = meta?.mode_id ?? meta?.queue_id
  if (typeof raw !== 'string' || !raw.trim()) return null
  if (raw.length >= 30 && raw.includes('-')) return null
  return raw.length > 28 ? `${raw.slice(0, 26)}…` : raw
}

function matchDateDisplay(m: Record<string, unknown>): string {
  const meta = m.metadata as Record<string, unknown> | undefined
  const gs = meta?.game_start
  if (typeof gs === 'number' && gs > 0) {
    return formatDateFromHenrik(undefined, gs)
  }
  const patched =
    (typeof meta?.game_start_patched === 'string' && meta.game_start_patched) ||
    (typeof meta?.game_start === 'string' && meta.game_start) ||
    undefined
  if (patched) return formatDateFromHenrik(patched, undefined)
  return '—'
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
  const decodedName = name ? decodeURIComponent(name) : ''
  const decodedTag = tag ? decodeURIComponent(tag) : ''
  const canFetch = !!(region && decodedName && decodedTag)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasTeam = useAuthStore((s) => s.hasTeam)
  const { data: myTeamData } = useMyTeam({ enabled: isAuthenticated && hasTeam })

  const {
    data: mmrData,
    isLoading: mmrLoading,
    isError: mmrError,
  } = useQuery({
    queryKey: ['player-mmr', region, decodedName, decodedTag],
    queryFn: () => fetchMMR(region!, decodedName, decodedTag),
    enabled: canFetch,
    staleTime: 60_000,
    retry: 1,
  })

  const {
    data: matchesData,
    isLoading: matchesLoading,
    isError: matchesError,
  } = useQuery({
    queryKey: ['player-matches', region, decodedName, decodedTag],
    queryFn: () => fetchMatches(region!, decodedName, decodedTag),
    enabled: canFetch,
    staleTime: 60_000,
    retry: 1,
  })

  if (!canFetch) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">Parámetros de jugador inválidos.</div>
    )
  }

  const isMyTeamMember = Boolean(
    myTeamData?.roster?.some(
      (m) =>
        m.name?.toLowerCase() === decodedName.toLowerCase() &&
        m.tag?.toLowerCase() === decodedTag.toLowerCase()
    )
  )

  // Henrik v2 MMR: stats en `data.current_data`; historial en `data.mmr_history`
  const mmrSlice = getMmrCurrentSlice(mmrData as Record<string, unknown> | undefined)
  const mmrCurrent = typeof mmrSlice?.elo === 'number' ? mmrSlice.elo : null
  const rankTier =
    typeof mmrSlice?.currenttierpatched === 'string' ? mmrSlice.currenttierpatched : null
  const rrCurrent = typeof mmrSlice?.ranking_in_tier === 'number' ? mmrSlice.ranking_in_tier : null

  const mmrHistory: MMRPoint[] = (() => {
    const inner = mmrData?.data as Record<string, unknown> | undefined
    const history = inner?.mmr_history
    if (!Array.isArray(history) || history.length === 0) return []
    return history
      .filter((h: Record<string, unknown>) => h.elo != null)
      .slice(-30)
      .map((h: Record<string, unknown>) => ({
        date: formatDateFromHenrik(h.date, h.date_raw),
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
            {initials(decodedName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{decodedName}</h1>
              <span className="text-muted-foreground text-lg">#{decodedTag}</span>
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
              const m = match as Record<string, unknown>
              const won = playerWonMatch(m, decodedName, decodedTag)
              const map = mapNameFromMatch(m)
              const dateShown = matchDateDisplay(m)
              const roundsLine = roundScoreLine(m, decodedName, decodedTag)
              const kd = playerKdLine(m, decodedName, decodedTag)
              const queue = matchQueueLabel(m)
              const key =
                (m.match_id as string) ||
                ((m.metadata as Record<string, unknown> | undefined)?.matchid as string) ||
                `match-${i}`

              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                        won === true ? 'bg-green-500' : won === false ? 'bg-red-500' : 'bg-muted-foreground/30'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{map}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>{dateShown}</span>
                        {queue && <span className="text-muted-foreground/80">· {queue}</span>}
                      </div>
                      {kd && <div className="text-[11px] text-muted-foreground mt-0.5">{kd}</div>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {won !== null && (
                      <div className={`font-bold text-sm ${won ? 'text-green-400' : 'text-red-400'}`}>
                        {won ? 'Victoria' : 'Derrota'}
                      </div>
                    )}
                    {won === null && <div className="text-xs text-muted-foreground">—</div>}
                    {roundsLine && (
                      <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">{roundsLine}</div>
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
