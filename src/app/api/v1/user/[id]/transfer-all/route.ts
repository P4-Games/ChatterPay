import { NextRequest, NextResponse } from 'next/server'

import { transferAll } from 'src/app/api/_data/blk-service'
import { getIpFromRequest } from 'src/app/api/_utils/request-utils'
import { extractjwtTokenFromHeader } from 'src/app/api/_utils/jwt-utils'
import { getUserById, checkUserHaveActiveSession } from 'src/app/api/_data/data-service'

import { JwtPayload } from 'src/types/jwt'
import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

type IBody = {
  walletTo: string
}
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const { id } = params
    const { walletTo }: IBody = await req.json()

    if (!id) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing parameters in path params'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!walletTo) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing walletTo in request body'
        }),
        {
          status: 400,
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

    const validAccessToken = await checkUserHaveActiveSession(id, jwtTokenDecoded, ip)
    if (!validAccessToken) {
      return new NextResponse(
        JSON.stringify({ code: 'NOT_AUTHORIZED', error: 'Invalid Access Token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const user: IAccount | undefined = await getUserById(id)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that id' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const result: boolean = await transferAll(user.phone_number, walletTo)
    if (!result) {
      return new NextResponse(
        JSON.stringify({
          code: 'TRANSFER_ALL_ERROR',
          error: 'transfer all error'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return NextResponse.json({ result })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in update user' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
