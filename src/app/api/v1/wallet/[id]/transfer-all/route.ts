import { NextRequest, NextResponse } from 'next/server'

import { transferAll } from 'src/app/api/_data/blk-service'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type IBody = {
  walletTo: string
}
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const { id } = params
    const { walletTo }: IBody = await req.json()

    if (!id) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing parameters in path params'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!walletTo) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing walletTo in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const result: boolean = await transferAll(walletTo)
    if (!result) {
      return new NextResponse(
        JSON.stringify({
          code: 'TRANSFER_ALL_ERROR',
          error: 'transfer all error'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return NextResponse.json({ result })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
