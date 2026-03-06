import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

import type {
  IPolymarketOrder,
  IPolymarketMarket,
  IPolymarketEvent,
  IPolymarketPosition,
  IPolymarketPortfolio,
  IPolymarketAccountStatus,
  IPolymarketOrderPayload
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

function extractArray<T>(raw: any, key: string): T[] {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw[key])) return raw[key]
  return []
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return [] }
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

function normalizeEvent(raw: any): IPolymarketEvent {
  return {
    id: raw.id ?? '',
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    markets: Array.isArray(raw.markets) ? raw.markets.map(normalizeMarket) : []
  }
}

// ----------------------------------------------------------------------
// Read endpoints (GET)
// ----------------------------------------------------------------------

export async function getEvents(params?: string): Promise<ServiceResult<IPolymarketEvent[]>> {
  try {
    const url = `${BACKEND_API_URL}/polymarket/events${params ? `?${params}` : ''}`
    const response = await axios.get<BackendResponse<IPolymarketEvent[]>>(url, {
      headers: backendHeaders
    })

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    const raw = extractArray<any>(response.data.data, 'events')
    return { ok: true, data: raw.map(normalizeEvent) }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function getMarkets(params?: string): Promise<ServiceResult<IPolymarketMarket[]>> {
  try {
    const url = `${BACKEND_API_URL}/polymarket/markets${params ? `?${params}` : ''}`
    const response = await axios.get<BackendResponse<IPolymarketMarket[]>>(url, {
      headers: backendHeaders
    })

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    const raw = extractArray<any>(response.data.data, 'markets')
    return { ok: true, data: raw.map(normalizeMarket) }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function getMarketBySlug(
  slug: string
): Promise<ServiceResult<IPolymarketMarket>> {
  try {
    const response = await axios.get<BackendResponse<IPolymarketMarket>>(
      `${BACKEND_API_URL}/polymarket/markets/${slug}`,
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    const rawData = response.data.data as any
    return { ok: true, data: normalizeMarket(rawData?.market || rawData) }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function searchMarkets(
  query: string
): Promise<ServiceResult<IPolymarketMarket[]>> {
  try {
    const response = await axios.get<BackendResponse<IPolymarketMarket[]>>(
      `${BACKEND_API_URL}/polymarket/search?query=${encodeURIComponent(query)}`,
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    const raw = extractArray<any>(response.data.data, 'markets')
    return { ok: true, data: raw.map(normalizeMarket) }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

// ----------------------------------------------------------------------
// Account management (POST)
// ----------------------------------------------------------------------

export async function getAccountStatus(
  channelUserId: string
): Promise<ServiceResult<IPolymarketAccountStatus>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketAccountStatus>>(
      `${BACKEND_API_URL}/polymarket/account/status`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function createAccount(
  channelUserId: string
): Promise<ServiceResult<IPolymarketAccountStatus>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketAccountStatus>>(
      `${BACKEND_API_URL}/polymarket/account/create`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function acceptTerms(
  channelUserId: string
): Promise<ServiceResult<{ terms_accepted: boolean }>> {
  try {
    const response = await axios.post<BackendResponse<{ terms_accepted: boolean }>>(
      `${BACKEND_API_URL}/polymarket/account/accept_terms`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

// ----------------------------------------------------------------------
// Trading (POST)
// ----------------------------------------------------------------------

export async function placeOrder(
  channelUserId: string,
  orderData: IPolymarketOrderPayload
): Promise<ServiceResult<IPolymarketOrder>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketOrder>>(
      `${BACKEND_API_URL}/polymarket/order/place`,
      { channel_user_id: channelUserId, ...orderData },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function cancelOrder(
  channelUserId: string,
  orderId: string
): Promise<ServiceResult<{ cancelled: boolean }>> {
  try {
    const response = await axios.post<BackendResponse<{ cancelled: boolean }>>(
      `${BACKEND_API_URL}/polymarket/order/cancel`,
      { channel_user_id: channelUserId, order_id: orderId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

// ----------------------------------------------------------------------
// Portfolio (POST)
// ----------------------------------------------------------------------

export async function getPositions(
  channelUserId: string
): Promise<ServiceResult<IPolymarketPosition[]>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketPosition[]>>(
      `${BACKEND_API_URL}/polymarket/positions`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function getOrders(
  channelUserId: string
): Promise<ServiceResult<IPolymarketOrder[]>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketOrder[]>>(
      `${BACKEND_API_URL}/polymarket/orders`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}

export async function getPortfolio(
  channelUserId: string
): Promise<ServiceResult<IPolymarketPortfolio>> {
  try {
    const response = await axios.post<BackendResponse<IPolymarketPortfolio>>(
      `${BACKEND_API_URL}/polymarket/portfolio`,
      { channel_user_id: channelUserId },
      { headers: backendHeaders }
    )

    if (response.data.status !== 'success') {
      return { ok: false, message: normalizeError(response.data) }
    }

    return { ok: true, data: response.data.data }
  } catch (error) {
    return { ok: false, message: extractError(error) }
  }
}
