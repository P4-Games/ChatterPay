import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import {
  requestStakingAction,
  STAKING_ACTIONS,
  type StakingAction
} from 'src/app/api/services/staking/staking-service'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

/**
 * Takes a staking action on the wallet in the path.
 *
 * This is the one route here that moves money, and three things stand in front of it. The wallet
 * resolves to an owner and the session has to be that owner's. The action has to be one of a fixed
 * list, checked against the list rather than passed through. And the backend, which does the signing,
 * resolves the credential from the phone number this route looked up — so even a request that got
 * this far cannot be aimed at a wallet the authenticated user does not own.
 *
 * The PIN gate lives in the backend rather than here, alongside the operation it guards, so that the
 * gate cannot be satisfied by a caller that skips this route.
 *
 * @route POST /api/v1/wallet/:id/staking/action
 */
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  let body: { action?: unknown; recipientAddress?: unknown }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const action = body.action
  if (typeof action !== 'string' || !STAKING_ACTIONS.includes(action as StakingAction)) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: `action must be one of: ${STAKING_ACTIONS.join(', ')}`
        }
      },
      { status: 400 }
    )
  }

  const recipientAddress =
    typeof body.recipientAddress === 'string' && body.recipientAddress.trim() !== ''
      ? body.recipientAddress.trim()
      : null

  // Only an exit has a destination. Carrying one on any other action would be a parameter with no
  // meaning, and a parameter with no meaning is the kind that acquires one later by accident.
  if (recipientAddress !== null && action !== 'exit_and_send_max') {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'recipientAddress is only valid for exit_and_send_max'
        }
      },
      { status: 400 }
    )
  }

  const user = await getUserById(userId)
  if (!user?.phone_number) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND' } }, { status: 404 })
  }

  const result = await requestStakingAction(
    user.phone_number,
    action as StakingAction,
    recipientAddress
  )
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.status }
    )
  }

  return NextResponse.json(result.data)
}
