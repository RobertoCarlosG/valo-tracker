import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Shield,
  Calendar,
  Gamepad2,
  ExternalLink,
  LayoutDashboard,
  GitCompare,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useValorantIdentityStore } from '@/stores/valorantIdentityStore'
import { getMe } from '@/lib/api'
import { useMyTeam } from '@/hooks/useMyTeam'

const REGIONS = [
  { code: 'NA', label: 'NA' },
  { code: 'EU', label: 'EU' },
  { code: 'AP', label: 'AP' },
  { code: 'KR', label: 'KR' },
  { code: 'LATAM', label: 'LATAM' },
  { code: 'BR', label: 'BR' },
]

export default function ProfilePage() {
  const { user: storeUser, setUser } = useAuthStore()
  const { riotName, riotTag, riotRegion, setIdentity, clear } = useValorantIdentityStore()

  const [name, setName] = useState(riotName ?? '')
  const [tag, setTag] = useState(riotTag ?? '')
  const [region, setRegion] = useState(riotRegion ?? 'NA')

  useEffect(() => {
    setName(riotName ?? '')
    setTag(riotTag ?? '')
    setRegion(riotRegion ?? 'NA')
  }, [riotName, riotTag, riotRegion])

  const { data: freshUser, isLoading: loadingMe } = useQuery({
    queryKey: ['users-me-profile'],
    queryFn: getMe,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (freshUser) setUser(freshUser)
  }, [freshUser, setUser])

  const user = freshUser ?? storeUser
  const hasTeam = user?.has_team ?? false

  const { data: teamData, isLoading: loadingTeam } = useMyTeam({
    enabled: hasTeam,
  })

  const playerPath =
    name.trim() && tag.trim()
      ? `/players/${region}/${encodeURIComponent(name.trim())}/${encodeURIComponent(tag.trim())}`
      : null

  const saveRiot = () => {
    if (name.trim() && tag.trim()) setIdentity(name.trim(), tag.trim(), region)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cuenta de la app, equipo Premier y acceso rápido a tu MMR en Valorant.
        </p>
      </div>

      {/* Cuenta */}
      <section className="bg-card border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" /> Cuenta
        </h2>
        {loadingMe && !user ? (
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        ) : user ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nombre visible</dt>
              <dd className="font-medium">{user.display_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="font-medium truncate">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" /> Acceso
              </dt>
              <dd className="font-medium">{user.auth_methods.join(', ')}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Registro
              </dt>
              <dd className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      {/* Equipo Premier */}
      <section className="bg-card border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" /> Equipo Premier
        </h2>
        {!hasTeam ? (
          <p className="text-sm text-muted-foreground">
            Aún no tienes un equipo vinculado.{' '}
            <Link to="/onboarding" className="text-primary font-medium hover:underline">
              Vincular equipo
            </Link>
          </p>
        ) : loadingTeam ? (
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        ) : teamData?.saved_team ? (
          <div className="space-y-3">
            <p className="font-semibold">
              {teamData.saved_team.team_name}{' '}
              <span className="text-muted-foreground font-normal">
                #{teamData.saved_team.team_tag}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {teamData.saved_team.region} · {teamData.saved_team.division ?? '—'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-1.5 text-xs font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                <GitCompare className="w-3.5 h-3.5" /> Comparar
              </Link>
            </div>
          </div>
        ) : (
          <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
            Ir al dashboard
          </Link>
        )}
      </section>

      {/* Riot / MMR */}
      <section className="bg-card border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" /> Mi cuenta Riot (MMR y partidas)
        </h2>
        <p className="text-xs text-muted-foreground">
          Guardamos solo en este navegador tu Riot ID para abrir tu perfil de jugador con un clic.
          No almacenamos tu contraseña de Riot.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Región</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Nombre en juego</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. PlayerName"
                className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tag</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ej. 1234"
                className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveRiot}
            disabled={!name.trim() || !tag.trim()}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Borrar datos guardados
          </button>
          {playerPath && (
            <Link
              to={playerPath}
              className="inline-flex items-center gap-1.5 text-sm font-medium border border-border px-4 py-2 rounded-lg hover:bg-muted"
            >
              Ver MMR y partidas <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      <p className="text-xs text-muted-foreground text-center">
        Para ver el perfil de <strong>cualquier otro jugador</strong>, usa{' '}
        <Link to="/search" className="text-primary hover:underline">
          Búsqueda → Jugadores
        </Link>
        .
      </p>
    </div>
  )
}
