import { NextRequest, NextResponse } from 'next/server'

import { getIpFromRequest } from 'src/app/api/_utils/request-utils'
import { defaultBalance, GET_BALANCES_FROM_BACKEND } from 'src/config-global'
import { JwtPayload, extractjwtTokenFromHeader } from 'src/app/api/_utils/jwt-utils'
import { getUserIdByWallet, checkUserHaveActiveSession } from 'src/app/api/_data/data-service'
import {
  getBalancesWithTotals,
  getBalancesWithTotalsFromBackend
} from 'src/app/api/_data/blk-service'

import { IBalances } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  if (!params.id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'WALLET_NOT_FOUND',
        message: `Wallet id '${params.id}' not found`,
        details: '',
        stack: '',
        url: req.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // avoid slow context-user load issues
  if (params.id === 'none') {
    return NextResponse.json([defaultBalance])
  }

  const userId: string | undefined = await getUserIdByWallet(params.id)
  if (!userId) {
    return new NextResponse(
      JSON.stringify({
        code: 'USER_NOT_FOUND',
        error: `user not found with for wallet ${params.id}`
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const ip = getIpFromRequest(req)

  const jwtTokenDecoded: JwtPayload | null = extractjwtTokenFromHeader(
    req.headers.get('Authorization')
  )
  if (!jwtTokenDecoded) {
    return new NextResponse(
      JSON.stringify({ code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const validAccessToken = await checkUserHaveActiveSession(userId, jwtTokenDecoded, ip)
  if (!validAccessToken) {
    return new NextResponse(
      JSON.stringify({ code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    let balances: IBalances

    if (GET_BALANCES_FROM_BACKEND) {
      balances = await getBalancesWithTotalsFromBackend(params.id)
    } else {
      balances = await getBalancesWithTotals(params.id)
    }

    balances.wallet = params.id

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
