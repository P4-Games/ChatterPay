import { NextRequest, NextResponse } from 'next/server'

import { submitReferralByCode } from 'src/app/api/services/referral/referral-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type SubmitBody = {
  referralByCode?: string
}

export async function POST(req: NextRequest, { params }: { params: IParams }) {
  const userValidationResult = await validateUserCommonsInputs(req, params.id)
  if (userValidationResult instanceof NextResponse) return userValidationResult

  const { userId } = userValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const body = (await req.json()) as SubmitBody
    const referralByCode = (body.referralByCode ?? '').trim()

    if (!referralByCode) {
      return new NextResponse(
        JSON.stringify({ code: 'INVALID_REQUEST_PARAMS', error: 'Missing referralByCode in body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const phoneNumber = securityCheckResult.jwtToken?.user?.phoneNumber
    if (!phoneNumber || !phoneNumber.trim()) {
      return new NextResponse(JSON.stringify({ error: 'Missing phoneNumber in session' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await submitReferralByCode(phoneNumber, referralByCode)

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 200 })
    }

    return NextResponse.json(
      { ok: true, updated: result.updated, message: result.message },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: 'Error submitting referral by code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
