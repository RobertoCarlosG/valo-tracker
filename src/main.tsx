import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './components/auth/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import LeaderboardsPage from './pages/LeaderboardsPage'
import SearchPage from './pages/SearchPage'
import TeamDetailPage from './pages/TeamDetailPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import ComparePage from './pages/ComparePage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="leaderboards" element={<LeaderboardsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="teams/:teamId" element={<TeamDetailPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute requireTeam>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute requireTeam={false}>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="compare"
                element={
                  <ProtectedRoute requireTeam>
                    <ComparePage />
                  </ProtectedRoute>
                }
              />
              <Route path="players/:region/:name/:tag" element={<PlayerDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
