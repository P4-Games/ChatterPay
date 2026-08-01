import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

import type {
  IPolymarketOrder,
  IPolymarketMarket,
  IPolymarketEvent,
  IPolymarketTeam,
  IPolymarketPosition,
  IPolymarketPortfolio,
  IPolymarketAccountStatus,
  IPolymarketOrderPayload,
  IPolymarketPurchaseResponse,
  IPolymarketPurchaseStatus,
  IPolymarketCategory,
  IPolymarketTrade,
  IPolymarketPnlPoint,
  IPolymarketPnlInterval
} from 'src/types/polymarket'

// ----------------------------------------------------------------------

type BackendResponseSuccess<TData extends object> = {
  status: 'success'
  data: TData
  timestamp: string
}

type BackendResponseError = {
  status: 'error'
  data: {
    code: number
    message: string
  }
  timestamp: string
}

type BackendResponse<TData extends object> = BackendResponseSuccess<TData> | BackendResponseError

type ServiceResult<TData extends object> =
  | { ok: true; data: TData }
  | { ok: false; message: string }

// ----------------------------------------------------------------------

const backendHeaders = {
  Origin: UI_BASE_URL,
  Authorization: `Bearer ${BACKEND_API_TOKEN}`
}

const normalizeError = (response: BackendResponseError) => response.data?.message || 'Unknown error'

function extractError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const body = error.response.data as BackendResponseError
    return body.data?.message || error.message
  }
  return error instanceof Error ? error.message : 'Unknown error'
}

async function request<TData extends object>(
  method: 'get' | 'post',
  path: string,
  body?: Record<string, unknown>
): Promise<ServiceResult<TData>> {
  try {
    const url = `${BACKEND_API_URL}${path}`
    const response =
      method === 'get'
        ? await axios.get<BackendResponse<TData>>(url, { headers: backendHeaders })
        : await axios.post<BackendResponse<TData>>(url, body, { headers: backendHeaders })

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

function extractArray<T>(raw: any, key: string): T[] {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw[key])) return raw[key]
  return []
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
  return []
}

function normalizeMarket(raw: any): IPolymarketMarket {
  const outcomes = parseJsonArray(raw.outcomes)
  const outcomePrices = parseJsonArray(raw.outcomePrices ?? raw.outcome_prices)
  const tokenIds = parseJsonArray(raw.clobTokenIds)

  return {
    condition_id: raw.conditionId ?? raw.condition_id ?? '',
    question: raw.question ?? '',
    group_item_title: raw.groupItemTitle ?? raw.group_item_title ?? '',
    slug: raw.slug ?? '',
    image: raw.image ?? '',
    icon: raw.icon ?? '',
    description: raw.description ?? '',
    outcomes,
    outcome_prices: outcomePrices,
    volume: Number(raw.volumeNum ?? raw.volume ?? 0),
    volume_24hr: Number(raw.volume24hr ?? raw.volume_24hr ?? 0),
    liquidity: Number(raw.liquidityNum ?? raw.liquidity ?? 0),
    end_date_iso: raw.endDateIso ?? raw.end_date_iso ?? '',
    active: Boolean(raw.active),
    closed: Boolean(raw.closed),
    category: raw.category ?? '',
    tokens: tokenIds.map((id: string, idx: number) => ({
      token_id: id,
      outcome: outcomes[idx] ?? '',
      price: Number(outcomePrices[idx] ?? 0)
    }))
  }
}

function normalizeTeam(raw: any): IPolymarketTeam {
  return {
    name: raw.name ?? '',
    logo: raw.logo ?? '',
    abbreviation: raw.abbreviation ?? '',
    color: raw.color ?? '',
    ordering: raw.ordering ?? ''
  }
}

function normalizeEvent(raw: any): IPolymarketEvent {
  return {
    id: raw.id ?? '',
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    image: raw.image ?? '',
    icon: raw.icon ?? '',
    markets: Array.isArray(raw.markets) ? raw.markets.map(normalizeMarket) : [],
    // Sports events: team flags/crests (the event-level image is a generic sport image)
    ...(Array.isArray(raw.teams) && raw.teams.length > 0
      ? { teams: raw.teams.map(normalizeTeam) }
      : {}),
    ...(raw.showMarketImages !== undefined ? { show_market_images: !!raw.showMarketImages } : {})
  }
}

// ----------------------------------------------------------------------
// Read endpoints (GET)
// ----------------------------------------------------------------------

export async function getEvents(params?: string): Promise<ServiceResult<IPolymarketEvent[]>> {
  const path = `/polymarket/events${params ? `?${params}` : ''}`
  const result = await request<IPolymarketEvent[]>('get', path)
  if (!result.ok) return result
  const raw = extractArray<any>(result.data, 'events')
  return { ok: true, data: raw.map(normalizeEvent) }
}

export async function getMarkets(params?: string): Promise<ServiceResult<IPolymarketMarket[]>> {
  const path = `/polymarket/markets${params ? `?${params}` : ''}`
  const result = await request<IPolymarketMarket[]>('get', path)
  if (!result.ok) return result
  const raw = extractArray<any>(result.data, 'markets')
  return { ok: true, data: raw.map(normalizeMarket) }
}

export async function getMarketBySlug(slug: string): Promise<ServiceResult<IPolymarketMarket>> {
  const result = await request<IPolymarketMarket>('get', `/polymarket/markets/${slug}`)
  if (!result.ok) return result
  const rawData = result.data as any
  return { ok: true, data: normalizeMarket(rawData?.market || rawData) }
}

export async function searchMarkets(query: string): Promise<ServiceResult<IPolymarketEvent[]>> {
  const result = await request<IPolymarketEvent[]>(
    'get',
    `/polymarket/search?query=${encodeURIComponent(query)}`
  )
  if (!result.ok) return result
  const raw = extractArray<any>(result.data, 'events')
  return { ok: true, data: raw.map(normalizeEvent) }
}

export async function getCategories(): Promise<ServiceResult<IPolymarketCategory[]>> {
  const categories: IPolymarketCategory[] = [
    { id: 'politics', label: 'Politics', slug: 'politics' },
    { id: 'sports', label: 'Sports', slug: 'sports' },
    { id: 'crypto', label: 'Crypto', slug: 'crypto' },
    { id: 'esports', label: 'Esports', slug: 'esports' },
    { id: 'finance', label: 'Finance', slug: 'finance' },
    { id: 'geopolitics', label: 'Geopolitics', slug: 'geopolitics' },
    { id: 'tech', label: 'Tech', slug: 'tech' },
    { id: 'culture', label: 'Culture', slug: 'culture' },
    { id: 'economy', label: 'Economy', slug: 'economy' },
    { id: 'weather', label: 'Weather', slug: 'weather' }
  ]
  return { ok: true, data: categories }
}

// ----------------------------------------------------------------------
// Account management (POST)
// ----------------------------------------------------------------------

export async function getAccountStatus(
  channelUserId: string
): Promise<ServiceResult<IPolymarketAccountStatus>> {
  return request('post', '/polymarket/account/status', { channel_user_id: channelUserId })
}

export async function createAccount(
  channelUserId: string
): Promise<ServiceResult<IPolymarketAccountStatus>> {
  return request('post', '/polymarket/account/create', { channel_user_id: channelUserId })
}

export async function acceptTerms(
  channelUserId: string,
  termsVersion: number
): Promise<ServiceResult<{ terms_accepted: boolean }>> {
  return request('post', '/polymarket/account/accept_terms', {
    channel_user_id: channelUserId,
    terms_version: termsVersion
  })
}

// ----------------------------------------------------------------------
// Trading (POST)
// ----------------------------------------------------------------------

export async function placeOrder(
  channelUserId: string,
  orderData: IPolymarketOrderPayload
): Promise<ServiceResult<IPolymarketOrder>> {
  return request('post', '/polymarket/order/place', {
    channel_user_id: channelUserId,
    ...orderData
  })
}

export async function cancelOrder(
  channelUserId: string,
  orderId: string
): Promise<ServiceResult<{ cancelled: boolean }>> {
  return request('post', '/polymarket/order/cancel', {
    channel_user_id: channelUserId,
    order_id: orderId
  })
}

export async function purchase(
  channelUserId: string,
  payload: IPolymarketOrderPayload
): Promise<ServiceResult<IPolymarketPurchaseResponse>> {
  return request('post', '/polymarket/purchase', { channel_user_id: channelUserId, ...payload })
}

export async function purchaseStatus(
  channelUserId: string,
  purchaseId: string
): Promise<ServiceResult<IPolymarketPurchaseStatus>> {
  return request('post', '/polymarket/purchase/status', {
    channel_user_id: channelUserId,
    purchase_id: purchaseId
  })
}

export async function bridgeWithdraw(
  channelUserId: string,
  amount: string
): Promise<ServiceResult<{ success: boolean; hash?: string }>> {
  return request('post', '/polymarket/bridge/withdraw/', {
    channel_user_id: channelUserId,
    amount
  })
}

// ----------------------------------------------------------------------
// Portfolio (POST)
// ----------------------------------------------------------------------

export async function getPositions(
  channelUserId: string
): Promise<ServiceResult<IPolymarketPosition[]>> {
  return request<IPolymarketPosition[]>('post', '/polymarket/positions', {
    channel_user_id: channelUserId
  })
}

export async function getOrders(channelUserId: string): Promise<ServiceResult<IPolymarketOrder[]>> {
  return request<IPolymarketOrder[]>('post', '/polymarket/orders', {
    channel_user_id: channelUserId
  })
}

export async function getPortfolio(
  channelUserId: string
): Promise<ServiceResult<IPolymarketPortfolio>> {
  return request<IPolymarketPortfolio>('post', '/polymarket/portfolio', {
    channel_user_id: channelUserId
  })
}

// ----------------------------------------------------------------------
// Trade history & PNL (POST)
// ----------------------------------------------------------------------

export async function getTradesHistory(
  channelUserId: string,
  filters?: { market?: string; limit?: number; offset?: number; side?: string }
): Promise<ServiceResult<IPolymarketTrade[]>> {
  return request<IPolymarketTrade[]>('post', '/polymarket/trades', {
    channel_user_id: channelUserId,
    ...filters
  })
}

export async function getPnlHistory(
  channelUserId: string,
  limit?: number,
  interval?: IPolymarketPnlInterval
): Promise<ServiceResult<IPolymarketPnlPoint[]>> {
  return request<IPolymarketPnlPoint[]>('post', '/polymarket/pnl/history', {
    channel_user_id: channelUserId,
    ...(limit ? { limit } : {}),
    ...(interval ? { interval } : {})
  })
}

export async function getClosedPositions(
  channelUserId: string,
  market?: string
): Promise<ServiceResult<IPolymarketPosition[]>> {
  return request<IPolymarketPosition[]>('post', '/polymarket/positions/closed', {
    channel_user_id: channelUserId,
    ...(market ? { market } : {})
  })
}
