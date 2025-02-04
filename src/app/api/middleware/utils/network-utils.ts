import { NextRequest } from 'next/server'

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
