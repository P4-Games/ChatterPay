import { NextRequest, NextResponse } from 'next/server'

import { getWalletNft } from 'src/app/api/_data/data-service'

import { IErrorResponse } from 'src/types/api'

import { validateRequestSecurity } from '../../../../_common/baseSecurityRoute'
import { validateWalletCommonsInputs as validateWalletCommonInputs } from '../../../walletCommonInputsValidator'

// ----------------------------------------------------------------------

type IParams = {
  id: string // wallet_id
  nft_id: string
}

// ----------------------------------------------------------------------

export async function GET(req: NextRequest, { params }: { params: IParams }) {
  const walletValidationResult = await validateWalletCommonInputs(req, params.id)
  if (walletValidationResult instanceof NextResponse) return walletValidationResult

  const { walletId, userId } = walletValidationResult

  if (!params.nft_id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'NFT_NOT_FOUND',
        message: `NFT id '${params.nft_id}' not found`,
        details: '',
        stack: '',
        url: req.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const securityCheckResult = await validateRequestSecurity(req, userId)
  if (securityCheckResult instanceof NextResponse) return securityCheckResult

  try {
    const nft = (await getWalletNft(walletId, params.nft_id)) || {}
    return NextResponse.json(nft)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting NFT' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------
