import { post, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

import type {
  IPolymarketOrder,
  IPolymarketPosition,
  IPolymarketPortfolio,
  IPolymarketAccountStatus,
  IPolymarketOrderPayload
} from 'src/types/polymarket'

export function useGetPolymarketEvents(params?: string) {
  return useGetCommon(
    endpoints.polymarket.events(params),
    { headers: getAuthorizationHeader() }
  )
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

export async function polymarketAcceptTerms(): Promise<{
  ok: boolean
  data?: { terms_accepted: boolean }
  message?: string
}> {
  return post(endpoints.polymarket.account.acceptTerms(), {}, { headers: getAuthorizationHeader() })
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
