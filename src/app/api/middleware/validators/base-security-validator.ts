import { type NextRequest, NextResponse } from 'next/server'

import { CHP_DSH_NAME } from 'src/config-global'
import { getIpFromRequest } from 'src/app/api/middleware/utils/network-utils'
import { extractJwtTokenFromCookie } from 'src/app/api/middleware/utils/jwt-utils'
import { checkUserHaveActiveSession } from 'src/app/api/services/db/chatterpay-db-service'

import type { JwtPayload } from 'src/types/jwt'

// ----------------------------------------------------------------------

type AuthContext = {
  userId: string
  ip: string
  jwtToken: JwtPayload
}

// ----------------------------------------------------------------------

export async function validateRequestSecurity(
  req: NextRequest,
  userId: string
): Promise<AuthContext | NextResponse> {
  const ip = getIpFromRequest(req)

  // 1. Try HttpOnly cookie (new standard)
  const cookie = req.cookies.get(CHP_DSH_NAME)?.value
  const jwtTokenDecoded: JwtPayload | null = cookie ? extractJwtTokenFromCookie(cookie) : null

  // 2. Reject if no valid token
  if (!jwtTokenDecoded) {
    return NextResponse.json(
      { code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' },
      { status: 401 }
    )
  }

  // 3. Check session validity in DB
  const validAccessToken = await checkUserHaveActiveSession(userId, jwtTokenDecoded, ip)
  if (!validAccessToken) {
    return NextResponse.json(
      { code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' },
      { status: 401 }
    )
  }

  return { userId, ip, jwtToken: jwtTokenDecoded }
}
