import { NextResponse } from 'next/server'

import { post, endpoints } from 'src/app/api/_hooks/api-resolver'
import {
  getUserByPhone,
  updateUserCode,
  getLastConversacionUserId
} from 'src/app/api/_data/data.-service'
import {
  BOT_API_URL,
  BOT_API_TOKEN,
  botApiWappEnabled,
  handleVercelFreePlanTimeOut
} from 'src/config-global'

import { IAccount } from 'src/types/account'
import { LastUserConversation } from 'src/types/chat'

// ----------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { phone, codeMsg }: { phone: string; codeMsg: string } = await req.json()
    if (!phone || !codeMsg) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing phone number or code-message in request body'
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
        console.log('calling send2FACode ASYNC', phone, code)
        send2FACode(phone, code, codeMsg)
      } else {
        console.log('calling send2FACode SYNC', phone, code)
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

// ----------------------------------------------------------------------

async function send2FACode(phone: string, code: number, codeMsg: string) {
  // Search last conversationIn User in bot}
  console.log('entered send2FACode', phone, code)
  const lastUserConversation: LastUserConversation = await getLastConversacionUserId(phone)
  console.log('lastUserConversation', phone, lastUserConversation)

  if (!lastUserConversation) {
    // user not found
    console.log('lastUserConversation NOT_FOUND', phone, lastUserConversation)
    return false
  }

  // Set control to operator
  const botControlData = {
    data_token: BOT_API_TOKEN,
    id: lastUserConversation.id,
    control: 'operator'
  }
  const botControlEndpoint = endpoints.backend.control()
  console.log('lastUserConversation pre-post', botControlEndpoint, botControlData)
  const botControlOperatorResult = await post(botControlEndpoint, botControlData)
  console.log('botControlOperatorResult', botControlOperatorResult)

  // Send 2FA code by whatsapp with operator-reply endpoint
  const botSendMsgEndpoint = endpoints.backend.sendMessage()
  const botSendMsgData = {
    data_token: BOT_API_TOKEN,
    channel_user_id: lastUserConversation.channel_user_id,
    message: codeMsg.replace('{2FA_CODE}', code.toString())
  }
  console.log('botSendMsgData', botSendMsgData)
  const botSendMsgResult = await post(botSendMsgEndpoint, botSendMsgData)
  console.log('botSendMsgResult', botSendMsgResult)

  // Restore control to assitance
  botControlData.control = 'assistant'
  const botControlAssistantResult = await post(botControlEndpoint, botControlData)
  console.log('botControlAssistantResult', botControlAssistantResult)

  return true
}
