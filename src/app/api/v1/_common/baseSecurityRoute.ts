import { NextRequest, NextResponse } from 'next/server'

import { getIpFromRequest } from 'src/app/api/_utils/request-utils'
import { extractjwtTokenFromHeader } from 'src/app/api/_utils/jwt-utils'
import { checkUserHaveActiveSession } from 'src/app/api/_data/data-service'

import { JwtPayload } from 'src/types/jwt'

type AuthContext = {
  userId: string
  ip: string
  jwtToken: JwtPayload
}

export async function validateRequestSecurity(
  req: NextRequest,
  userId: string
): Promise<AuthContext | NextResponse> {
  const ip = getIpFromRequest(req)
  const jwtTokenDecoded: JwtPayload | null = extractjwtTokenFromHeader(
    req.headers.get('Authorization')
  )

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
