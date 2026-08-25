import { endpoints, post } from 'src/app/api/hooks/api-resolver'
import { BOT_API_TOKEN } from 'src/config-global'

// ----------------------------------------------------------------------

export async function send2FACode(
  phone: string,
  code: number,
  codeMsg: string,
  preferredLanguage: 'es' | 'pt' | 'en'
) {
  const botSendMsgEndpoint = endpoints.backend_bot.sendMessage()
  const codeAsString = code.toString()
  const botSendMsgData = {
    data_token: BOT_API_TOKEN,
    channel_user_id: phone,
    message_kind: 'auth',
    template_key: 'login_v1',
    template_params: { code: codeAsString },
    template_buttons: { 0: codeAsString },
    force_template: 'true',
    preferred_language: preferredLanguage,
    message: codeMsg.replace('{2FA_CODE}', codeAsString)
  }
  const { data_token: _redactedToken, ...botSendMsgDataSafe } = botSendMsgData
  console.info('botSendMsgData', botSendMsgDataSafe)
  const botSendMsgResult = await post(botSendMsgEndpoint, botSendMsgData)
  console.info('botSendMsgResult', botSendMsgResult)

  return true
}
