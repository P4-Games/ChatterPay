import { NextResponse } from 'next/server'

import { defaultBalance, GET_BALANCES_FROM_BACKEND } from 'src/config-global'
import {
  getBalancesWithTotals,
  getBalancesWithTotalsFromBackend
} from 'src/app/api/_data/blk-service'

import { IBalances, INFT } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'
import { getWalletNfts } from 'src/app/api/_data/data-service'

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


  try {
    const nfts = await getWalletNfts(params.id) || {}
    console.log('nfts', nfts)
    return NextResponse.json(nfts)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFTs' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
