import { NextRequest, NextResponse } from 'next/server'

import { updateUser, getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const { id } = params
  try {
    if (!id) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing parameters in path params'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const securityCheckResult = await validateRequestSecurity(req, id)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const user: IAccount | undefined = await getUserById(id)

    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that phone number' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const data: any = {
      id: user.id,
      displayName: user.name,
      wallet: user.wallet,
      walletEOA: user.walletEOA || '',
      email: user.email || '',
      photoURL: user.photo,
      phoneNumber: user.phone_number
    }

    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting dummy' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const userValidationResult = await validateUserCommonsInputs(req, params.id)
    if (userValidationResult instanceof NextResponse) return userValidationResult

    const { name }: { name: string } = await req.json()
    if (!name) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing name in request body'
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

    user.name = name
    const result: boolean = await updateUser(user)

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

    return NextResponse.json({ result })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
