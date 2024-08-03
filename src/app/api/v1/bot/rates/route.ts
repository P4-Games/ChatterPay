import { NextResponse } from 'next/server'

import { getConversationRates } from 'src/app/api/_data/blk-service'

import { IBalances } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {}

// Specific endpoint with query params to be called by a Bot function-
// (for now, the bot function is not enabled to call endpoints with path params)
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
