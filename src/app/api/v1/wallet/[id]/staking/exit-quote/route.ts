import { type NextRequest, NextResponse } from 'next/server'

import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getStakingExitQuote } from 'src/app/api/services/staking/staking-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from 'src/app/api/middleware/validators/wallet-common-inputs-validator'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

// ----------------------------------------------------------------------

/**
 * What sending everything would move.
 *
 * A `GET` because it changes nothing: the backend assembles and balances the exit to find out the real
 * figures and keeps none of it. No operation is created, no input is held, and a user who opens the
 * dialog and closes it leaves no trace.
 *
 * @route GET /api/v1/wallet/:id/staking/exit-quote?recipientAddress=<addr>
 */
export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { userId } = walletValidationResult

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  const recipientAddress = req.nextUrl.searchParams.get('recipientAddress')?.trim() ?? ''
  if (recipientAddress === '') {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST_PARAMS', message: 'recipientAddress is required' } },
      { status: 400 }
    )
  }

  const user = await getUserById(userId)
  if (!user?.phone_number) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND' } }, { status: 404 })
  }

  const result = await getStakingExitQuote(user.phone_number, recipientAddress)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.status }
    )
  }

  return NextResponse.json(result.data)
}
