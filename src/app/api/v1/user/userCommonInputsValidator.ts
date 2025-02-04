import { NextRequest, NextResponse } from 'next/server'

import { IErrorResponse } from 'src/types/api'

export async function validateUserCommonsInputs(
  req: NextRequest,
  userId?: string
): Promise<{ userId: string } | NextResponse> {
  if (!userId) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'INVALID_REQUEST_PARAMS',
        message: `Missing parameters in path params`,
        details: '',
        stack: '',
        url: req.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return { userId }
}
