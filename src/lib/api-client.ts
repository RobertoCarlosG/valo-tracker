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
import { premierRowToTeamInfo } from '@/lib/premier-mappers'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })
  }

  async getLeaderboard(
    region: string,
    conference?: string,
    division?: string
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams()
    if (conference) params.append('conference', conference)
    if (division) params.append('division', division)

    const { data } = await this.client.get(
      `/api/v1/premier/leaderboard/${region}?${params.toString()}`
    )
    return data
  }

  async searchTeams(params: {
    name?: string
    tag?: string
    division?: string
    conference?: string
  }): Promise<SearchResult> {
    const { data } = await this.client.get<{
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

  async getPlayerMMR(region: string, name: string, tag: string) {
    const { data } = await this.client.get(`/api/v1/players/mmr/${region}/${name}/${tag}`)
    return data
  }

  async getPlayerMatches(region: string, name: string, tag: string, mode?: string) {
    const params = mode ? { mode } : {}
    const { data } = await this.client.get(`/api/v1/players/matches/${region}/${name}/${tag}`, {
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

  async getSeasons(region: string) {
    const { data } = await this.client.get(`/api/v1/premier/seasons/${region}`)
    return data
  }
}

export const apiClient = new ApiClient()
