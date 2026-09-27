import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { setStakingConsent } from 'src/app/api/services/staking/staking-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateStateChangingRequest } from 'src/app/api/middleware/validators/state-change-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

/**
 * Records the user's acceptance of the staking terms and their opt-in.
 *
 * @route POST /api/v1/wallet/:id/staking/consent
 */
export async function POST(req: NextRequest, { params }: { params: IParams }) {
  const crossSite = validateStateChangingRequest(req)
  if (crossSite) return crossSite

  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  let accept: unknown
  try {
    accept = (await req.json())?.accept
  } catch {
    accept = undefined
  }

  // Required to be an actual boolean. A missing field read as `false` would silently switch staking
  // off for anybody whose request body did not arrive intact.
  if (typeof accept !== 'boolean') {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST_BODY', message: 'accept must be true or false' } },
      { status: 400 }
    )
  }

  const user = await getUserById(userId)
  if (!user?.phone_number) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND' } }, { status: 404 })
  }

  const result = await setStakingConsent(user.phone_number, accept)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.status }
    )
  }

  return NextResponse.json(result.data)
}
