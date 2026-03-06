import { type NextRequest, NextResponse } from 'next/server'

import { getMarketBySlug } from 'src/app/api/services/polymarket/polymarket-service'
import { validateRequestSecurity, getUserIdFromRequest } from 'src/app/api/middleware/validators/base-security-validator'

// ----------------------------------------------------------------------

type IParams = {
  slug: string
}

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    if (!params.slug) {
      return NextResponse.json(
        { ok: false, message: 'Missing slug parameter' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await getMarketBySlug(params.slug)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error fetching market details' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
