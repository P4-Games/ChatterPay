import { PolymarketEventDetailView } from 'src/sections/polymarket/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'ChatterPay | Event Detail'
}

type Props = {
  params: {
    id: string
  }
}

export default function PolymarketEventDetailPage({ params }: Props) {
  return <PolymarketEventDetailView eventId={params.id} />
}
