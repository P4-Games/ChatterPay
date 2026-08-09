import { type NextRequest, NextResponse } from 'next/server'

import { getIpFromRequest } from 'src/app/api/middleware/utils/network-utils'
import { CHP_DSH_NAME, USER_SESSION_ABSOLUTE_HOURS } from 'src/config-global'
import {
  getUserSession,
  checkUserHaveActiveSession
} from 'src/app/api/services/db/chatterpay-db-service'
import {
  generateJwtToken,
  buildSessionCookie,
  extractJwtTokenFromCookie
} from 'src/app/api/middleware/utils/jwt-utils'

import type { UserSession } from 'src/types/account'

// ----------------------------------------------------------------------

const notAuthorized = () =>
  NextResponse.json(
    { code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  )

/**
 * Sliding session renewal: re-issues the session JWT cookie while the user is
 * active, capped at USER_SESSION_ABSOLUTE_HOURS from the session creation date.
 */
export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get(CHP_DSH_NAME)?.value
    const jwtTokenDecoded = cookie ? extractJwtTokenFromCookie(cookie) : null

    if (!jwtTokenDecoded?.user?.id || !jwtTokenDecoded.sessionId) {
      return notAuthorized()
    }

    const userId = jwtTokenDecoded.user.id
    const ip = getIpFromRequest(req)

    const validAccessToken = await checkUserHaveActiveSession(userId, jwtTokenDecoded, ip)
    if (!validAccessToken) {
      return notAuthorized()
    }

    // Absolute cap: never renew beyond USER_SESSION_ABSOLUTE_HOURS from session creation
    const session = await getUserSession(userId, jwtTokenDecoded.sessionId)
    if (!session) {
      return notAuthorized()
    }

    const creationDate = new Date(
      (session.creationDate as { $date: string })?.$date || (session.creationDate as string)
    )
    const absoluteLimit = creationDate.getTime() + USER_SESSION_ABSOLUTE_HOURS * 60 * 60 * 1000
    if (Number.isNaN(creationDate.getTime()) || Date.now() > absoluteLimit) {
      return notAuthorized()
    }

    const renewedJwtToken = generateJwtToken(jwtTokenDecoded.user, {
      id: jwtTokenDecoded.sessionId,
      token: jwtTokenDecoded.accessToken
    } as UserSession)

    const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    res.cookies.set(buildSessionCookie(renewedJwtToken))
    return res
  } catch (ex) {
    console.error('refresh session error', ex)
    return notAuthorized()
  }
}
