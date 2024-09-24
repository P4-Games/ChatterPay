import { NextResponse } from 'next/server'

import { getNftById } from 'src/app/api/_data/data-service'

import { INFT } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'

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
    const response: INFT[] | undefined = await getNftById(parseInt(params.id, 10))
    if (response && response.length > 0 && response[0].metadata.image_url) {
      return NextResponse.json(response[0])
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
