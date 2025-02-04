import { NextRequest, NextResponse } from 'next/server'

import { getUserTransactions } from 'src/app/api/_data/data-service'

import { ITransaction } from 'src/types/wallet'

import { validateRequestSecurity } from '../../../_common/baseSecurityRoute'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from '../../walletCommonInputsValidator'

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
    const data: ITransaction[] = (await getUserTransactions(walletId)) ?? []
    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting transactions' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
