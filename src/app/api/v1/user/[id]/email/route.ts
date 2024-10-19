import { NextRequest, NextResponse } from 'next/server'

import { getUserById, updateUserCode, updateUserEmail } from 'src/app/api/_data/data-service'

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
    const { id } = params
    const { phone, code, email }: IBody = await req.json()

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

    const user: IAccount | undefined = await getUserById(id)
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
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    user.email = email
    const reult: boolean = await updateUserEmail(user)

    if (!reult) {
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

    return NextResponse.json({ reult })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
