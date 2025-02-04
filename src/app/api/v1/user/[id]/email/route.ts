import { NextRequest, NextResponse } from 'next/server'

import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'
import {
  getUserById,
  updateUserCode,
  updateUserEmail
} from 'src/app/api/services/db/chatterpay-db-service'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type IBody = {
  phone: string
  code: string
  recaptchaToken: string
  email: string
}
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const userValidationResult = await validateUserCommonsInputs(req, params.id)
    if (userValidationResult instanceof NextResponse) return userValidationResult

    const { phone, code, email }: IBody = await req.json()
    if (!email || !code || !phone) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing email, code and phone  in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const securityCheckResult = await validateRequestSecurity(req, params.id)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const user: IAccount | undefined = await getUserById(params.id)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that id' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!user.code || code.toString() !== user.code.toString()) {
      return new NextResponse(JSON.stringify({ code: 'INVALID_CODE', error: 'invalid code' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    user.email = email
    const result: boolean = await updateUserEmail(user)

    if (!result) {
      return new NextResponse(
        JSON.stringify({
          code: 'USER_UPDATE_ERROR',
          error: 'user update error'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    updateUserCode(user.id, undefined)

    return NextResponse.json({ result })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
