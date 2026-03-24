import { Link } from 'react-router-dom'
import { Trophy, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/store/store'
import { useAuthStore } from '@/stores/authStore'
import { logout } from '@/lib/api'

export function Navbar() {
  const { isDemoMode, setShowDemoModal } = useDemoStore()
  const { isAuthenticated, user } = useAuthStore()

  const handleLogout = () => void logout()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Premier Dashboard</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/leaderboards" className="text-sm hover:text-primary transition">
            Leaderboards
          </Link>
          <Link to="/search" className="text-sm hover:text-primary transition">
            Search
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/onboarding" className="text-sm hover:text-primary transition">
                Mi equipo
              </Link>
              <Link to="/dashboard" className="text-sm hover:text-primary transition">
                Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.display_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              {isDemoMode && (
                <Button size="sm" onClick={() => setShowDemoModal(true)}>
                  Unlock Full Access
                </Button>
              )}
              <Button size="sm" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
