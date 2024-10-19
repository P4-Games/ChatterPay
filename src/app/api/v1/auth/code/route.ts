import { NextRequest, NextResponse } from 'next/server'

import { getUserByPhone, updateUserCode } from 'src/app/api/_data/data-service'
import { getIpFromRequest, validateRecaptcha } from 'src/app/api/_utils/request-utils'
import {
  BOT_API_URL,
  BOT_API_TOKEN,
  botApiWappEnabled,
  handleVercelFreePlanTimeOut
} from 'src/config-global'

import { IAccount } from 'src/types/account'

import { send2FACode } from '../../_common/common'

// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const {
      phone,
      codeMsg,
      recaptchaToken
    }: { phone: string; codeMsg: string; recaptchaToken: string } = await req.json()

    const ip = getIpFromRequest(req)

    if (!phone || !codeMsg || !recaptchaToken) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing phone number, codeMsg or recaptchaToken in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!BOT_API_URL || !BOT_API_TOKEN) {
      return new NextResponse(JSON.stringify({ error: `Backend API or Token not set.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const recaptchaResult = await validateRecaptcha(recaptchaToken, ip)
    if (!recaptchaResult.success) {
      return new NextResponse(
        JSON.stringify({ code: 'RECAPTACHA_INVALID', error: 'Invalid reCAPTCHA token' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
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
      if (handleVercelFreePlanTimeOut) {
        // Vercel has a timeout of 10 seconds (only for free plan) in the APIs.
        // The login has certain logic between ChatterPay and the backend of the Chatizalo,
        // which may cause it to take about 10 seconds, so this variable is used to improve that logic.
        // send async
        console.info('calling send2FACode ASYNC', phone, code)
        send2FACode(phone, code, codeMsg)
      } else {
        console.info('calling send2FACode SYNC', phone, code)
        botSentCodeResult = await send2FACode(phone, code, codeMsg)
      }

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
