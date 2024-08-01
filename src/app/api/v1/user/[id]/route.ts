import { NextResponse } from 'next/server'

import { getUserByPhone } from 'src/app/api/_data/data-service'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(request: Request, { params }: { params: IParams }) {
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

    const user: IAccount | undefined = await getUserByPhone(id)

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
