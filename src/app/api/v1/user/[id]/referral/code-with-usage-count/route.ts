import { type NextRequest, NextResponse } from 'next/server'

import { getReferralCodeWithUsageCount } from 'src/app/api/services/referral/referral-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

// ----------------------------------------------------------------------

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

    const result = await getReferralCodeWithUsageCount(phoneNumber)

    return NextResponse.json({
      referralCode: result?.referralCode ?? '',
      referredUsersCount: result?.referredUsersCount ?? 0
    })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: 'Error getting referral code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
