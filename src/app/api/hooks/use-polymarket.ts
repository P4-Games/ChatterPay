import { useMemo, useCallback } from 'react'
import useSWRInfinite from 'swr/infinite'

import { post, endpoints, fetcher } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

import type {
  IPolymarketOrder,
  IPolymarketEvent,
  IPolymarketPosition,
  IPolymarketPortfolio,
  IPolymarketAccountStatus,
  IPolymarketOrderPayload
} from 'src/types/polymarket'

// ----------------------------------------------------------------------

const EVENTS_PAGE_SIZE = 20

// ----------------------------------------------------------------------

export function useGetPolymarketCategories() {
  return useGetCommon(
    endpoints.polymarket.categories(),
    { headers: getAuthorizationHeader() }
  )
}

export function useGetPolymarketEvents(params?: string) {
  return useGetCommon(
    endpoints.polymarket.events(params),
    { headers: getAuthorizationHeader() }
  )
}

export function useGetPolymarketEventsInfinite(category?: string) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If previous page returned fewer items than page size, we've reached the end
    if (previousPageData && (!previousPageData.ok || !Array.isArray(previousPageData.data) || previousPageData.data.length < EVENTS_PAGE_SIZE)) {
      return null
    }

    const params = new URLSearchParams()
    if (category && category !== 'All') params.append('category', category)
    params.append('limit', String(EVENTS_PAGE_SIZE))
    params.append('offset', String(pageIndex * EVENTS_PAGE_SIZE))

    return [
      endpoints.polymarket.events(params.toString()),
      { headers: getAuthorizationHeader() }
    ]
  }

  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite(getKey, fetcher, {
      revalidateFirstPage: true,
      revalidateAll: false
    })

  const allEvents: IPolymarketEvent[] = useMemo(
    () => data?.flatMap((page: any) => (Array.isArray(page.data) ? page.data : [])) ?? [],
    [data]
  )

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return true
    const lastPage = data[data.length - 1]
    if (!lastPage?.ok || !Array.isArray(lastPage.data)) return false
    return lastPage.data.length >= EVENTS_PAGE_SIZE
  }, [data])

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1)
    }
  }, [hasMore, isLoadingMore, setSize, size])

  const memoizedValue = useMemo(
    () => ({
      events: allEvents,
      isLoading,
      isLoadingMore,
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
  return useGetCommon(
    endpoints.polymarket.markets(params),
    { headers: getAuthorizationHeader() }
  )
}

export function useGetPolymarketMarket(slug: string) {
  return useGetCommon(
    slug ? endpoints.polymarket.marketBySlug(slug) : null,
    slug ? { headers: getAuthorizationHeader() } : {}
  )
}

export function useSearchPolymarkets(query: string) {
  return useGetCommon(
    query && query.trim() ? endpoints.polymarket.search(query) : null,
    query && query.trim() ? { headers: getAuthorizationHeader() } : {}
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

export async function polymarketPlaceOrder(
  orderData: IPolymarketOrderPayload
): Promise<{
  ok: boolean
  data?: IPolymarketOrder
  message?: string
}> {
  return post(endpoints.polymarket.order.place(), orderData, {
    headers: getAuthorizationHeader()
  })
}

export async function polymarketCancelOrder(
  orderId: string
): Promise<{
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
