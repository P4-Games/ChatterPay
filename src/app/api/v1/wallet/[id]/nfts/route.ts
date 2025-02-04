import { NextRequest, NextResponse } from 'next/server'

import { getWalletNfts } from 'src/app/api/_data/data-service'

import { validateRequestSecurity } from '../../../_common/baseSecurityRoute'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from '../../walletCommonInputsValidator'

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
    const nfts = (await getWalletNfts(walletId)) || {}
    return NextResponse.json(nfts)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFTs' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
