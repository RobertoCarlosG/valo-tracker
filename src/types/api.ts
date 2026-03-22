export interface LeaderboardEntry {
  rank: number
  team_name: string
  team_tag: string
  team_id: string
  division?: string
  conference?: string
  wins: number
  losses: number
  points: number
  logo_url?: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  total: number
  is_demo_limited: boolean
}

export interface TeamMember {
  puuid: string
  name: string
  tag: string
  role?: string
}

export interface TeamInfo {
  team_id: string
  team_name: string
  team_tag: string
  division?: string
  conference?: string
  region: string
  wins: number
  losses: number
  points: number
  logo_url?: string
  members: TeamMember[]
  created_at?: string
}

export interface MatchHistoryEntry {
  match_id: string
  map_name: string
  game_mode: string
  started_at: string
  rounds_won: number
  rounds_lost: number
  result: string
}

export interface TeamHistoryResponse {
  team_info: TeamInfo
  matches: MatchHistoryEntry[]
  is_demo_limited: boolean
}

export interface PlayerMMR {
  current_tier: number
  current_tier_name: string
  ranking_in_tier: number
  mmr_change: number
  elo: number
  games_needed_for_rating: number
}

export interface PlayerProfile {
  puuid: string
  name: string
  tag: string
  account_level: number
  card_url?: string
  mmr?: PlayerMMR
}

export interface SearchResult {
  teams: TeamInfo[]
  total: number
  is_demo_limited: boolean
}

export interface DemoStatus {
  demo_mode: boolean
  limits?: {
    leaderboard: number
    search: number
    match_history: number
  }
}

export interface DemoUser {
  id: number
  email: string
  is_verified: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
