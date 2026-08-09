import { PolymarketDetailView } from 'src/sections/polymarket/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'ChatterPay | Market Detail'
}

type Props = {
  params: {
    slug: string
  }
}

export default function PolymarketDetailPage({ params }: Props) {
  return <PolymarketDetailView slug={params.slug} />
}
