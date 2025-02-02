import { NextRequest, NextResponse } from 'next/server'

import { jwtPayloadUser, generateJwtToken } from 'src/app/api/_utils/jwt-utils'
import { getIpFromRequest, validateRecaptcha } from 'src/app/api/_utils/request-utils'
import {
  getUserByPhone,
  updateUserCode,
  updateUserSessionStatus,
  validateUserHave1SessionCreated
} from 'src/app/api/_data/data-service'

import { IAccount, UserSession } from 'src/types/account'

// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { phone, code, recaptchaToken }: { phone: string; code: string; recaptchaToken: string } =
      await req.json()

    const ip = getIpFromRequest(req)

    if (!phone || !code || !recaptchaToken) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing parameters (phone, code, recaptchaToken) in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const recaptchaResult = await validateRecaptcha(recaptchaToken, ip)
    if (!recaptchaResult.success) {
      return new NextResponse(
        JSON.stringify({ code: 'RECAPTACHA_INVALID', error: 'Invalid reCAPTCHA token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const user: IAccount | undefined = await getUserByPhone(phone)

    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that phone number' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!user.code || code.toString() !== user.code.toString()) {
      return new NextResponse(
        JSON.stringify({ code: 'AUTH_INVALID_CODE', error: 'invalid code' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate if the user has an active session with the same IP
    const result = await validateUserHave1SessionCreated(user.id, ip)
    if (!result.valid) {
      return new NextResponse(
        JSON.stringify({ code: 'AUTH_INVALID_SESSION', error: result.error }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const userSession = result.session as UserSession
    const dataUser: jwtPayloadUser = {
      id: user.id,
      displayName: user.name || user.phone_number,
      wallet: user.wallet || '',
      walletEOA: user.walletEOA || '',
      email: user.email || '',
      photoURL: user.photo || '/assets/images/avatars/generic-user.png',
      phoneNumber: user.phone_number || ''
    }
    const data: Record<string, any> = {
      user: dataUser,
      sessionId: userSession.id,
      jwtToken: generateJwtToken(dataUser, userSession)
    }

    await updateUserSessionStatus(user.id, userSession.id, 'active')

    // clean 2fa code used in bdd
    updateUserCode(user.id, undefined)

    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in authentication' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
