import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CompareResponse, TeamCompareData } from '@/types/api'

interface ComparePanelProps {
  data: CompareResponse
}

function pct(v: number | null): string {
  if (v === null) return '—'
  return `${Math.round(v * 100)}%`
}

function rankLabel(v: number | null): string {
  if (v === null) return '—'
  return `#${v}`
}

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground text-xs">—</span>
  if (delta < 0)
    return (
      <span className="flex items-center gap-0.5 text-green-400 text-xs font-medium">
        <TrendingUp className="w-3 h-3" /> ▲ {Math.abs(delta)}
      </span>
    )
  if (delta > 0)
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-medium">
        <TrendingDown className="w-3 h-3" /> ▼ {delta}
      </span>
    )
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="w-3 h-3" /> →
    </span>
  )
}

function MetricBar({ myValue, rivalValue, myBetter }: {
  myValue: number | null
  rivalValue: number | null
  myBetter: boolean | null
}) {
  if (myValue === null || rivalValue === null) {
    return <div className="h-1.5 bg-muted rounded-full" />
  }
  const total = myValue + rivalValue
  if (total === 0) return <div className="h-1.5 bg-muted rounded-full" />
  const myPct = (myValue / total) * 100

  return (
    <div className="flex h-1.5 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all ${myBetter ? 'bg-blue-500' : 'bg-muted-foreground/50'}`}
        style={{ width: `${myPct}%` }}
      />
      <div
        className={`h-full flex-1 ${!myBetter && myBetter !== null ? 'bg-red-400/60' : 'bg-muted'}`}
      />
    </div>
  )
}

function TeamColumn({ team, side }: { team: TeamCompareData; side: 'my' | 'rival' }) {
  const isMe = side === 'my'
  return (
    <div className={`flex-1 rounded-xl border p-5 ${isMe ? 'border-blue-500/40 bg-blue-500/5' : 'border-border'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isMe ? 'bg-blue-600/20 text-blue-400' : 'bg-muted text-muted-foreground'
        }`}>
          {team.tag?.slice(0, 2) ?? team.name.slice(0, 2)}
        </div>
        <div>
          <div className="font-semibold text-sm">{team.name}</div>
          <div className="text-xs text-muted-foreground">#{team.tag}</div>
        </div>
        {isMe && <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium">Mi equipo</span>}
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Posición</div>
          <div className="text-2xl font-bold">{rankLabel(team.rank_position)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Winrate</div>
          <div className="text-xl font-semibold">{pct(team.win_rate)}</div>
          <div className="text-xs text-muted-foreground">{team.wins ?? 0}W / {team.losses ?? 0}L</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Tendencia 7d</div>
          <TrendBadge delta={team.rank_trend_7d} />
        </div>
        {(team.division || team.conference) && (
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
            {team.division} {team.conference ? `· ${team.conference}` : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export function ComparePanel({ data }: ComparePanelProps) {
  const { my_team, rival_team, comparison } = data

  const myPos = my_team.rank_position
  const rivalPos = rival_team.rank_position

  return (
    <div className="space-y-5">
      {/* Two columns */}
      <div className="flex gap-4">
        <TeamColumn team={my_team} side="my" />
        <TeamColumn team={rival_team} side="rival" />
      </div>

      {/* Summary bar */}
      <div className="border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Comparativa directa</h3>

        <div className="space-y-3">
          {/* Rank */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{rankLabel(myPos)}</span>
              <span className="font-medium">Posición</span>
              <span>{rankLabel(rivalPos)}</span>
            </div>
            <MetricBar
              myValue={rivalPos !== null ? (100 - (myPos ?? 100)) : null}
              rivalValue={myPos !== null ? (100 - (rivalPos ?? 100)) : null}
              myBetter={comparison.my_team_better}
            />
          </div>

          {/* Winrate */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{pct(my_team.win_rate)}</span>
              <span className="font-medium">Winrate</span>
              <span>{pct(rival_team.win_rate)}</span>
            </div>
            <MetricBar
              myValue={my_team.win_rate}
              rivalValue={rival_team.win_rate}
              myBetter={(my_team.win_rate ?? 0) >= (rival_team.win_rate ?? 0) ? true : false}
            />
          </div>
        </div>

        {/* Verdict */}
        {comparison.my_team_better !== null && (
          <div className={`text-center text-sm font-medium py-2 rounded-lg ${
            comparison.my_team_better
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {comparison.my_team_better
              ? `Tu equipo está ${comparison.rank_gap} posicione${comparison.rank_gap === 1 ? '' : 's'} por encima`
              : `El rival está ${comparison.rank_gap} posicione${comparison.rank_gap === 1 ? '' : 's'} por encima`}
          </div>
        )}
      </div>
    </div>
  )
}
