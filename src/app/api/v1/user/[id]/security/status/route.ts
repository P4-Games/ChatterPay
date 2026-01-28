import { type NextRequest, NextResponse } from 'next/server'

import { getSecurityStatus } from 'src/app/api/services/security/security-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

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
    const phoneNumber = securityCheckResult.jwtToken?.user?.phoneNumber
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Missing phoneNumber in session' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    const result = await getSecurityStatus(phoneNumber)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error getting security status' },
      { status: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    )
  }
}
