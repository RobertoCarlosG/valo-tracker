import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { useCompare } from '@/hooks/useCompare'
import { ComparePanel } from '@/components/dashboard/ComparePanel'
import { searchTeams } from '@/lib/api'
import type { TeamInfo } from '@/types/api'
import { useTeamStore } from '@/stores/teamStore'

const REGIONS = [
  { code: 'NA', label: 'NA' },
  { code: 'EU', label: 'EU' },
  { code: 'AP', label: 'AP' },
  { code: 'KR', label: 'KR' },
  { code: 'LATAM', label: 'LATAM' },
  { code: 'BR', label: 'BR' },
]

export default function ComparePage() {
  const { region: myRegion } = useTeamStore()

  const [rivalRegion, setRivalRegion] = useState<string>(myRegion ?? 'NA')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TeamInfo[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedRival, setSelectedRival] = useState<TeamInfo | null>(null)

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchTeams({ name: query })
        setResults(res.data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback((team: TeamInfo) => {
    setSelectedRival(team)
    setQuery(team.team_name)
    setResults([])
  }, [])

  const handleClear = useCallback(() => {
    setSelectedRival(null)
    setQuery('')
    setResults([])
  }, [])

  const {
    data: compareData,
    isLoading: comparing,
    isError: compareError,
    error,
  } = useCompare(selectedRival?.team_id ?? null, rivalRegion)

  const axiosError = error as { response?: { data?: { detail?: string } } } | null

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Comparar equipos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Busca un equipo rival para comparar estadísticas con el tuyo.
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-5 mb-6">
        <div className="flex gap-3 mb-4">
          {/* Region selector */}
          <div className="flex gap-1.5 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => { setRivalRegion(r.code); setSelectedRival(null); setQuery(''); setResults([]) }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  rivalRegion === r.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (selectedRival) setSelectedRival(null) }}
            placeholder="Nombre del equipo rival..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {selectedRival && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {results.length > 0 && !selectedRival && (
          <div className="mt-2 border border-border rounded-lg overflow-hidden bg-popover shadow-lg">
            {results.slice(0, 8).map((team) => (
              <button
                key={team.team_id}
                onClick={() => handleSelect(team)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 text-left text-sm transition-colors border-b border-border/50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                  {team.team_tag?.slice(0, 2) ?? '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{team.team_name}</div>
                  <div className="text-xs text-muted-foreground">#{team.team_tag} · {team.division ?? '—'}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && !searching && !selectedRival && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Sin resultados. Intenta con el tag exacto (ej: #SHRP).
          </p>
        )}
      </div>

      {/* Compare result */}
      {!selectedRival && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Busca un equipo rival para comenzar la comparativa.</p>
        </div>
      )}

      {selectedRival && comparing && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedRival && compareError && (
        <div className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            {axiosError?.response?.data?.detail ?? 'No se pudo cargar la comparativa. Intenta de nuevo.'}
          </span>
        </div>
      )}

      {compareData && !comparing && (
        <ComparePanel data={compareData} />
      )}
    </div>
  )
}
