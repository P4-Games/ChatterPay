import { type NextRequest, NextResponse } from 'next/server'

import { searchMarkets } from 'src/app/api/services/polymarket/polymarket-service'
import { validateRequestSecurity, getUserIdFromRequest } from 'src/app/api/middleware/validators/base-security-validator'

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
    const query = searchParams.get('query') || ''

    if (!query.trim()) {
      return NextResponse.json(
        { ok: true, data: [] },
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await searchMarkets(query)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error searching markets' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
