import { type NextRequest, NextResponse } from 'next/server'

import { setSecurityRecoveryQuestions } from 'src/app/api/services/security/security-service'
import { verifyTwoFactorCode } from 'src/app/api/services/auth/twofa-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type RecoveryQuestionsPayload = {
  questions?: Array<{ questionId: string; answer: string }>
  twoFactorCode?: string
}

export async function POST(req: NextRequest, { params }: { params: IParams }) {
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

    const body = (await req.json()) as RecoveryQuestionsPayload
    const questions = body?.questions ?? []
    if (!questions.length) {
      return NextResponse.json(
        { ok: false, message: 'Missing recovery questions in request' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    if (!body?.twoFactorCode) {
      return NextResponse.json(
        { ok: false, message: 'MISSING_2FA_CODE' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    const twoFactorResult = await verifyTwoFactorCode(userId, body.twoFactorCode)
    if (!twoFactorResult.ok) {
      return NextResponse.json(
        { ok: false, message: twoFactorResult.message },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        }
      )
    }

    const result = await setSecurityRecoveryQuestions(phoneNumber, questions)

    return NextResponse.json(result, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Error setting recovery questions' },
      { status: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    )
  }
}
