import { NextRequest, NextResponse } from 'next/server'

import { getIpFromRequest } from 'src/app/api/_utils/request-utils'
import { extractjwtTokenFromHeader } from 'src/app/api/_utils/jwt-utils'
import {
  getWalletNft,
  getUserIdByWallet,
  checkUserHaveActiveSession
} from 'src/app/api/_data/data-service'

import { JwtPayload } from 'src/types/jwt'
import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string // wallet_id
  nft_id: string
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

  if (!params.nft_id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'NFT_NOT_FOUND',
        message: `NFT id '${params.nft_id}' not found`,
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
    const nft = (await getWalletNft(params.id, params.nft_id)) || {}
    return NextResponse.json(nft)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFT' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
