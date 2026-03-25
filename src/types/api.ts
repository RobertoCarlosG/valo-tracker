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

/** Coincide con GET /api/v1/premier/search (`data`, no `teams`). */
export interface SearchResult {
  data: TeamInfo[]
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
  refresh_token?: string
  token_type: string
  expires_in?: number
  user?: UserOut
}

export interface UserOut {
  id: string
  email: string
  display_name: string
  has_team: boolean
  team_id?: string | null
}

export interface UserMeOut {
  id: string
  email: string
  display_name: string
  role: string
  has_team: boolean
  team_id: string | null
  auth_methods: string[]
  created_at: string
}

// ─────────────────────────────────────────
// My Team / Onboarding
// ─────────────────────────────────────────

export interface SavedTeamOut {
  id: string
  team_id: string
  team_name: string
  team_tag: string
  region: string
  division: string | null
  conference: string | null
  linked_at: string
  is_primary: boolean
}

export interface TeamLiveData {
  rank_position: number | null
  wins: number | null
  losses: number | null
  division: string | null
  conference: string | null
}

export interface RosterMember {
  puuid: string
  name: string
  tag: string
  mmr_current?: number | null
  rank_tier?: string | null
  rr_current?: number | null
}

export interface MyTeamResponse {
  saved_team: SavedTeamOut
  live: TeamLiveData
  roster: RosterMember[]
  last_snapshot_at: string | null
}

export interface TeamLinkRequest {
  team_id: string
  team_name: string
  team_tag: string
  region: string
  division?: string | null
  conference?: string | null
}

export interface TeamLinkResponse {
  team: SavedTeamOut
  initial_snapshot: {
    rank_position: number | null
    wins: number | null
    losses: number | null
  } | null
}

// ─────────────────────────────────────────
// Snapshots / Trends
// ─────────────────────────────────────────

export interface TeamSnapshot {
  snapshot_at: string
  rank_position: number | null
  wins: number | null
  losses: number | null
  points: number | null
}

export interface TeamTrend {
  rank_delta_7d: number | null
  rank_delta_30d: number | null
  win_rate_7d: number | null
  win_rate_30d: number | null
}

export interface TeamSnapshotsResponse {
  team_id: string
  snapshots: TeamSnapshot[]
  trend: TeamTrend
}

export interface PlayerSnapshot {
  snapshot_at: string
  mmr_current: number | null
  rank_tier: string | null
  rr_current: number | null
}

export interface PlayerWithSnapshots {
  puuid: string
  name: string
  tag: string
  snapshots: PlayerSnapshot[]
  trend: {
    mmr_delta_7d: number | null
    mmr_delta_30d: number | null
  }
}

export interface PlayerSnapshotsResponse {
  players: PlayerWithSnapshots[]
}

// ─────────────────────────────────────────
// Search result (de premier search, simplificado para onboarding)
// ─────────────────────────────────────────

export interface PremierTeamResult {
  id: string
  name: string
  tag: string
  division: string | null
  conference: string | null
  region: string | null
  wins: number
  losses: number
  score: number
  placement: number | null
  customization?: {
    icon?: string
    image?: string
    primary_color?: string
  }
}

// ─────────────────────────────────────────
// Comparativas (Fase 4)
// ─────────────────────────────────────────

export interface TeamCompareData {
  name: string
  tag: string
  rank_position: number | null
  wins: number | null
  losses: number | null
  win_rate: number | null
  rank_trend_7d: number | null
  division: string | null
  conference: string | null
}

export interface CompareResponse {
  my_team: TeamCompareData
  rival_team: TeamCompareData
  comparison: {
    rank_gap: number | null
    win_rate_gap: number
    my_team_better: boolean | null
  }
}

// ─────────────────────────────────────────
// Player detail (Fase 4)
// ─────────────────────────────────────────

export interface MMRHistoryPoint {
  date: string
  mmr: number | null
  rank_tier: string | null
  rr: number | null
}

export interface PlayerMatchEntry {
  match_id: string
  map: string | null
  started_at: string | null
  result: string | null
  rounds_won: number | null
  rounds_lost: number | null
}
