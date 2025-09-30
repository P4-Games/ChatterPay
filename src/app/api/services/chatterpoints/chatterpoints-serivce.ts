import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

import {
  IncludeKind,
  UserHistoryFilters,
  ChatterpointsHistoryResult
} from 'src/types/chatterpoints'

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
): ChatterpointsHistoryResult {
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
 * @returns {Promise<ChatterpointsHistoryResult>}
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
  channel_user_id: string,
  filters: UserHistoryFilters = {}
): Promise<ChatterpointsHistoryResult> {
  const include = (filters.include?.length ? filters.include : DEFAULT_INCLUDE).slice()

  const fromISO = toISO(filters.from) ?? thirtyDaysAgoISO()
  const toISOValue = toISO(filters.to) ?? nowISO()

  const payload = {
    channel_user_id,
    include,
    from: fromISO,
    to: toISOValue,
    gameTypes: filters.gameTypes,
    gameIds: filters.gameIds,
    platforms: filters.platforms
  }

  try {
    const resp = await axios.post<ChatterpointsHistoryResult>(
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
    if (error.code === 'ECONNREFUSED') {
      console.warn(
        `getUserChatterpointsHistory: backend no disponible en ${BACKEND_API_URL}/chatterpoints/user/history`
      )
    } else {
      console.error('getUserChatterpointsHistory: error inesperado', error?.message || error)
    }
    return makeDefaultHistory(include, fromISO, toISOValue)
  }
}
