import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

import { JWT_SECRET } from 'src/config-global'
import { getUserByPhone, updateUserCode } from 'src/app/api/_data/data.-service'

import { IAccount } from 'src/types/account'
// ----------------------------------------------------------------------

export async function POST(req: any, res: any) {
  try {
    const { phone, code }: { phone: string; code: string } = await req.json()
    if (!phone || !code) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing parameters in request body'
        }),
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
        displayName: user.name,
        wallet: user.wallet,
        email: user.email || '',
        photoURL: user.photo,
        phoneNumber: user.phone_number
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
