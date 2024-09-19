import { NextRequest } from 'next/server'

import { RECAPTCHA_API_KEY } from 'src/config-global'

import { RecaptchaResponse } from 'src/types/recaptcha'

// ----------------------------------------------------------------------
export function getIpFromRequest(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  let ip = '0.0.0.0'
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0]
  } else {
    ip = req.ip || '0.0.0.0'
  }

  return ip
}

export async function validateRecaptcha(
  recaptchaToken: string,
  ip: string = '0.0.0.0'
): Promise<RecaptchaResponse> {
  // Validar el token de recaptcha
  const verifyEndpoint = 'https://www.google.com/recaptcha/api/siteverify'
  const recaptchaResponse = await fetch(verifyEndpoint, {
    method: 'POST',
    headers: {
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
