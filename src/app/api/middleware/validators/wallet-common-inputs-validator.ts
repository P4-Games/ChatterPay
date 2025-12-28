import { type NextRequest, NextResponse } from 'next/server'

import { getUserIdByWallet } from 'src/app/api/services/db/chatterpay-db-service'

import type { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

export async function validateWalletCommonsInputs(
  req: NextRequest,
  walletId?: string
): Promise<{ walletId: string; userId: string } | NextResponse> {
  if (!walletId) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'INVALID_REQUEST_PARAMS',
        message: `Missing parameters in path params`,
        details: '',
        stack: '',
        url: req.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const userId: string | undefined = await getUserIdByWallet(walletId)
  if (!userId) {
    return NextResponse.json(
      { error: { code: 'USER_NOT_FOUND', message: `User not found for wallet ${walletId}` } },
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return { walletId, userId }
}
