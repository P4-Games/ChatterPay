import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateStateChangingRequest } from 'src/app/api/middleware/validators/state-change-validator'
import {
  authorizeStakingAction,
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
 * Verifies the PIN for one staking action and returns a grant bound to it.
 *
 * Two steps rather than one, and the reason is what the PIN is being asked for. A PIN checked once and
 * then trusted for whatever comes next is a session, not an authorisation; this one is verified against
 * a named operation — "authorise withdrawing your rewards", "authorise sending everything to this
 * address" — and the grant that comes back carries that operation inside its signature. It cannot be
 * presented for a different action, a different destination or a different person, and it is good for
 * one operation because its nonce becomes that operation's idempotency key.
 *
 * The PIN itself is never stored here and never returned. It goes to the backend, which owns the
 * verification and the failed-attempt counter, and what comes back is the grant.
 *
 * @route POST /api/v1/wallet/:id/staking/authorize
 */
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  const crossSite = validateStateChangingRequest(req)
  if (crossSite) return crossSite

  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  let body: { action?: unknown; pin?: unknown; recipientAddress?: unknown }
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

  if (typeof body.pin !== 'string' || body.pin.trim() === '') {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST_BODY', message: 'pin is required' } },
      { status: 400 }
    )
  }

  const recipientAddress =
    typeof body.recipientAddress === 'string' && body.recipientAddress.trim() !== ''
      ? body.recipientAddress.trim()
      : null

  // The destination is part of what is being authorised, so it has to be the same one the action will
  // carry. Authorising an exit and then redirecting it is the thing the binding exists to prevent.
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

  const result = await authorizeStakingAction(
    user.phone_number,
    action as StakingAction,
    body.pin,
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
