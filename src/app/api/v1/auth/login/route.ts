import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

import { JWT_SECRET } from 'src/config-global'
import { getUserByPhone, updateUserCode } from 'src/app/api/_data/data-service'
import { getIpFromRequest, validateRecaptcha } from 'src/app/api/_utils/request-utils'

import { IAccount } from 'src/types/account'

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
          status: 400,
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
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const data: any = {
      user: {
        id: user.id,
        displayName: user.name || user.phone_number,
        wallet: user.wallet || '',
        email: user.email || '',
        photoURL: user.photo || '/assets/images/avatars/generic-user.jpg',
        phoneNumber: user.phone_number || ''
      },
      accessToken: generateAccessToken(user)
    }

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

function generateAccessToken(user: IAccount): string {
  delete user.code
  const accessToken = jwt.sign({ user }, JWT_SECRET, {
    expiresIn: '3h'
  })
  return accessToken
}
