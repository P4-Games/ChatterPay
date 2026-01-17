import { NextResponse } from 'next/server'

import type { IToken } from 'src/types/wallet'
import { getTokens } from 'src/app/api/services/db/chatterpay-db-service'

export async function GET() {
  try {
    const tokens: IToken[] = (await getTokens()) ?? []

    return NextResponse.json(
      {
        status: 'success',
        data: tokens
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
