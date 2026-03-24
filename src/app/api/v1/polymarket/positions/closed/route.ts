import { type NextRequest, NextResponse } from 'next/server'

import { getClosedPositions } from 'src/app/api/services/polymarket/polymarket-service'
import { validateRequestSecurity, getUserIdFromRequest } from 'src/app/api/middleware/validators/base-security-validator'

// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const phoneNumber = securityCheckResult.jwtToken?.user?.phoneNumber
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Missing phoneNumber in session' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { market } = body

    const result = await getClosedPositions(phoneNumber, market)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error fetching closed positions' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
