import { type NextRequest, NextResponse } from 'next/server'

import { getCategories } from 'src/app/api/services/polymarket/polymarket-service'
import {
  validateRequestSecurity,
  getUserIdFromRequest
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
    const result = await getCategories()

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error fetching categories' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
