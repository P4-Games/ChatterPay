import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

// ---------------------------------------------------------------------------------------------

export type IncludeKind = 'games' | 'operations' | 'social' | 'prizes'

export type GameType = 'WORDLE' | 'HANGMAN' | string
export type SocialPlatform = 'X' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | string

export interface UserHistoryFilters {
  include?: IncludeKind[]
  from?: string | Date
  to?: string | Date
  gameTypes?: GameType[]
  gameIds?: string[]
  platforms?: SocialPlatform[]
}

export interface UserGamePlay {
  cycleId: string
  periodId: string
  gameId: string
  gameType: GameType
  at: string // ISO
  guess?: string
  result?: string
  points: number
  won: boolean
}

export interface UserOperationEntry {
  cycleId: string
  type: string
  amount: number
  userLevel?: string
  points: number
  at: string // ISO
}

export interface UserSocialAction {
  cycleId: string
  platform: SocialPlatform
  action: string
  points: number
  at: string // ISO
}

export interface UserPrize {
  cycleId: string
  rank: number // 1..3
  prize: number
  totalPoints: number
  endAt: string // ISO
}

export interface UserHistoryResult {
  status?: 'ok' | 'error'
  include: IncludeKind[]
  window: { from: string; to: string }
  games?: UserGamePlay[]
  operations?: UserOperationEntry[]
  social?: UserSocialAction[]
  prizes?: UserPrize[]
  totals: {
    games: number
    operations: number
    social: number
    grandTotal: number
  }
}

// ---------------------------------------------------------------------------------------------

const DEFAULT_INCLUDE: IncludeKind[] = ['games', 'operations', 'social', 'prizes']

function toISO(value?: string | Date): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString()
  const d = new Date(value)
  // Use Number.isNaN per Airbnb rule
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

function thirtyDaysAgoISO(): string {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
}

function nowISO(): string {
  return new Date().toISOString()
}

function makeDefaultHistory(
  include: IncludeKind[],
  fromISO: string,
  toISOValue: string
): UserHistoryResult {
  return {
    status: 'error',
    include,
    window: { from: fromISO, to: toISOValue },
    games: [],
    operations: [],
    social: [],
    prizes: [],
    totals: { games: 0, operations: 0, social: 0, grandTotal: 0 }
  }
}

// ---------------------------------------------------------------------------------------------

/**
 * Fetches ChatterPoints history for a user from the backend.
 *
 * Sends a POST request to:
 * `${BACKEND_API_URL}/chatterpoints/user/history`
 *
 * Request body:
 * `{ userId, include, from, to, gameTypes, gameIds, platforms }`
 *
 * On failure, returns a safe empty structure with `status: 'error'`.
 *
 * @param {string} userId
 *   The internal user identifier whose history will be fetched.
 *
 * @param {UserHistoryFilters} [filters={}]
 *   Optional filters to constrain the history window and included sections.
 *
 * @param {IncludeKind[]} [filters.include]
 *   Sections to include in the response. Allowed values: `'games' | 'operations' | 'social' | 'prizes'`.
 *   Defaults to all sections when omitted.
 *
 * @param {(string|Date)} [filters.from]
 *   Start of the time window (inclusive). Accepts an ISO string or `Date`.
 *   Defaults to 30 days ago if omitted or invalid.
 *
 * @param {(string|Date)} [filters.to]
 *   End of the time window (inclusive). Accepts an ISO string or `Date`.
 *   Defaults to “now” if omitted or invalid.
 *
 * @param {GameType[]} [filters.gameTypes]
 *   Optional game types to filter (e.g., `['WORDLE','HANGMAN']`).
 *
 * @param {string[]} [filters.gameIds]
 *   Optional specific game identifiers to filter (implementation-defined).
 *
 * @param {SocialPlatform[]} [filters.platforms]
 *   Optional social platforms to filter (e.g., `['X','INSTAGRAM','TIKTOK','YOUTUBE']`).
 *
 * @returns {Promise<UserHistoryResult>}
 *   Resolves with the history payload returned by the backend.
 *   If the backend call fails or is non-2xx, returns an object with empty lists and `status: 'error'`.
 *
 * @example
 * // Minimal call (defaults: last 30 days, all sections)
 * const history = await getUserChatterpointsHistory('user_123');
 *
 * @example
 * // Custom window and sections
 * const history = await getUserChatterpointsHistory('user_123', {
 *   include: ['games','operations'],
 *   from: '2025-09-01T00:00:00.000Z',
 *   to:   '2025-09-28T23:59:59.999Z',
 *   gameTypes: ['WORDLE']
 * });
 */
export async function getUserChatterpointsHistory(
  userId: string,
  filters: UserHistoryFilters = {}
): Promise<UserHistoryResult> {
  const include = (filters.include?.length ? filters.include : DEFAULT_INCLUDE).slice()

  const fromISO = toISO(filters.from) ?? thirtyDaysAgoISO()
  const toISOValue = toISO(filters.to) ?? nowISO()

  const payload = {
    userId,
    include,
    from: fromISO,
    to: toISOValue,
    gameTypes: filters.gameTypes,
    gameIds: filters.gameIds,
    platforms: filters.platforms
  }

  try {
    const resp = await axios.post<UserHistoryResult>(
      `${BACKEND_API_URL}/chatterpoints/user/history`,
      payload,
      {
        headers: {
          Origin: UI_BASE_URL,
          Authorization: `Bearer ${BACKEND_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      }
    )

    if (resp.status >= 200 && resp.status < 300 && resp.data) {
      const { data } = resp
      data.include = Array.isArray(data.include) && data.include.length ? data.include : include
      if (!data.window?.from || !data.window?.to) {
        data.window = { from: fromISO, to: toISOValue }
      }
      if (!data.totals) {
        data.totals = { games: 0, operations: 0, social: 0, grandTotal: 0 }
      }
      return data
    }

    console.error(
      'getUserChatterpointsHistory: backend responded with non-2xx',
      resp.status,
      resp.data
    )
    return makeDefaultHistory(include, fromISO, toISOValue)
  } catch (error: any) {
    console.error('getUserChatterpointsHistory: error calling backend', error?.message || error)
    return makeDefaultHistory(include, fromISO, toISOValue)
  }
}
