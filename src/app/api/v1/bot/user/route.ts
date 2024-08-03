import { NextResponse } from 'next/server'

import { getUserByPhone } from 'src/app/api/_data/data-service'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// Specific endpoint with query params to be called by a Bot function-
// (for now, the bot function is not enabled to call endpoints with path params)

export async function GET(request: Request, { params }: { params: IParams }) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

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
    
    if (user) {
      delete user.code
    }

    return NextResponse.json(user)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting dummy' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
