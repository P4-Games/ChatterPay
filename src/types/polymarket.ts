// ----------------------------------------------------------------------

export type IPolymarketOutcome = {
  label: string
  price: number
  token_id: string
}

export type IPolymarketMarket = {
  condition_id: string
  question: string
  group_item_title: string
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
  image: string
  icon: string
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
  icon?: string
  avgPrice?: number
  curPrice?: number
  cashPnl?: number
  percentPnl?: number
  conditionId?: string
  initialValue?: number
  currentValue?: number
  endDate?: string
  asset?: string
  token_id?: string
}

export type IPolymarketActivePurchase = {
  purchase_id: string
  token_id: string
  side: 'BUY' | 'SELL'
  price: number
  size: number
  status: string
  current_step: string
  steps: Array<{
    name: string
    status: string
    started_at?: string
    completed_at?: string
    tx_hash?: string
  }>
  created_at: string
  updated_at: string
  // Enriched fields (may come from backend or local)
  market_title?: string
  outcome?: string
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
  bridge_token?: string
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

export type IPolymarketTrade = {
  id: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
  outcome: string
  timestamp: string | number

  // Actual API field names (from Polymarket)
  title?: string
  slug?: string
  conditionId?: string
  icon?: string
  eventSlug?: string
  outcomeIndex?: number
  transactionHash?: string
  asset?: string
  proxyWallet?: string

  // Normalized aliases (may come from backend normalization)
  market_title?: string
  market_slug?: string
  condition_id?: string
  tx_hash?: string
  bridge_tx_hash?: string

  fee?: number
}

export type IPolymarketPnlPoint = {
  /** ISO 8601 timestamp */
  timestamp: string
  /** Mark-to-market P&L in USD (realized + unrealized) */
  cumulativePnl: number
  totalInvested?: number
  totalProceeds?: number
}

export type IPolymarketPnlInterval = '1d' | '1w' | '1m' | 'all'

// ----------------------------------------------------------------------
