import { BACKEND_API_URL } from 'src/config-global'

import type { PolymarketTermsData } from 'src/sections/polymarket/terms/view'
import { PolymarketTermsView } from 'src/sections/polymarket/terms/view'

// ----------------------------------------------------------------------

export const revalidate = 3600

export const metadata = {
  title: 'Polymarket Terms of Service — ChatterPay'
}

async function fetchTerms(): Promise<{ data: PolymarketTermsData | null; error: boolean }> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/polymarket/terms`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return { data: null, error: true }
    const json = await res.json()
    if (json.status !== 'success') return { data: null, error: true }
    return { data: json.data as PolymarketTermsData, error: false }
  } catch {
    return { data: null, error: true }
  }
}

export default async function PolymarketTermsPage() {
  const { data, error } = await fetchTerms()
  return <PolymarketTermsView data={data} error={error} />
}
