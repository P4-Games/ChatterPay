import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { CHP_DSH_NAME } from 'src/config-global'
import { verifyJwtToken } from 'src/app/api/middleware/utils/jwt-utils'

// ----------------------------------------------------------------------

export async function GET() {
  const token = cookies().get(CHP_DSH_NAME)?.value
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const payload = verifyJwtToken(token)
    return NextResponse.json({ user: payload.user }, { status: 200 })
  } catch (err) {
    console.error('verifyJwtToken failed', err)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
