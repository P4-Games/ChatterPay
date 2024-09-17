import type { NextApiRequest, NextApiResponse } from 'next'

import { ALLOWED_ORIGINS } from 'src/config-global'

// ----------------------------------------------------------------------

export function cors(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  console.log('x')
  const allowedOrigins = (ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim())
  const origin = req.headers.origin as string

  console.log('origin', origin, allowedOrigins)
  // Si ALLOWED_ORIGINS contiene '*', permitir todos los orígenes
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin) // Permitir origen específico
  } else {
    res.setHeader('Access-Control-Allow-Origin', '') // No permitir
  }

  console.log('res', res)

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Si el método es OPTIONS, responder con un estado 204
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  next()
}
