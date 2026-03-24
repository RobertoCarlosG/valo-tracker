import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { login, register, getGoogleAuthUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verified = searchParams.get('verified') === 'true'

  const { setUser, isAuthenticated, hasTeam } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(hasTeam ? '/dashboard' : '/onboarding', { replace: true })
    }
  }, [isAuthenticated, hasTeam, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await login(email, password)
        if (res.user) {
          const u = res.user
          setUser({
            id: u.id,
            email: u.email,
            display_name: u.display_name,
            role: 'user',
            has_team: u.has_team,
            team_id: u.team_id ?? null,
            auth_methods: ['password'],
            created_at: new Date().toISOString(),
          })
          navigate(u.has_team ? '/dashboard' : '/onboarding', { replace: true })
        }
      } else {
        const res = await register(email, displayName, password)
        setMessage(res.message)
        setMode('login')
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Error inesperado'
      setError(typeof msg === 'string' ? msg : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = getGoogleAuthUrl()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ValoTracker Premier</h1>
          <p className="text-muted-foreground mt-1">Inicia sesión o regístrate</p>
        </div>

        {verified && (
          <div className="rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 p-3 text-sm">
            Email verificado. Ya puedes iniciar sesión.
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-primary/10 text-primary p-3 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium">Nombre de usuario</label>
              <Input
                type="text"
                placeholder="ShadowAce"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={mode === 'register'}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              placeholder="mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} type="button">
          Continuar con Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('register')}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('login')}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>

        <p className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
