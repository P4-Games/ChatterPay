import { NextResponse } from 'next/server'
import * as PushAPI from '@pushprotocol/restapi'

import { PUSH_NETWORK, PUSH_ENVIRONMENT } from 'src/config-global'

import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

export async function GET(request: Request, { params }: { params: IParams }) {
  console.log('get notificacions called')

  if (!params.id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'WALLET_NOT_FOUND',
        message: `Wallet id '${params.id}' not found`,
        details: '',
        stack: '',
        url: request.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const notifications = await PushAPI.user.getFeeds({
      user: `eip155:${PUSH_NETWORK}:${params.id}`,
      env: PUSH_ENVIRONMENT
    })

    return NextResponse.json(notifications)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ error: `Error getting notifications for wallet ${params.id}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
