import { NextRequest, NextResponse } from 'next/server'

import { getIpFromRequest } from 'src/app/api/_utils/request-utils'
import { JwtPayload, extractjwtTokenFromHeader } from 'src/app/api/_utils/jwt-utils'
import {
  getWalletNfts,
  getUserIdByWallet,
  checkUserHaveActiveSession
} from 'src/app/api/_data/data-service'

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
    const nfts = (await getWalletNfts(params.id)) || {}
    return NextResponse.json(nfts)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFTs' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
