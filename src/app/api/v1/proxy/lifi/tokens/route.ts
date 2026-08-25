import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const chainId = req.nextUrl.searchParams.get('chainId')
  if (!chainId) {
    return NextResponse.json({ error: 'Missing chainId' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://li.quest/v1/tokens?chains=${encodeURIComponent(chainId)}&minPriceUSD=0.01`
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'LiFi tokens fetch failed' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'LiFi tokens error' }, { status: 500 })
  }
}
