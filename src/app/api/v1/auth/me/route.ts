import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { CHP_DSH_NAME } from 'src/config-global'
import { verifyJwtToken } from 'src/app/api/middleware/utils/jwt-utils'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'

import type { jwtPayloadUser } from 'src/types/jwt'

// ----------------------------------------------------------------------

const defaultUser: jwtPayloadUser = {
  id: '',
  displayName: '',
  wallet: '',
  wallets: [],
  email: '',
  photoURL: '',
  phoneNumber: ''
}

export async function GET() {
  const token = cookies().get(CHP_DSH_NAME)?.value
  if (!token) {
    return NextResponse.json({ user: defaultUser }, { status: 200 })
  }

  try {
    const payload = verifyJwtToken(token)
    const userId = payload.user?.id
    if (userId) {
      const user = await getUserById(userId)
      if (user?.blocked) {
        return NextResponse.json(
          { code: 'USER_BLOCKED', error: 'account suspended after activity flagged as an attack' },
          { status: 403 }
        )
      }
      if (user) {
        return NextResponse.json(
          {
            user: {
              id: user.id,
              displayName: user.name,
              wallet: user.wallet,
              wallets: user.wallets || [],
              email: user.email || '',
              photoURL: user.photo,
              phoneNumber: user.phone_number
            }
          },
          { status: 200 }
        )
      }
    }
    return NextResponse.json({ user: payload.user }, { status: 200 })
  } catch (err) {
    console.error('verifyJwtToken failed', err)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
