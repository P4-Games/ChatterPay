import { BOT_API_TOKEN } from 'src/config-global'
import { post, endpoints } from 'src/app/api/hooks/api-resolver'

// ----------------------------------------------------------------------

export async function send2FACode(phone: string, code: number, codeMsg: string) {
  const botSendMsgEndpoint = endpoints.backend_bot.sendMessage()
  const botSendMsgData = {
    data_token: BOT_API_TOKEN,
    channel_user_id: phone,
    message: codeMsg.replace('{2FA_CODE}', code.toString())
  }
  console.info('botSendMsgData', botSendMsgData)
  const botSendMsgResult = await post(botSendMsgEndpoint, botSendMsgData)
  console.info('botSendMsgResult', botSendMsgResult)

  return true
}
