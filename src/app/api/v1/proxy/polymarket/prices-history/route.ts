import { type NextRequest, NextResponse } from 'next/server'

import { POLYMARKET_CLOB_API_URL, POLYMARKET_ADAPTER_TOKEN } from 'src/config-global'

// Server-side proxy for Polymarket's `prices-history` — keeps the adapter's
// Bearer token off the client. When `POLYMARKET_ADAPTER_TOKEN` is set the
// request goes through the adapter; otherwise it hits the CLOB API directly.

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get('market')
  const interval = req.nextUrl.searchParams.get('interval')
  const fidelity = req.nextUrl.searchParams.get('fidelity')

  if (!market || !interval || !fidelity) {
    return NextResponse.json(
      { error: 'Missing required parameters: market, interval, fidelity' },
      { status: 400 }
    )
  }

  const useAdapter = Boolean(POLYMARKET_ADAPTER_TOKEN)
  const baseUrl = POLYMARKET_CLOB_API_URL

  const params = new URLSearchParams({ market, interval, fidelity })

  try {
    const res = await fetch(`${baseUrl}/prices-history?${params.toString()}`, {
      headers: useAdapter ? { Authorization: `Bearer ${POLYMARKET_ADAPTER_TOKEN}` } : {},
      cache: 'no-store'
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Polymarket prices-history fetch failed' },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Polymarket prices-history error' }, { status: 500 })
  }
}
