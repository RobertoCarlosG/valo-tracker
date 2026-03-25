import { TrendingUp, Star, Trophy, Info } from 'lucide-react'
import type { TeamSnapshot, PlayerWithSnapshots } from '@/types/api'

interface Insight {
  type: 'success' | 'info' | 'warning'
  message: string
  icon: 'arrow-up' | 'star' | 'trophy' | 'info'
}

interface InsightBannerProps {
  teamSnapshots: TeamSnapshot[]
  playerSnapshots: PlayerWithSnapshots[]
}

function calcRankDelta(snapshots: TeamSnapshot[], _days: number): number | null {
  const now = Date.now()
  const cutoff = now - _days * 24 * 60 * 60 * 1000
  const recent = snapshots.filter((s) => new Date(s.snapshot_at).getTime() >= cutoff)
  if (recent.length < 2) return null
  const first = recent[0].rank_position
  const last = recent[recent.length - 1].rank_position
  if (first == null || last == null) return null
  return last - first // negative = improved (lower rank number = better)
}

function calcWinRate(snapshots: TeamSnapshot[], _days: number): number | null {
  const now = Date.now()
  const cutoff = now - _days * 24 * 60 * 60 * 1000
  const recent = snapshots.filter((s) => new Date(s.snapshot_at).getTime() >= cutoff)
  if (recent.length === 0) return null
  const last = recent[recent.length - 1]
  if (last.wins == null || last.losses == null) return null
  const total = last.wins + last.losses
  return total === 0 ? null : last.wins / total
}

function findBestMMRGain(players: PlayerWithSnapshots[], _days: number) {
  let best: { name: string; mmrDelta: number } | null = null
  for (const p of players) {
    const delta = p.trend.mmr_delta_7d
    if (delta != null && (best === null || delta > best.mmrDelta)) {
      best = { name: p.name, mmrDelta: delta }
    }
  }
  return best
}

function generateInsights(
  teamSnapshots: TeamSnapshot[],
  playerSnapshots: PlayerWithSnapshots[]
): Insight[] {
  const insights: Insight[] = []

  const rankDelta7d = calcRankDelta(teamSnapshots, 7)
  if (rankDelta7d !== null && rankDelta7d <= -3) {
    insights.push({
      type: 'success',
      message: `Subieron ${Math.abs(rankDelta7d)} posiciones esta semana`,
      icon: 'arrow-up',
    })
  }

  const bestPlayer = findBestMMRGain(playerSnapshots, 7)
  if (bestPlayer && bestPlayer.mmrDelta > 50) {
    insights.push({
      type: 'info',
      message: `${bestPlayer.name} ganó +${bestPlayer.mmrDelta} MMR esta semana`,
      icon: 'star',
    })
  }

  const winRate7d = calcWinRate(teamSnapshots, 7)
  if (winRate7d !== null && winRate7d >= 0.75) {
    insights.push({
      type: 'success',
      message: `Win rate del ${Math.round(winRate7d * 100)}% en los últimos 7 días`,
      icon: 'trophy',
    })
  }

  return insights
}

const ICON_MAP = {
  'arrow-up': TrendingUp,
  star: Star,
  trophy: Trophy,
  info: Info,
}

const COLOR_MAP = {
  success: 'bg-green-500/10 border-green-500/20 text-green-300',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
}

const ICON_COLOR_MAP = {
  success: 'text-green-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
}

export function InsightBanner({ teamSnapshots, playerSnapshots }: InsightBannerProps) {
  const insights = generateInsights(teamSnapshots, playerSnapshots)

  if (insights.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Sigue jugando para ver tus primeros insights.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => {
        const Icon = ICON_MAP[ins.icon]
        return (
          <div
            key={i}
            className={`flex items-center gap-3 border rounded-lg px-4 py-3 text-sm ${COLOR_MAP[ins.type]}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_COLOR_MAP[ins.type]}`} />
            <span>{ins.message}</span>
          </div>
        )
      })}
    </div>
  )
}
