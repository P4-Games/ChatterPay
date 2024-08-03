import { NextResponse } from 'next/server'

import { getConversationRates } from 'src/app/api/_data/blk-service'

import { IBalances } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {}

export async function GET(request: Request, { params }: { params: IParams }) {
  try {
    const balances: IBalances = await getConversationRates()
    return NextResponse.json(balances)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting dummy' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
