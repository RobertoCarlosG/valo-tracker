import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle, Trophy, Users, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTeamStore } from '@/stores/teamStore'
import { searchTeams, linkTeam } from '@/lib/api'
import type { TeamInfo } from '@/types/api'

// ─────────────────────────────────────────
// StepNav
// ─────────────────────────────────────────

const STEP_LABELS = ['Autenticado', 'Región', 'Buscar equipo', 'Confirmar', 'Listo']

function StepNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                i < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : i === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-transparent border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`mt-1 text-[10px] hidden sm:block ${
                i === currentStep ? 'text-blue-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`h-0.5 w-10 sm:w-16 mx-0.5 mb-3 transition-colors ${
                i < currentStep ? 'bg-green-500' : 'bg-muted-foreground/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Regions
// ─────────────────────────────────────────

const REGIONS = [
  { code: 'NA', label: 'NA', sublabel: 'North America' },
  { code: 'EU', label: 'EU', sublabel: 'Europe' },
  { code: 'AP', label: 'AP', sublabel: 'Asia Pacific' },
  { code: 'KR', label: 'KR', sublabel: 'Korea' },
  { code: 'LATAM', label: 'LATAM', sublabel: 'Latin America' },
  { code: 'BR', label: 'BR', sublabel: 'Brazil' },
]

// ─────────────────────────────────────────
// Main Onboarding
// ─────────────────────────────────────────

interface OnboardingState {
  step: number
  region: string | null
  query: string
  results: TeamInfo[]
  team: TeamInfo | null
  loading: boolean
  error: string | null
  linking: boolean
}

export default function OnboardingPage() {
  const { user, setHasTeam } = useAuthStore()
  const { setRegion, setTeam: setStoreTeam, region: storedRegion, savedTeam: storedSavedTeam } = useTeamStore()
  const navigate = useNavigate()

  const [state, setState] = useState<OnboardingState>({
    step: storedSavedTeam ? 4 : storedRegion ? 1 : 0,
    region: storedRegion,
    query: '',
    results: [],
    team: null,
    loading: false,
    error: null,
    linking: false,
  })

  const update = (patch: Partial<OnboardingState>) =>
    setState((prev) => ({ ...prev, ...patch }))

  // Debounced search
  useEffect(() => {
    if (state.step !== 2 || state.query.trim().length < 2) {
      update({ results: [] })
      return
    }
    const timer = setTimeout(async () => {
      update({ loading: true, error: null })
      try {
        // Henrik /premier/search: `division` es número 1–20, no la región (NA/EU). No enviar region ahí.
        const res = await searchTeams({ name: state.query })
        update({ results: res.data, loading: false })
      } catch {
        update({ loading: false, error: 'No se pudo buscar. Intenta de nuevo.' })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [state.query, state.step, state.region])

  const handleRegionSelect = useCallback((code: string) => {
    update({ region: code })
    setRegion(code)
  }, [setRegion])

  const handleTeamSelect = useCallback((team: TeamInfo) => {
    update({ team })
  }, [])

  const handleLinkTeam = useCallback(async () => {
    if (!state.team || !state.region) return
    update({ linking: true, error: null })
    try {
      const response = await linkTeam({
        team_id: state.team.team_id,
        team_name: state.team.team_name,
        team_tag: state.team.team_tag,
        region: state.region,
        division: state.team.division ?? null,
        conference: state.team.conference ?? null,
      })
      setStoreTeam(response.team)
      setHasTeam(true)
      update({ step: 4, linking: false })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      const detail = axiosErr?.response?.data?.detail ?? ''
      if (detail.includes('already')) {
        setHasTeam(true)
        update({ step: 4, linking: false })
      } else {
        update({ linking: false, error: 'No se pudo vincular el equipo. Intenta de nuevo.' })
      }
    }
  }, [state.team, state.region, setStoreTeam, setHasTeam])

  const { step } = state

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start pt-12 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Vincula tu equipo</h1>
          <p className="text-muted-foreground mt-2">
            Hola, {user?.display_name ?? 'Usuario'} — Configura tu seguimiento Premier.
          </p>
        </div>

        <StepNav currentStep={step} />

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {/* Step 0: skip (auto) — not needed since step starts at 0 = 1 */}
          {step === 0 && <StepRegion region={state.region} onSelect={handleRegionSelect} onContinue={() => update({ step: 1 })} />}
          {step === 1 && (
            <StepRegion
              region={state.region}
              onSelect={handleRegionSelect}
              onContinue={() => update({ step: 2 })}
            />
          )}
          {step === 2 && (
            <StepSearch
              region={state.region!}
              query={state.query}
              results={state.results}
              selected={state.team}
              loading={state.loading}
              error={state.error}
              onQueryChange={(q) => update({ query: q, team: null })}
              onSelect={handleTeamSelect}
              onBack={() => update({ step: 1 })}
              onContinue={() => update({ step: 3 })}
            />
          )}
          {step === 3 && (
            <StepConfirm
              team={state.team!}
              region={state.region!}
              linking={state.linking}
              error={state.error}
              onBack={() => update({ step: 2 })}
              onLink={handleLinkTeam}
            />
          )}
          {step === 4 && (
            <StepDone
              team={state.team ?? null}
              onDashboard={() => navigate('/dashboard', { replace: true })}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Step 1/2: Región
// ─────────────────────────────────────────

function StepRegion({
  region,
  onSelect,
  onContinue,
}: {
  region: string | null
  onSelect: (code: string) => void
  onContinue: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Elige tu región</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Filtra la búsqueda de equipos por región Premier.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {REGIONS.map((r) => (
          <button
            key={r.code}
            onClick={() => onSelect(r.code)}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              region === r.code
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="font-bold text-sm">{r.label}</div>
            <div className="text-xs text-muted-foreground">{r.sublabel}</div>
          </button>
        ))}
      </div>
      <button
        disabled={!region}
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

// ─────────────────────────────────────────
// Step 3: Buscar equipo
// ─────────────────────────────────────────

function StepSearch({
  region,
  query,
  results,
  selected,
  loading,
  error,
  onQueryChange,
  onSelect,
  onBack,
  onContinue,
}: {
  region: string
  query: string
  results: TeamInfo[]
  selected: TeamInfo | null
  loading: boolean
  error: string | null
  onQueryChange: (q: string) => void
  onSelect: (t: TeamInfo) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Busca tu equipo</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Región: <span className="font-medium text-foreground">{region}</span> — Escribe el nombre o tag de tu equipo.
      </p>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Nombre del equipo o #TAG..."
          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {results.length === 0 && query.length >= 2 && !loading && (
        <p className="text-sm text-muted-foreground mb-3">
          Sin resultados. Intenta con el tag exacto (ej: #SHRP).
        </p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto mb-6 pr-1">
        {results.map((team) => (
          <button
            key={team.team_id}
            onClick={() => onSelect(team)}
            className={`w-full rounded-lg border p-3 flex items-center gap-3 text-left transition-all ${
              selected?.team_id === team.team_id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
              {team.team_tag?.slice(0, 2) ?? team.team_name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{team.team_name}</div>
              <div className="text-xs text-muted-foreground">{team.team_tag} · {team.division ?? '—'}</div>
            </div>
            {selected?.team_id === team.team_id && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-border hover:bg-accent text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Atrás
        </button>
        <button
          disabled={!selected}
          onClick={onContinue}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Step 4: Confirmar
// ─────────────────────────────────────────

function StepConfirm({
  team,
  region,
  linking,
  error,
  onBack,
  onLink,
}: {
  team: TeamInfo
  region: string
  linking: boolean
  error: string | null
  onBack: () => void
  onLink: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Confirma tu equipo</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Revisa los datos antes de vincular.
      </p>

      <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-base font-bold text-blue-400">
              {team.team_tag?.slice(0, 2) ?? team.team_name.slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold">{team.team_name}</div>
              <div className="text-sm text-muted-foreground">#{team.team_tag} · {region}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-background rounded p-2">
              <div className="font-semibold">{team.division ?? '—'}</div>
            <div className="text-xs text-muted-foreground">División</div>
          </div>
          <div className="bg-background rounded p-2">
            <div className="font-semibold text-green-400">{team.wins ?? 0}W</div>
            <div className="text-xs text-muted-foreground">Victorias</div>
          </div>
          <div className="bg-background rounded p-2">
            <div className="font-semibold text-red-400">{team.losses ?? 0}L</div>
            <div className="text-xs text-muted-foreground">Derrotas</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-sm text-blue-300 mb-5">
        Los snapshots empezarán hoy. Necesitas 7+ días de datos para ver gráficas de tendencia completas.
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          disabled={linking}
          onClick={onBack}
          className="flex-1 border border-border hover:bg-accent text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
        >
          Atrás
        </button>
        <button
          disabled={linking}
          onClick={onLink}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Vincular equipo
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Step 5: Listo
// ─────────────────────────────────────────

function StepDone({ team, onDashboard }: { team: TeamInfo | null; onDashboard: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-1">¡Equipo vinculado!</h2>
      {team && (
        <p className="text-muted-foreground text-sm mb-6">
          <span className="font-medium text-foreground">{team.team_name}</span> está siendo rastreado.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
        <div className="bg-muted/30 rounded-lg p-3">
          <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="font-semibold">{team ? `${team.wins}W` : '—'}</div>
          <div className="text-xs text-muted-foreground">Victorias</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="font-semibold">5</div>
          <div className="text-xs text-muted-foreground">Jugadores</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="font-semibold">~24h</div>
          <div className="text-xs text-muted-foreground">Próx. snapshot</div>
        </div>
      </div>

      <button
        onClick={onDashboard}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        Ver mi dashboard
      </button>
    </div>
  )
}
