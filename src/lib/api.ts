/**
 * Cliente API con soporte de auth (httpOnly cookies).
 * credentials: 'include' para enviar cookies en todas las peticiones.
 */
import axios, { type AxiosInstance } from 'axios'
import type {
  LeaderboardResponse,
  TeamInfo,
  SearchResult,
  PlayerProfile,
  DemoStatus,
  DemoUser,
  TokenResponse,
  UserMeOut,
  MyTeamResponse,
  TeamLinkRequest,
  TeamLinkResponse,
  TeamSnapshotsResponse,
  PlayerSnapshotsResponse,
} from '@/types/api'
import { premierRowToTeamInfo } from '@/lib/premier-mappers'
import { useAuthStore } from '@/stores/authStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // mantener para cookies en mismo dominio / dev local
})

// Enviar Bearer token desde el store cuando esté disponible (cross-origin).
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const body = refreshToken ? { refresh_token: refreshToken } : {}
        const { data } = await api.post('/auth/refresh', body)
        if (data.access_token) {
          useAuthStore
            .getState()
            .setTokens(data.access_token, data.refresh_token ?? refreshToken ?? '')
        }
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// --- Auth ---

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password })
  return data
}

export async function register(
  email: string,
  display_name: string,
  password: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/register', {
    email,
    display_name,
    password,
  })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
  useAuthStore.getState().logout()
}

export async function getMe(): Promise<UserMeOut | null> {
  try {
    const { data } = await api.get<UserMeOut>('/users/me')
    return data
  } catch {
    return null
  }
}

export function getGoogleAuthUrl(): string {
  return `${baseURL}/auth/google`
}

// --- Premier / Teams / Players (delegar al api-client existente para compatibilidad) ---

export async function getLeaderboard(
  affinity: string,
  conference?: string,
  division?: string
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams()
  if (conference) params.append('conference', conference)
  if (division) params.append('division', division)
  const { data } = await api.get<LeaderboardResponse>(
    `/api/v1/premier/leaderboard/${affinity}?${params.toString()}`
  )
  return data
}

/** Búsqueda Premier. `division` es el número de división (1–20), no la región NA/EU. */
export async function searchTeams(params: {
  name?: string
  tag?: string
  division?: string
  conference?: string
}): Promise<SearchResult> {
  const { data } = await api.get<{
    data?: Record<string, unknown>[]
    total?: number
    is_demo_limited?: boolean
  }>('/api/v1/premier/search', { params })
  const rows = Array.isArray(data.data) ? data.data : []
  return {
    data: rows.map((row) => premierRowToTeamInfo(row)),
    total: data.total ?? rows.length,
    is_demo_limited: Boolean(data.is_demo_limited),
  }
}

export async function getTeamByName(teamName: string, teamTag: string): Promise<TeamInfo> {
  const { data } = await api.get<TeamInfo>(`/api/v1/teams/name/${teamName}/${teamTag}`)
  return data
}

export async function getTeamById(teamId: string): Promise<unknown> {
  const { data } = await api.get(`/api/v1/teams/id/${teamId}`)
  return data
}

export async function getPlayerAccount(name: string, tag: string): Promise<PlayerProfile> {
  const { data } = await api.get<PlayerProfile>(`/api/v1/players/account/${name}/${tag}`)
  return data
}

// ─────────────────────────────────────────
// My Team
// ─────────────────────────────────────────

export async function linkTeam(body: TeamLinkRequest): Promise<TeamLinkResponse> {
  const { data } = await api.post<TeamLinkResponse>('/api/v1/my-team/link', body)
  return data
}

export async function getMyTeam(): Promise<MyTeamResponse> {
  const { data } = await api.get<MyTeamResponse>('/api/v1/my-team')
  return data
}

export async function getTeamSnapshots(days = 30): Promise<TeamSnapshotsResponse> {
  const { data } = await api.get<TeamSnapshotsResponse>(`/api/v1/my-team/snapshots?days=${days}`)
  return data
}

export async function getPlayerSnapshots(days = 14): Promise<PlayerSnapshotsResponse> {
  const { data } = await api.get<PlayerSnapshotsResponse>(`/api/v1/my-team/players/snapshots?days=${days}`)
  return data
}

export async function unlinkTeam(): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>('/api/v1/my-team')
  return data
}

// ─────────────────────────────────────────
// Demo
// ─────────────────────────────────────────

export async function getDemoStatus(): Promise<DemoStatus> {
  const { data } = await api.get<DemoStatus>('/api/v1/demo/status')
  return data
}

export async function requestDemoAccess(email: string): Promise<DemoUser> {
  const { data } = await api.post<DemoUser>('/api/v1/demo/request-access', { email })
  return data
}
