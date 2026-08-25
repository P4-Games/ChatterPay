import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const fromChain = req.nextUrl.searchParams.get('fromChain')
  const toChain = req.nextUrl.searchParams.get('toChain')
  const fromToken = req.nextUrl.searchParams.get('fromToken')
  const toToken = req.nextUrl.searchParams.get('toToken')
  const fromAmount = req.nextUrl.searchParams.get('fromAmount')
  const fromAddress = req.nextUrl.searchParams.get('fromAddress')

  if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !fromAddress) {
    return NextResponse.json(
      {
        error:
          'Missing required parameters: fromChain, toChain, fromToken, toToken, fromAmount, fromAddress'
      },
      { status: 400 }
    )
  }

  try {
    const params = new URLSearchParams({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress
    })

    const res = await fetch(`https://li.quest/v1/quote?${params.toString()}`)
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json(
        { error: 'LiFi quote fetch failed', detail: body },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'LiFi quote error' }, { status: 500 })
  }
}
