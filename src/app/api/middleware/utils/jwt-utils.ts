import jwt from 'jsonwebtoken'

import {
  JWT_SECRET,
  CHP_DSH_NAME,
  IS_DEVELOPMENT,
  USER_SESSION_EXPIRATION_MINUTES
} from 'src/config-global'

import type { UserSession } from 'src/types/account'
import type { JwtPayload, jwtPayloadUser } from 'src/types/jwt'

// ----------------------------------------------------------------------

export function generateJwtToken(user: jwtPayloadUser, userSession: UserSession): string {
  const jwtPayload: JwtPayload = { user, accessToken: userSession.token, sessionId: userSession.id }
  const jwtToken = jwt.sign(jwtPayload, JWT_SECRET!, {
    expiresIn: `${USER_SESSION_EXPIRATION_MINUTES}m`
  })
  return jwtToken
}

export function extractjwtTokenFromHeader(
  authHeader: string | undefined | null
): JwtPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
    return decoded
  } catch (error: any) {
    console.error('Invalid JWT:', error.message)
    return null
  }
}

export function extractJwtTokenFromCookie(cookieValue?: string): JwtPayload | null {
  if (!cookieValue) return null
  try {
    return jwt.verify(cookieValue, JWT_SECRET!) as JwtPayload
  } catch (err: any) {
    console.error('Invalid JWT in cookie', err.message)
    return null
  }
}

/**
 * Builds the HttpOnly session cookie settings for the given JWT,
 * shared by the login and refresh endpoints.
 */
export function buildSessionCookie(jwtToken: string) {
  return {
    name: CHP_DSH_NAME,
    value: jwtToken,
    httpOnly: true,
    secure: !IS_DEVELOPMENT,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Number(USER_SESSION_EXPIRATION_MINUTES) * 60
  }
}

export function verifyJwtToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload
  } catch (err: any) {
    console.error('JWT verification failed', err.message)
    throw new Error('Invalid token')
  }
}
