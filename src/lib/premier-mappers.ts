import type { TeamInfo } from '@/types/api'

/** Filas Premier de Henrik (búsqueda / listados sin transformar en backend). */
export function premierRowToTeamInfo(raw: Record<string, unknown>): TeamInfo {
  const customization = raw.customization as { icon?: string } | undefined
  const id = raw.id ?? raw.team_id
  return {
    team_id: id != null ? String(id) : '',
    team_name: String(raw.name ?? raw.team_name ?? 'Unknown'),
    team_tag: String(raw.tag ?? raw.team_tag ?? ''),
    division: typeof raw.division === 'string' ? raw.division : undefined,
    conference: typeof raw.conference === 'string' ? raw.conference : undefined,
    region:
      typeof raw.region === 'string'
        ? raw.region
        : typeof raw.affinity === 'string'
          ? raw.affinity
          : '',
    wins: Number(raw.wins ?? 0),
    losses: Number(raw.losses ?? 0),
    points: Number(raw.score ?? raw.points ?? 0),
    logo_url: customization?.icon,
    members: [],
  }
}
