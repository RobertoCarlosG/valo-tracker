import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TeamSnapshot } from '@/types/api'

interface RankChartProps {
  snapshots: TeamSnapshot[]
  days: 7 | 30 | 90
  onDaysChange: (d: 7 | 30 | 90) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export function RankChart({ snapshots, days, onDaysChange }: RankChartProps) {
  const DAY_OPTIONS: (7 | 30 | 90)[] = [7, 30, 90]

  if (snapshots.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
        <span className="text-2xl">📈</span>
        <p>Los datos empezarán a aparecer después del segundo snapshot (mañana).</p>
      </div>
    )
  }

  const data = snapshots.map((s) => ({
    date: formatDate(s.snapshot_at),
    rank: s.rank_position,
    wins: s.wins,
    losses: s.losses,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Evolución de posición
        </h3>
        <div className="flex gap-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            reversed={true}
            tickFormatter={(v) => `#${v}`}
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(v) => [`#${v}`, 'Posición']}
            labelFormatter={(l) => `Fecha: ${l}`}
          />
          <Line
            type="monotone"
            dataKey="rank"
            stroke="#3B8BD4"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3B8BD4' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
