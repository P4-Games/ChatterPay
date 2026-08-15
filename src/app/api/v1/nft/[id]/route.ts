import { NextResponse } from 'next/server'

import { getNftById } from 'src/app/api/services/db/chatterpay-db-service'

import type { INFT } from 'src/types/wallet'
import type { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

export async function GET(request: Request, { params }: { params: IParams }) {
  const errorMessage: IErrorResponse = {
    error: {
      code: 'NFT_NOT_FOUND',
      message: `NFT id '${params.id}' not found`,
      details: '',
      stack: '',
      url: request.url
    }
  }

  if (!params.id) {
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Token ids repeat across networks, so a shared link may carry the network
    // it was minted on. Without it, the active network is assumed.
    const chainIdParam = new URL(request.url).searchParams.get('chainId')
    const chainId =
      chainIdParam && !Number.isNaN(Number(chainIdParam)) ? Number(chainIdParam) : undefined

    const nft: INFT | undefined = await getNftById(params.id, chainId)

    if (nft) {
      return NextResponse.json(nft)
    }

    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFT' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
