import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getGovernance } from 'src/app/api/services/staking/staking-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

/**
 * What a vote may be delegated to, and what this credential has delegated so far.
 *
 * Read-only. Delegating is an action and goes through the staking action route, which is where the
 * PIN gate and the signer check are; nothing here registers a DRep or casts a vote, and those kinds
 * stay refused while their flag is off.
 *
 * @route GET /api/v1/wallet/:id/governance
 */
export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  const user = await getUserById(userId)
  if (!user?.phone_number) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND' } }, { status: 404 })
  }

  const result = await getGovernance(user.phone_number)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.status }
    )
  }

  return NextResponse.json(result.data)
}
