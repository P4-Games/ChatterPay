import { NextRequest, NextResponse } from 'next/server'

import { CHP_DSH_NAME, IS_DEVELOPMENT } from 'src/config-global'
import { updateUserSessionStatus } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const userValidationResult = await validateUserCommonsInputs(req, params.id)
    if (userValidationResult instanceof NextResponse) return userValidationResult

    const securityCheckResult = await validateRequestSecurity(req, params.id)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const result: boolean = await updateUserSessionStatus(
      params.id,
      securityCheckResult.jwtToken.sessionId,
      'terminated'
    )

    // --- Clean HttpOnly cookie too ---
    const res = NextResponse.json({ result })
    res.cookies.set({
      name: CHP_DSH_NAME,
      value: '',
      httpOnly: true,
      secure: !IS_DEVELOPMENT,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    return res
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
