import { post, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

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
