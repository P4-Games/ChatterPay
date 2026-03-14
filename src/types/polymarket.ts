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

export type IPolymarketAccountInfo = {
  has_account: boolean
  terms_accepted: boolean
  terms_current_version: number
  terms_accepted_version: number
}

export type IPolymarketTerms = {
  version: number
  content: string
  effective_date: string
}

export type IPolymarketAccountStatus = {
  account: IPolymarketAccountInfo
  terms: IPolymarketTerms
}

export type IPolymarketPosition = {
  market: IPolymarketMarket
  market_title?: string
  market_slug?: string
  outcome: string
  size: number
  avg_price: number
  current_price: number
  pnl: number
  pnl_percent: number
  
  // Backend polymorphic response bindings
  title?: string
  slug?: string
  avgPrice?: number
  curPrice?: number
  cashPnl?: number
  percentPnl?: number
  conditionId?: string
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
  cash_balance?: number

  // Backend polymorphic response bindings
  totalValue?: number
  totalPnl?: number
  positionsCount?: number
  cashBalance?: number
}

export type IPolymarketOrderPayload = {
  token_id: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
  bridge_amount?: string
}

export type IPolymarketPurchaseResponse = {
  purchase_id: string
}

export type IPolymarketPurchaseStatus = {
  purchase_id: string
  status: 'pending' | 'completed' | 'failed'
  current_step: 'account_creation' | 'bridge' | 'order_placement' | 'done' | string
  error?: string
}

export type IPolymarketCategory = {
  id: string
  label: string
  parentCategory?: string
  slug: string
}

// ----------------------------------------------------------------------
