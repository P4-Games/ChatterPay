import { NextResponse } from 'next/server'

import { USE_MOCK } from 'src/config-global'
import { _transactions } from 'src/app/api/_data/_mock'
import { geUserTransactions } from 'src/app/api/_data/data.-service'

import { IErrorResponse } from 'src/types/api'
import { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(request: Request, { params }: { params: IParams }) {
  // TODO: Check if id exists in backend

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

  if (params.id === 'none') {
    // avoid slow context-user load issues
    return NextResponse.json([])
  }

  try {
    let data: ITransaction[] = []
    if (USE_MOCK) {
      data = _transactions
    } else {
      data = _transactions
      data = (await geUserTransactions(params.id)) ?? []
    }
    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting transactions' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
