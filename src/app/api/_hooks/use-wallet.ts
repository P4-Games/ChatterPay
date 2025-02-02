import { post, endpoints } from 'src/app/api/_hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon, useGetCommonPaged } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.balance(walletId), {
    headers: getAuthorizationHeader()
  })
}

export function useGetWalletTransactions(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.transactions(walletId), {
    headers: getAuthorizationHeader()
  })
}

export function useGetWalletNfts(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.nfts.root(walletId), {
    headers: getAuthorizationHeader()
  })
}

export function useGetWalletNft(walletId: string, nftId: string) {
  return useGetCommon(endpoints.dashboard.wallet.nfts.id(walletId, nftId), {
    headers: getAuthorizationHeader()
  })
}

export function useGetWalletNotifications(
  walletid: string,
  pageSize: number,
  refreshInterval: number
) {
  const getKey: any = (pageIndex: number) =>
    getNotificationsCacheUrl(walletid, pageIndex + 1, pageSize)
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

export async function transferAll(userId: string, data: { walletTo: string }) {
  const res = await post(endpoints.dashboard.user.transferAll(userId), data, {
    headers: getAuthorizationHeader()
  })
  return res
}

function getNotificationsCacheUrl(walletId: string, pageIndex: number = 1, pageSize: number = 15) {
  const endpoint = endpoints.dashboard.wallet.notifications(walletId, pageIndex, pageSize)
  return [endpoint, { params: { endpoint: 'notifications' } }]
}
