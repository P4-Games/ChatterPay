import { NextResponse, type NextRequest } from 'next/server'

// ----------------------------------------------------------------------

/** UTXO is what brings Bitcoin into the list; the withdraw modal appends it by hand instead. */
const LIFI_CHAINS_ENDPOINT = 'https://li.quest/v1/chains?chainTypes=EVM,SVM,UTXO'

/** Upstream chain list only changes when LiFi onboards a network. */
const CACHE_SECONDS = 3600

type LifiChain = {
  key: string
  name: string
  logoURI?: string
  mainnet?: boolean
}

export async function GET(request: NextRequest) {
  const isSummary = request.nextUrl.searchParams.get('fields') === 'summary'

  try {
    const res = await fetch(LIFI_CHAINS_ENDPOINT, { next: { revalidate: CACHE_SECONDS } })
    if (!res.ok) {
      return NextResponse.json({ error: 'LiFi chains fetch failed' }, { status: res.status })
    }
    const data = await res.json()

    if (!isSummary) {
      return NextResponse.json(data)
    }

    // The full payload is ~80 KB; public pages only need mainnet name + logo.
    const chains: LifiChain[] = (data.chains || [])
      .filter((chain: LifiChain) => chain.mainnet)
      .map((chain: LifiChain) => ({
        key: chain.key,
        name: chain.name,
        logoURI: chain.logoURI || ''
      }))

    return NextResponse.json({ chains })
  } catch {
    return NextResponse.json({ error: 'LiFi chains error' }, { status: 500 })
  }
}
