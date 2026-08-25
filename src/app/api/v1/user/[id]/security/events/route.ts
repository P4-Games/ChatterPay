import { type NextRequest, NextResponse } from 'next/server'

import { getSecurityEvents } from 'src/app/api/services/security/security-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const userValidationResult = await validateUserCommonsInputs(req, params.id)
  if (userValidationResult instanceof NextResponse) {
    userValidationResult.headers.set('Cache-Control', 'no-store')
    return userValidationResult
  }

  const { userId } = userValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) {
    securityCheckResult.headers.set('Cache-Control', 'no-store')
    return securityCheckResult
  }

  try {
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    const phoneNumber = user.phone_number
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Missing phoneNumber in session' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    const { searchParams } = new URL(req.url)
    const channel = searchParams.get('channel') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const eventTypesParam = searchParams.get('eventTypes')
    const eventTypes = eventTypesParam
      ? eventTypesParam
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')
    const pageNumber = page ? Number.parseInt(page, 10) : undefined
    const pageSizeNumber = pageSize ? Number.parseInt(pageSize, 10) : undefined

    const result = await getSecurityEvents(phoneNumber, {
      channel,
      search,
      eventTypes,
      page: Number.isNaN(pageNumber ?? Number.NaN) ? undefined : pageNumber,
      pageSize: Number.isNaN(pageSizeNumber ?? Number.NaN) ? undefined : pageSizeNumber
    })

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error getting security events' },
      { status: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    )
  }
}
