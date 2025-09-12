import { NextRequest, NextResponse } from 'next/server'

import { CHP_DSH_NAME } from 'src/config-global'
import { getIpFromRequest } from 'src/app/api/middleware/utils/network-utils'
import { checkUserHaveActiveSession } from 'src/app/api/services/db/chatterpay-db-service'
import {
  extractJwtTokenFromCookie,
  extractjwtTokenFromHeader
} from 'src/app/api/middleware/utils/jwt-utils'

import { JwtPayload } from 'src/types/jwt'

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

  // Try Authorization header first (legacy)
  let jwtTokenDecoded: JwtPayload | null = extractjwtTokenFromHeader(
    req.headers.get('Authorization')
  )

  // If no header, try HttpOnly cookie
  if (!jwtTokenDecoded) {
    const cookie = req.cookies.get(CHP_DSH_NAME)?.value
    if (cookie) {
      jwtTokenDecoded = extractJwtTokenFromCookie(cookie)
    }
  }

  if (!jwtTokenDecoded) {
    return NextResponse.json(
      { code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' },
      { status: 401 }
    )
  }

  const validAccessToken = await checkUserHaveActiveSession(userId, jwtTokenDecoded, ip)
  if (!validAccessToken) {
    return NextResponse.json(
      { code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' },
      { status: 401 }
    )
  }

  return { userId, ip, jwtToken: jwtTokenDecoded }
}
