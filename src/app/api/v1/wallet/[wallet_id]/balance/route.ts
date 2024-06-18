import { NextResponse } from 'next/server'

import { IBalance } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  wallet_id: string
}

export async function GET(request: Request, { params }: { params: IParams }) {
  // TODO: Check if wallet_id exists in backend

  if (!params.wallet_id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'WALLET_NOT_FOUND',
        message: `Wallet id '${params.wallet_id}' not found`,
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

  // TODO: call backend with wallet_id to get balance

  try {
    const data: IBalance[] = [
      {
        id: '1',
        balance: 23432.03,
        token: 'USDC',
        holder: 'pepe'
      },
      {
        id: '2',
        balance: 18000.23,
        token: 'ETH',
        holder: 'pepe'
      },
      {
        id: '3',
        balance: 2000.89,
        token: 'BTC',
        holder: 'pepe'
      }
    ]

    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting balance' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
