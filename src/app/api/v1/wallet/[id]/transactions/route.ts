import { type NextRequest, NextResponse } from 'next/server'

import { getUserTransactions } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { walletId, userId } = walletValidationResult

  if (walletId === 'none') {
    // avoid slow context-user load issues
    return NextResponse.json([])
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const sinceParam = searchParams.get('since')
    const limit = limitParam ? Number(limitParam) : undefined
    const data: ITransaction[] =
      (await getUserTransactions(walletId, {
        limit: limit != null && Number.isFinite(limit) ? limit : undefined,
        since: sinceParam ?? undefined
      })) ?? []
    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting transactions' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
