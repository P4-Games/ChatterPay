import { type NextRequest, NextResponse } from 'next/server'

import { getReferralByCode } from 'src/app/api/services/referral/referral-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic'

type IParams = {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const userValidationResult = await validateUserCommonsInputs(req, params.id)
  if (userValidationResult instanceof NextResponse) return userValidationResult

  const { userId } = userValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const phoneNumber = securityCheckResult.jwtToken?.user?.phoneNumber
    if (!phoneNumber || !phoneNumber.trim()) {
      return new NextResponse(JSON.stringify({ error: 'Missing phoneNumber in session' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await getReferralByCode(phoneNumber)

    return NextResponse.json({
      referralByCode: result.referralByCode
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: 'Error getting referral by code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
