import { NextRequest, NextResponse } from 'next/server'

import { send2FACode } from 'src/app/api/services/chatizalo/chatizalo-service'
import { BOT_API_URL, BOT_API_TOKEN, botApiWappEnabled } from 'src/config-global'
import { getUserByPhone, updateUserCode } from 'src/app/api/services/db/chatterpay-db-service'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { validateUserCommonsInputs } from 'src/app/api/middleware/validators/user-common-inputs-validator'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------
type IParams = {
  id: string
}

export async function POST(req: NextRequest, { params }: { params: IParams }) {
  try {
    const userValidationResult = await validateUserCommonsInputs(req, params.id)
    if (userValidationResult instanceof NextResponse) return userValidationResult

    const { phone, codeMsg }: { phone: string; codeMsg: string; recaptchaToken: string } =
      await req.json()

    if (!phone || !codeMsg) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing phone number or codeMsg in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const securityCheckResult = await validateRequestSecurity(req, params.id)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    if (!BOT_API_URL || !BOT_API_TOKEN) {
      return new NextResponse(JSON.stringify({ error: `Backend API or Token not set.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user: IAccount | undefined = await getUserByPhone(phone)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that phone number' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate and store 2FA code
    const code: number = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
    await updateUserCode(user.id, code)

    // Send 2FA code to user'whatsapp
    let botSentCodeResult: boolean = true
    if (botApiWappEnabled) {
      console.info('/user/[id]/code, calling send2FACode SYNC', phone, code)
      botSentCodeResult = await send2FACode(phone, code, codeMsg)

      if (!botSentCodeResult) {
        return new NextResponse(
          JSON.stringify({
            code: 'USER_NOT_FOUND',
            error: 'user not found with that phone number'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    const finalResult: { phone: string; sent: boolean } = {
      phone,
      sent: botSentCodeResult
    }

    return NextResponse.json(finalResult)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in authentication' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
