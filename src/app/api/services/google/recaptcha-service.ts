import { UI_BASE_URL, RECAPTCHA_API_KEY } from 'src/config-global'

import type { RecaptchaResponse } from 'src/types/recaptcha'

// ----------------------------------------------------------------------

export async function validateRecaptcha(
  recaptchaToken: string,
  ip: string = '0.0.0.0'
): Promise<RecaptchaResponse> {
  const verifyEndpoint = 'https://www.google.com/recaptcha/api/siteverify'
  const recaptchaResponse = await fetch(verifyEndpoint, {
    method: 'POST',
    headers: {
      Origin: UI_BASE_URL,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: RECAPTCHA_API_KEY,
      response: recaptchaToken,
      remoteip: ip
    }).toString()
  })

  const recaptchaResult: RecaptchaResponse = await recaptchaResponse.json()
  return recaptchaResult
}
