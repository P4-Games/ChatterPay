import { NextResponse } from 'next/server'

import { getUserTransactions } from 'src/app/api/_data/data-service'

import { IErrorResponse } from 'src/types/api'
import { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(request: Request, { params }: { params: IParams }) {
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
    const data: ITransaction[] = (await getUserTransactions(params.id)) ?? []
    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting transactions' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
