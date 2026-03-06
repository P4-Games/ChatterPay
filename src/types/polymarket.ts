// ----------------------------------------------------------------------

export type IPolymarketOutcome = {
  label: string
  price: number
  token_id: string
}

export type IPolymarketMarket = {
  condition_id: string
  question: string
  slug: string
  image: string
  icon: string
  description: string
  outcomes: string[]
  outcome_prices: string[]
  volume: number
  volume_24hr: number
  liquidity: number
  end_date_iso: string
  active: boolean
  closed: boolean
  category: string
  tokens: Array<{
    token_id: string
    outcome: string
    price: number
  }>
}

export type IPolymarketEvent = {
  id: string
  title: string
  slug: string
  description: string
  markets: IPolymarketMarket[]
}

export type IPolymarketAccountStatus = {
  has_account: boolean
  terms_accepted: boolean
  proxy_wallet: string | null
}

export type IPolymarketPosition = {
  market: IPolymarketMarket
  outcome: string
  size: number
  avg_price: number
  current_price: number
  pnl: number
  pnl_percent: number
}

export type IPolymarketOrder = {
  id: string
  market: IPolymarketMarket
  side: 'BUY' | 'SELL'
  outcome: string
  size: number
  price: number
  status: string
  created_at: string
}

export type IPolymarketPortfolio = {
  total_value: number
  total_pnl: number
  positions_count: number
}

export type IPolymarketOrderPayload = {
  token_id: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
}

// ----------------------------------------------------------------------
