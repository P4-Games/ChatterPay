import type { IPolymarketTeam } from 'src/types/polymarket'

// ----------------------------------------------------------------------

/**
 * Resolve the single team logo matching a market's label (e.g. group_item_title
 * "England" → England flag). Returns undefined when zero or multiple teams match
 * (e.g. "Draw (England vs. Argentina)" matches both), so callers can fall back.
 * @param {IPolymarketTeam[] | undefined} teams - Event teams, if any.
 * @param {string} label - Market label to match against team names.
 * @returns {string | undefined} The matched team's logo URL.
 */
export function matchTeamLogo(
  teams: IPolymarketTeam[] | undefined,
  label: string
): string | undefined {
  if (!teams?.length || !label) return undefined
  const lower = label.toLowerCase()
  const matches = teams.filter((tm) => tm.name && lower.includes(tm.name.toLowerCase()))
  return matches.length === 1 ? matches[0].logo : undefined
}
