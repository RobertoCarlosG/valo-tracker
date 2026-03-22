import { Link } from 'react-router-dom'
import { Trophy, Users, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/store/store'

export function Navbar() {
  const { isDemoMode, setShowDemoModal } = useDemoStore()

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
          <Link to="/teams" className="text-sm hover:text-primary transition">
            Teams
          </Link>
          <Link to="/search" className="text-sm hover:text-primary transition">
            Search
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {isDemoMode && (
            <Button size="sm" onClick={() => setShowDemoModal(true)}>
              Unlock Full Access
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
