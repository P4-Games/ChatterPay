import { NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { transferAll } from 'src/app/api/services/blockchain/blockchain-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type IBody = {
  walletTo: string
}
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const userValidationResult = await validateUserCommonsInputs(req, params.id)
    if (userValidationResult instanceof NextResponse) return userValidationResult

    const { walletTo }: IBody = await req.json()
    if (!walletTo) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing walletTo in request body'
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

    const result: boolean = await transferAll(user.phone_number, walletTo)
    if (!result) {
      return new NextResponse(
        JSON.stringify({
          code: 'TRANSFER_ALL_ERROR',
          error: 'transfer all error'
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
