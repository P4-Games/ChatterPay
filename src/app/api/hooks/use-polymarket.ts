import { useMemo, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { post, endpoints, fetcher } from 'src/app/api/hooks/api-resolver'
import { POLYMARKET_REFRESH } from 'src/config-global'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

import type {
  IPolymarketOrder,
  IPolymarketEvent,
  IPolymarketPosition,
  IPolymarketPortfolio,
  IPolymarketAccountStatus,
  IPolymarketOrderPayload,
  IPolymarketPurchaseResponse,
  IPolymarketPurchaseStatus,
  IPolymarketActivePurchase,
  IPolymarketTrade,
  IPolymarketPnlPoint,
  IPolymarketPnlInterval
} from 'src/types/polymarket'

// ----------------------------------------------------------------------

const EVENTS_PAGE_SIZE = 20

// ----------------------------------------------------------------------

export function useGetPolymarketEvents(params?: string) {
  return useGetCommon(endpoints.polymarket.events(params), { headers: getAuthorizationHeader() })
}

export function useGetPolymarketEventsInfinite(category?: string, userId?: string) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (
      previousPageData &&
      (!previousPageData.ok ||
        !Array.isArray(previousPageData.data) ||
        previousPageData.data.length < EVENTS_PAGE_SIZE)
    ) {
      return null
    }

    const params = new URLSearchParams()
    if (category && category !== 'All') params.append('category', category)
    params.append('limit', String(EVENTS_PAGE_SIZE))
    params.append('offset', String(pageIndex * EVENTS_PAGE_SIZE))

    return [
      endpoints.polymarket.events(params.toString()),
      { headers: getAuthorizationHeader(), userId }
    ]
  }

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: true,
    revalidateAll: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  // Reset to page 1 whenever the category changes so switching filters doesn't
  // instantly re-request every previously scrolled-to page under the new category.
  useEffect(() => {
    setSize(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const allEvents: IPolymarketEvent[] = useMemo(() => {
    const map = new Map<string, IPolymarketEvent>()
    for (const page of data || []) {
      for (const event of Array.isArray(page.data) ? page.data : []) {
        const key = event.id || event.slug
        if (key && !map.has(key)) map.set(key, event)
      }
    }
    return Array.from(map.values())
  }, [data])

  const isLoadingMore = !isLoading && size > 0 && data && typeof data[size - 1] === 'undefined'

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return true
    const lastPage = data[data.length - 1]
    if (!lastPage?.ok || !Array.isArray(lastPage.data)) return false
    return lastPage.data.length >= EVENTS_PAGE_SIZE
  }, [data])

  // Stable loadMore — use functional setSize so callback identity never changes
  const loadMore = useCallback(() => {
    setSize((s) => s + 1)
  }, [setSize])

  const memoizedValue = useMemo(
    () => ({
      events: allEvents,
      isLoading,
      isLoadingMore: !!isLoadingMore,
      error,
      isValidating,
      hasMore,
      loadMore
    }),
    [allEvents, isLoading, isLoadingMore, error, isValidating, hasMore, loadMore]
  )

  return memoizedValue
}

export function useGetPolymarketMarkets(params?: string) {
  return useGetCommon(endpoints.polymarket.markets(params), { headers: getAuthorizationHeader() })
}

export function useGetPolymarketMarket(slug: string) {
  return useGetCommon(
    slug ? endpoints.polymarket.marketBySlug(slug) : null,
    slug ? { headers: getAuthorizationHeader() } : {},
    POLYMARKET_REFRESH.LIVE_MS
  )
}

export function useSearchPolymarkets(query: string) {
  return useGetCommon(
    query && query.trim() ? endpoints.polymarket.search(query) : null,
    query && query.trim() ? { headers: getAuthorizationHeader() } : {}
  )
}

// ----------------------------------------------------------------------
// Polling SWR Hooks
// ----------------------------------------------------------------------

const postFetcher = async (args: [string, any, any]) => {
  const [url, data, config] = args
  return post(url, data, config)
}

export function useGetPolymarketPositionsSWR(
  refreshInterval = POLYMARKET_REFRESH.LIVE_MS,
  enabled = true
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? [endpoints.polymarket.positions(), {}, { headers: getAuthorizationHeader() }] : null,
    postFetcher,
    { refreshInterval }
  )
  return useMemo(
    () => ({
      data: (data?.data as any)?.positions as IPolymarketPosition[] | undefined,
      activePurchases: (data?.data as any)?.active_purchases as
        | IPolymarketActivePurchase[]
        | undefined,
      isLoading,
      error,
      isValidating,
      mutate,
      empty: !isLoading && !(data?.data as any)?.positions?.length
    }),
    [data, error, isLoading, isValidating, mutate]
  )
}

export function useGetPolymarketOrdersSWR(
  refreshInterval = POLYMARKET_REFRESH.LIVE_MS,
  enabled = true
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? [endpoints.polymarket.orders(), {}, { headers: getAuthorizationHeader() }] : null,
    postFetcher,
    { refreshInterval }
  )
  return useMemo(
    () => ({
      data: (data?.data as any)?.orders as IPolymarketOrder[] | undefined,
      isLoading,
      error,
      isValidating,
      mutate,
      empty: !isLoading && !(data?.data as any)?.orders?.length
    }),
    [data, error, isLoading, isValidating, mutate]
  )
}

export function useGetPolymarketPortfolioSWR(
  refreshInterval = POLYMARKET_REFRESH.LIVE_MS,
  enabled = true
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? [endpoints.polymarket.portfolio(), {}, { headers: getAuthorizationHeader() }] : null,
    postFetcher,
    { refreshInterval }
  )
  return useMemo(
    () => ({
      data: (data?.data as any)?.portfolio as IPolymarketPortfolio | undefined,
      isLoading,
      error,
      isValidating,
      mutate
    }),
    [data, error, isLoading, isValidating, mutate]
  )
}
// ----------------------------------------------------------------------
// Imperative functions (POST – mutate state, not SWR)
// ----------------------------------------------------------------------

export async function polymarketAccountStatus(): Promise<{
  ok: boolean
  data?: IPolymarketAccountStatus
  message?: string
}> {
  return post(endpoints.polymarket.account.status(), {}, { headers: getAuthorizationHeader() })
}

export async function polymarketCreateAccount(): Promise<{
  ok: boolean
  data?: IPolymarketAccountStatus
  message?: string
}> {
  return post(endpoints.polymarket.account.create(), {}, { headers: getAuthorizationHeader() })
}

export async function polymarketAcceptTerms(termsVersion: number): Promise<{
  ok: boolean
  data?: { terms_accepted: boolean }
  message?: string
}> {
  return post(
    endpoints.polymarket.account.acceptTerms(),
    { terms_version: termsVersion },
    { headers: getAuthorizationHeader() }
  )
}

export async function polymarketPlaceOrder(orderData: IPolymarketOrderPayload): Promise<{
  ok: boolean
  data?: IPolymarketOrder
  message?: string
}> {
  return post(endpoints.polymarket.order.place(), orderData, {
    headers: getAuthorizationHeader()
  })
}

export async function polymarketCancelOrder(orderId: string): Promise<{
  ok: boolean
  data?: { cancelled: boolean }
  message?: string
}> {
  return post(
    endpoints.polymarket.order.cancel(),
    { order_id: orderId },
    { headers: getAuthorizationHeader() }
  )
}

export async function polymarketGetPositions(): Promise<{
  ok: boolean
  data?: IPolymarketPosition[]
  message?: string
}> {
  return post(endpoints.polymarket.positions(), {}, { headers: getAuthorizationHeader() })
}

export async function polymarketGetOrders(): Promise<{
  ok: boolean
  data?: IPolymarketOrder[]
  message?: string
}> {
  return post(endpoints.polymarket.orders(), {}, { headers: getAuthorizationHeader() })
}

export async function polymarketGetPortfolio(): Promise<{
  ok: boolean
  data?: IPolymarketPortfolio
  message?: string
}> {
  return post(endpoints.polymarket.portfolio(), {}, { headers: getAuthorizationHeader() })
}

export async function polymarketPurchase(orderData: IPolymarketOrderPayload): Promise<{
  ok: boolean
  data?: IPolymarketPurchaseResponse
  message?: string
}> {
  return post(endpoints.polymarket.purchase.root(), orderData, {
    headers: getAuthorizationHeader()
  })
}

export async function polymarketPurchaseStatus(purchaseId: string): Promise<{
  ok: boolean
  data?: IPolymarketPurchaseStatus
  message?: string
}> {
  return post(
    endpoints.polymarket.purchase.status(),
    { purchase_id: purchaseId },
    {
      headers: getAuthorizationHeader()
    }
  )
}

export async function polymarketBridgeWithdraw(amount: string): Promise<{
  ok: boolean
  data?: { success: boolean; hash?: string; withdrawal_pending?: boolean }
  message?: string
}> {
  return post(
    endpoints.polymarket.bridge.withdraw(),
    { amount },
    {
      headers: getAuthorizationHeader()
    }
  )
}

// ----------------------------------------------------------------------
// Trade history & PNL
// ----------------------------------------------------------------------

export async function polymarketGetTrades(filters?: {
  market?: string
  limit?: number
  offset?: number
  side?: string
}): Promise<{
  ok: boolean
  data?: IPolymarketTrade[]
  message?: string
}> {
  return post(endpoints.polymarket.trades(), filters ?? {}, {
    headers: getAuthorizationHeader()
  })
}

export async function polymarketGetPnlHistory(
  limit?: number,
  interval?: IPolymarketPnlInterval
): Promise<{
  ok: boolean
  data?: IPolymarketPnlPoint[]
  message?: string
}> {
  return post(
    endpoints.polymarket.pnlHistory(),
    { ...(limit ? { limit } : {}), ...(interval ? { interval } : {}) },
    {
      headers: getAuthorizationHeader()
    }
  )
}

export function useGetPolymarketTradesSWR(
  refreshInterval = POLYMARKET_REFRESH.HISTORY_MS,
  market?: string,
  enabled = true
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled
      ? [
          endpoints.polymarket.trades(),
          market ? { market } : {},
          { headers: getAuthorizationHeader() }
        ]
      : null,
    postFetcher,
    { refreshInterval }
  )
  const raw = data?.data as any
  const trades = Array.isArray(raw) ? raw : (raw?.trades ?? [])
  return useMemo(
    () => ({
      data: trades as IPolymarketTrade[],
      isLoading,
      error,
      isValidating,
      mutate
    }),
    [trades, error, isLoading, isValidating, mutate]
  )
}

export function useGetPolymarketClosedPositionsSWR(
  refreshInterval = POLYMARKET_REFRESH.HISTORY_MS
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [endpoints.polymarket.closedPositions(), {}, { headers: getAuthorizationHeader() }],
    postFetcher,
    { refreshInterval }
  )
  const raw = data?.data as any
  const positions = Array.isArray(raw) ? raw : (raw?.positions ?? [])
  return useMemo(
    () => ({
      data: positions as IPolymarketPosition[],
      isLoading,
      error,
      isValidating,
      mutate
    }),
    [positions, error, isLoading, isValidating, mutate]
  )
}
