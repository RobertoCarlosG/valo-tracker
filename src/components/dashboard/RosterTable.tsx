import { useNavigate } from 'react-router-dom'
import { LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PlayerWithSnapshots } from '@/types/api'

interface RosterTableProps {
  players: PlayerWithSnapshots[]
  region: string
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground text-xs">—</span>
  if (delta > 0)
    return (
      <span className="flex items-center gap-0.5 text-green-400 text-xs font-medium">
        <TrendingUp className="w-3 h-3" /> +{delta}
      </span>
    )
  if (delta < 0)
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-medium">
        <TrendingDown className="w-3 h-3" /> {delta}
      </span>
    )
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="w-3 h-3" /> 0
    </span>
  )
}

function Sparkline({ snapshots, delta }: { snapshots: { mmr_current: number | null }[]; delta: number | null }) {
  const data = snapshots.map((s) => ({ v: s.mmr_current ?? 0 }))
  if (data.length < 2) return <span className="text-muted-foreground text-xs">—</span>
  const color = delta !== null && delta > 0 ? '#22c55e' : delta !== null && delta < 0 ? '#ef4444' : '#6b7280'
  return (
    <LineChart width={100} height={32} data={data}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
    </LineChart>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function RosterTable({ players, region }: RosterTableProps) {
  const navigate = useNavigate()

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No hay datos del roster disponibles aún.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Jugador</th>
            <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium">Rank</th>
            <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium">MMR</th>
            <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium">7d</th>
            <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const latest = p.snapshots[p.snapshots.length - 1]
            return (
              <tr
                key={p.puuid}
                onClick={() => navigate(`/players/${region}/${p.name}/${p.tag}`)}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                      {initials(p.name)}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">#{p.tag}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {latest?.rank_tier ? (
                    <span className="text-xs bg-muted rounded px-1.5 py-0.5">{latest.rank_tier}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-medium">
                  {latest?.mmr_current ?? '—'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <DeltaBadge delta={p.trend.mmr_delta_7d} />
                </td>
                <td className="py-2.5 px-3 flex justify-center">
                  <Sparkline snapshots={p.snapshots} delta={p.trend.mmr_delta_7d} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
