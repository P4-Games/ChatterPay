import { NextResponse } from 'next/server'

import { getWalletNft } from 'src/app/api/_data/data-service'

import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string // wallet_id
  nft_id: string
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

  if (!params.nft_id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'NFT_NOT_FOUND',
        message: `NFT id '${params.nft_id}' not found`,
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
    const nft = (await getWalletNft(params.id, params.nft_id)) || {}
    return NextResponse.json(nft)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFT' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
