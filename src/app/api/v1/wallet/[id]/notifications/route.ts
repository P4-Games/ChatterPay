import * as PushAPI from '@pushprotocol/restapi'
import { NextRequest, NextResponse } from 'next/server'

import { PUSH_NETWORK, PUSH_ENVIRONMENT } from 'src/config-global'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { walletId, userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const notifications = await PushAPI.user.getFeeds({
      user: `eip155:${PUSH_NETWORK}:${walletId}`,
      env: PUSH_ENVIRONMENT
    })

    return NextResponse.json(notifications)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ error: `Error getting notifications for wallet ${walletId}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
