import { type NextRequest, NextResponse } from 'next/server'

import { getEvents } from 'src/app/api/services/polymarket/polymarket-service'
import {
  validateRequestSecurity,
  getUserIdFromRequest,
  type AuthContext
} from 'src/app/api/middleware/validators/base-security-validator'

// ----------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const { searchParams } = new URL(req.url)

    // Inject user_channel_id from the authenticated session so the frontend
    // never needs to expose the phone number in the request URL.
    const phoneNumber = (securityCheckResult as AuthContext).jwtToken?.user?.phoneNumber
    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, message: 'Missing phoneNumber in session' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    searchParams.set('user_channel_id', phoneNumber)

    const params = searchParams.toString()
    const result = await getEvents(params || undefined)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error fetching events' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
