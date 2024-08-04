import { NextResponse } from 'next/server'

import { defaultBalance } from 'src/config-global'
import { getBalancesWithTotals } from 'src/app/api/_data/blk-service'

import { IBalances } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

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

  // avoid slow context-user load issues
  if (params.id === 'none') {
    return NextResponse.json([defaultBalance])
  }

  try {
    const balances: IBalances = await getBalancesWithTotals(params.id)
    balances.wallet = params.id

    return NextResponse.json(balances)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting balance' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
