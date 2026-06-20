import useSWR from 'swr'
import { useMemo, useEffect } from 'react'

import { post, fetcher, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import type { ITransaction } from 'src/types/wallet'

import { useGetCommon, useGetCommonPaged } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.balance(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  )
}

export function useGetWalletTransactions(walletId: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.transactions(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  )
}

// ----------------------------------------------------------------------
// Cached + incremental transactions
//
// The history grows unbounded and old records never change, so refetching the
// whole list on every visit is slow and memory-heavy. Instead we:
//   1. Hydrate instantly from a per-wallet localStorage snapshot (fallbackData).
//   2. Fetch only the newest HEAD_LIMIT records from the server.
//   3. Merge by id (fresh wins) so newly-confirmed / status-changed records
//      override the cache while the older tail is reused untouched.
// ----------------------------------------------------------------------

// Fetch the newest N records each time. This is bounded and cheap (vs. the whole
// unbounded history) yet still overrides in-place status changes of recent rows.
// Anything older lives only in the localStorage cache and is reused untouched.
const HEAD_LIMIT = 50
const TX_CACHE_MAX = 200

const txCacheKey = (walletId: string) => `cp:txs:${walletId}`

function readTxCache(walletId: string): ITransaction[] {
  if (typeof window === 'undefined' || !walletId) return []
  try {
    const raw = window.localStorage.getItem(txCacheKey(walletId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeTxCache(walletId: string, txs: ITransaction[]) {
  if (typeof window === 'undefined' || !walletId) return
  try {
    window.localStorage.setItem(txCacheKey(walletId), JSON.stringify(txs.slice(0, TX_CACHE_MAX)))
  } catch {
    // ignore quota / serialization errors — cache is best-effort
  }
}

function txTime(t: ITransaction): number {
  const d = t?.date
  if (d == null) return 0
  if (typeof d === 'number') return d
  const ms = new Date(d as string | Date).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function mergeTransactions(cached: ITransaction[], fresh: ITransaction[]): ITransaction[] {
  const map = new Map<string, ITransaction>()
  for (const t of cached) if (t?.id) map.set(t.id, t)
  // Fresh records override cached ones with the same id (captures status changes).
  for (const t of fresh) if (t?.id) map.set(t.id, t)
  return Array.from(map.values()).sort((a, b) => txTime(b) - txTime(a))
}

export function useGetWalletTransactionsCached(walletId: string) {
  // Synchronous read so the very first render already shows cached history.
  const initialCache = useMemo(() => readTxCache(walletId), [walletId])

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    walletId
      ? [
          endpoints.dashboard.wallet.transactions(walletId, { limit: HEAD_LIMIT }),
          { headers: getAuthorizationHeader() }
        ]
      : null,
    fetcher,
    {
      fallbackData: initialCache.length ? initialCache.slice(0, HEAD_LIMIT) : undefined,
      keepPreviousData: true,
      dedupingInterval: 15000,
      focusThrottleInterval: 60000,
      revalidateOnFocus: true
    }
  )

  const fresh: ITransaction[] = Array.isArray(data) ? data : []

  const merged = useMemo(() => mergeTransactions(initialCache, fresh), [initialCache, fresh])

  useEffect(() => {
    if (walletId && fresh.length) writeTxCache(walletId, merged)
  }, [walletId, merged, fresh.length])

  return useMemo(
    () => ({
      data: merged,
      // Only block on initial load when there's nothing cached to show.
      isLoading: isLoading && initialCache.length === 0,
      error,
      isValidating,
      mutate
    }),
    [merged, isLoading, initialCache.length, error, isValidating, mutate]
  )
}

export function useGetWalletNfts(walletId?: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.nfts.root(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  )
}

export function useGetWalletNft(walletId?: string, nftId?: string) {
  return useGetCommon(
    walletId && nftId ? endpoints.dashboard.wallet.nfts.id(walletId, nftId) : null,
    walletId && nftId ? { headers: getAuthorizationHeader() } : {}
  )
}
export function useGetWalletNotifications(
  walletId?: string,
  pageSize: number = 15,
  refreshInterval: number = 0
) {
  const getKey: any = (pageIndex: number) =>
    walletId ? getNotificationsCacheUrl(walletId, pageIndex + 1, pageSize) : null

  return useGetCommonPaged(getKey, {
    initialSize: 1,
    revalidateAll: false,
    persistSize: true,
    refreshInterval,
    revalidateOnFocus: true,
    revalidateFirstPage: true
  })
}
// ----------------------------------------------------------------------

function getNotificationsCacheUrl(walletId: string, pageIndex: number = 1, pageSize: number = 15) {
  const endpoint = endpoints.dashboard.wallet.notifications(walletId, pageIndex, pageSize)
  return [endpoint, { params: { endpoint: 'notifications' } }]
}
