import axios, { AxiosInstance } from 'axios'
import type {
  LeaderboardResponse,
  TeamInfo,
  SearchResult,
  PlayerProfile,
  DemoStatus,
  DemoUser,
  TokenResponse,
} from '@/types/api'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.token = localStorage.getItem('access_token')

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('access_token')
  }

  async getLeaderboard(
    affinity: string,
    conference?: string,
    division?: string
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams()
    if (conference) params.append('conference', conference)
    if (division) params.append('division', division)

    const { data } = await this.client.get(
      `/api/v1/premier/leaderboard/${affinity}?${params.toString()}`
    )
    return data
  }

  async searchTeams(params: {
    name?: string
    tag?: string
    division?: string
    conference?: string
  }): Promise<SearchResult> {
    const { data } = await this.client.get('/api/v1/premier/search', { params })
    return data
  }

  async getTeamByName(teamName: string, teamTag: string): Promise<TeamInfo> {
    const { data } = await this.client.get(`/api/v1/teams/name/${teamName}/${teamTag}`)
    return data
  }

  async getTeamById(teamId: string): Promise<unknown> {
    const { data } = await this.client.get(`/api/v1/teams/id/${teamId}`)
    return data
  }

  async getTeamHistoryByName(teamName: string, teamTag: string) {
    const { data } = await this.client.get(`/api/v1/teams/name/${teamName}/${teamTag}/history`)
    return data
  }

  async getTeamHistoryById(teamId: string) {
    const { data } = await this.client.get(`/api/v1/teams/id/${teamId}/history`)
    return data
  }

  async getPlayerAccount(name: string, tag: string): Promise<PlayerProfile> {
    const { data } = await this.client.get(`/api/v1/players/account/${name}/${tag}`)
    return data
  }

  async getPlayerMMR(affinity: string, name: string, tag: string) {
    const { data } = await this.client.get(`/api/v1/players/mmr/${affinity}/${name}/${tag}`)
    return data
  }

  async getPlayerMatches(affinity: string, name: string, tag: string, mode?: string) {
    const params = mode ? { mode } : {}
    const { data } = await this.client.get(`/api/v1/players/matches/${affinity}/${name}/${tag}`, {
      params,
    })
    return data
  }

  async getMatchDetails(matchId: string) {
    const { data } = await this.client.get(`/api/v1/players/match/${matchId}`)
    return data
  }

  async getDemoStatus(): Promise<DemoStatus> {
    const { data } = await this.client.get('/api/v1/demo/status')
    return data
  }

  async requestDemoAccess(email: string): Promise<DemoUser> {
    const { data } = await this.client.post('/api/v1/demo/request-access', { email })
    return data
  }

  async verifyEmail(token: string): Promise<TokenResponse> {
    const { data } = await this.client.get(`/api/v1/demo/verify?token=${token}`)
    return data
  }

  async getConferences() {
    const { data } = await this.client.get('/api/v1/premier/conferences')
    return data
  }

  async getSeasons(affinity: string) {
    const { data } = await this.client.get(`/api/v1/premier/seasons/${affinity}`)
    return data
  }
}

export const apiClient = new ApiClient()
