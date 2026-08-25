import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserChatterpointsHistory } from 'src/app/api/services/chatterpoints/chatterpoints-serivce'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

import type { IAccount } from 'src/types/account'
import type { GameType, IncludeKind, SocialPlatform } from 'src/types/chatterpoints'

// ----------------------------------------------------------------------

type IParams = { id: string }

const ALLOWED_INCLUDE: readonly IncludeKind[] = ['games', 'operations', 'social', 'prizes'] as const

// ----------------------------------------------------------------------
// Helpers (single-responsibility, no nested loops)

/**
 * Parses a CSV string into a string array, trimming blanks.
 * @param {string | null} raw - Raw CSV string or null.
 * @returns {string[] | undefined} Array of non-empty items or undefined when empty.
 */
function parseCSV(raw: string | null): string[] | undefined {
  if (!raw) return undefined
  const items = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  return items.length > 0 ? items : undefined
}

/**
 * Parses and validates the `include` CSV against allowed values.
 * @param {string | null} raw - Raw CSV from query param.
 * @returns {IncludeKind[] | undefined} Valid include list or undefined if none valid.
 */
/**
 * Parses and validates the `include` CSV against allowed values.
 * @param {string | null} raw - Raw CSV from query param.
 * @returns {IncludeKind[] | undefined} Valid include list or undefined if none valid.
 */
function parseInclude(raw: string | null): IncludeKind[] | undefined {
  const items = parseCSV(raw)
  if (!items) return undefined

  const allowed = new Set<IncludeKind>(ALLOWED_INCLUDE as IncludeKind[])
  const picked = items.filter((it): it is IncludeKind => allowed.has(it as IncludeKind))

  return picked.length > 0 ? picked : undefined
}

// ----------------------------------------------------------------------

/**
 * Returns ChatterPoints history for a given user.
 *
 * Query parameters (all optional):
 * - include: CSV of sections to include. Allowed: games,operations,social,prizes
 * - from: ISO string start (inclusive)
 * - to: ISO string end (inclusive)
 * - gameTypes: CSV of game types (e.g., WORDLE,HANGMAN)
 * - gameIds: CSV of specific game identifiers
 * - platforms: CSV of social platforms (e.g., X,INSTAGRAM,TIKTOK,YOUTUBE)
 *
 * Security and user validations are enforced before calling the backend service.
 *
 * @param {NextRequest} req - Incoming request with optional query parameters.
 * @param {{ params: IParams }} ctx - Route params object with `id`.
 * @returns {Promise<NextResponse>} JSON response with user history or an error payload.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: IParams }
): Promise<NextResponse> {
  try {
    const walletValidationResult = await validateWalletCommonInputs(req, params.id)
    if (walletValidationResult instanceof NextResponse) return walletValidationResult

    const { userId } = walletValidationResult

    const securityCheckResult = await validateRequestSecurity(req, userId)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const user: IAccount | undefined = await getUserById(userId)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that id' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const sp = req.nextUrl.searchParams

    const include = parseInclude(sp.get('include'))
    const from = sp.get('from') ?? undefined
    const to = sp.get('to') ?? undefined
    const gameTypes = parseCSV(sp.get('gameTypes')) as GameType[] | undefined
    const gameIds = parseCSV(sp.get('gameIds'))
    const platforms = parseCSV(sp.get('platforms')) as SocialPlatform[] | undefined

    const data = await getUserChatterpointsHistory(user.id, user.phone_number, {
      include,
      from,
      to,
      gameTypes,
      gameIds,
      platforms
    })

    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error in user chatterpoints history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ----------------------------------------------------------------------
