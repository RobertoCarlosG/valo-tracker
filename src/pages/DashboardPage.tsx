import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useMyTeam, useTeamSnapshots, usePlayerSnapshots } from '@/hooks/useMyTeam'
import { RankChart } from '@/components/dashboard/RankChart'
import { RosterTable } from '@/components/dashboard/RosterTable'
import { InsightBanner } from '@/components/dashboard/InsightBanner'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function winRate(wins: number | null, losses: number | null): string {
  if (wins == null || losses == null) return '—'
  const total = wins + losses
  if (total === 0) return '—'
  return `${Math.round((wins / total) * 100)}%`
}

function rankTrend(delta: number | null) {
  if (delta === null) return { label: '—', color: 'text-muted-foreground', Icon: Minus }
  // Negative delta = improved (lower position number = better rank)
  if (delta < 0) return { label: `▲ ${Math.abs(delta)}`, color: 'text-green-400', Icon: TrendingUp }
  if (delta > 0) return { label: `▼ ${delta}`, color: 'text-red-400', Icon: TrendingDown }
  return { label: '→ 0', color: 'text-muted-foreground', Icon: Minus }
}

function nextSnapshotLabel(lastSnapshotAt: string | null): string {
  if (!lastSnapshotAt) return '—'
  const nextMs = new Date(lastSnapshotAt).getTime() + 24 * 60 * 60 * 1000
  const diffMs = nextMs - Date.now()
  if (diffMs <= 0) return 'Pronto'
  const h = Math.floor(diffMs / (1000 * 60 * 60))
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `en ${h}h ${m}m`
}

// ─────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────

interface KPICardProps {
  label: string
  value: string
  sub?: string
  colorClass?: string
}

function KPICard({ label, value, sub, colorClass }: KPICardProps) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass ?? 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function KPISkeleton() {
  return (
    <div className="bg-card border rounded-xl p-4 animate-pulse">
      <div className="h-3 w-20 bg-muted rounded mb-2" />
      <div className="h-7 w-16 bg-muted rounded" />
    </div>
  )
}

// ─────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────

export default function DashboardPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30)

  const { data: teamData, isLoading: loadingTeam, isError: errTeam, refetch: refetchTeam } = useMyTeam()
  const { data: snapshotsData, isLoading: loadingSnaps } = useTeamSnapshots(days)
  const { data: playerData, isLoading: loadingPlayers } = usePlayerSnapshots(14)

  if (errTeam) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h2 className="text-lg font-semibold">No se pudo cargar tu equipo</h2>
        <p className="text-muted-foreground text-sm">Verifica tu conexión e intenta de nuevo.</p>
        <button
          onClick={() => refetchTeam()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    )
  }

  const saved = teamData?.saved_team
  const live = teamData?.live
  const snapshots = snapshotsData?.snapshots ?? []
  const trend = snapshotsData?.trend
  const players = playerData?.players ?? []
  const lastSnapshot = teamData?.last_snapshot_at ?? null

  const trendInfo = rankTrend(trend?.rank_delta_7d ?? null)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          {loadingTeam ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-7 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                {saved?.team_name ?? '—'}{' '}
                <span className="text-muted-foreground font-normal text-lg">#{saved?.team_tag}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                  {saved?.region}
                </span>
                {saved?.division && (
                  <span className="text-xs text-muted-foreground">{saved.division}</span>
                )}
                {saved?.conference && (
                  <span className="text-xs text-muted-foreground">· {saved.conference}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loadingTeam || loadingSnaps ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          <>
            <KPICard
              label="Posición"
              value={live?.rank_position != null ? `#${live.rank_position}` : '—'}
              sub="en el leaderboard"
            />
            <KPICard
              label="Winrate (30d)"
              value={winRate(snapshots[snapshots.length - 1]?.wins ?? null, snapshots[snapshots.length - 1]?.losses ?? null)}
              sub={`${snapshots[snapshots.length - 1]?.wins ?? 0}W / ${snapshots[snapshots.length - 1]?.losses ?? 0}L`}
            />
            <KPICard
              label="Tendencia"
              value={trendInfo.label}
              colorClass={trendInfo.color}
              sub="últimos 7 días"
            />
            <KPICard
              label="Próx. snapshot"
              value={nextSnapshotLabel(lastSnapshot)}
              sub="actualización diaria"
            />
          </>
        )}
      </div>

      {/* Rank Chart */}
      <Section title="Evolución de posición">
        {loadingSnaps ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RankChart snapshots={snapshots} days={days} onDaysChange={setDays} />
        )}
      </Section>

      {/* Roster */}
      <Section title="Roster — MMR por jugador">
        {loadingPlayers ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RosterTable players={players} region={saved?.region ?? ''} />
        )}
      </Section>

      {/* Insights */}
      <Section title="Insights">
        {loadingSnaps || loadingPlayers ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <InsightBanner teamSnapshots={snapshots} playerSnapshots={players} />
        )}
      </Section>
    </div>
  )
}
