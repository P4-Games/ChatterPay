import { type NextRequest, NextResponse } from 'next/server'

import { defaultBalance, GET_BALANCES_FROM_BACKEND } from 'src/config-global'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import {
  getBalancesWithTotals,
  getBalancesWithTotalsFromBackend
} from 'src/app/api/services/blockchain/blockchain-service'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

import type { IBalances } from 'src/types/wallet'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { walletId, userId } = walletValidationResult

  // avoid slow context-user load issues
  if (params.id === 'none') {
    return NextResponse.json([defaultBalance])
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    let balances: IBalances

    if (GET_BALANCES_FROM_BACKEND) {
      balances = await getBalancesWithTotalsFromBackend(walletId)
    } else {
      balances = await getBalancesWithTotals(walletId)
    }

    balances.wallet = walletId

    return NextResponse.json(balances)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting balance' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
