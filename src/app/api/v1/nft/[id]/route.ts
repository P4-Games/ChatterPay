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
    const nft: INFT | undefined = await getNftById(params.id)

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
