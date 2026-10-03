import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getStakingState } from 'src/app/api/services/staking/staking-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

/**
 * The staking position of the wallet in the path.
 *
 * The two validators below are what make this safe, and they are the same pair every other wallet
 * route uses. The first resolves the wallet to its owner; the second requires the session cookie to
 * belong to *that* owner. A request naming somebody else's wallet resolves to somebody else's user
 * and then fails the session check, so there is no combination of path and cookie that reads a wallet
 * the caller does not own.
 *
 * @route GET /api/v1/wallet/:id/staking
 */
export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  // Looked up here rather than accepted from the request. The browser never names a user.
  const user = await getUserById(userId)
  if (!user?.phone_number) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND' } }, { status: 404 })
  }

  const result = await getStakingState(user.phone_number)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.status }
    )
  }

  return NextResponse.json(result.data)
}
