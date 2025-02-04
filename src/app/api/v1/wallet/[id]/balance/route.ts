import { NextRequest, NextResponse } from 'next/server'

import { defaultBalance, GET_BALANCES_FROM_BACKEND } from 'src/config-global'
import {
  getBalancesWithTotals,
  getBalancesWithTotalsFromBackend
} from 'src/app/api/_data/blk-service'

import { IBalances } from 'src/types/wallet'

import { validateRequestSecurity } from '../../../_common/baseSecurityRoute'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from '../../walletCommonInputsValidator'

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
