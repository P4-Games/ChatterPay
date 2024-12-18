import { post, endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon, useGetCommonPaged } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.balance(walletId))
}

export function useGetWalletTransactions(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.transactions(walletId))
}

export function useGetWalletNfts(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.nfts.root(walletId))
}

export function useGetWalletNft(walletId: string, nftId: string) {
  return useGetCommon(endpoints.dashboard.wallet.nfts.id(walletId, nftId))
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

/*
export function useGetWalletNotifications(walletId: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    endpoints.dashboard.wallet.notifications(walletId),
    fetcher
  )

  return {
    data,
    isLoading,
    error,
    isValidating,
    mutate // Include mutate for manual refresh
  }

  // return useGetCommon(endpoints.dashboard.wallet.notifications(walletId))
}
*/

// ----------------------------------------------------------------------

export async function transferAll(userId: string, data: { walletTo: string }) {
  console.log('trasnfer all', userId, data)
  const res = await post(endpoints.dashboard.user.transferAll(userId), data, {})
  console.log('x', res)
  return res
}

function getNotificationsCacheUrl(walletId: string, pageIndex: number = 1, pageSize: number = 15) {
  const endpoint = endpoints.dashboard.wallet.notifications(walletId, pageIndex, pageSize)
  return [endpoint, { params: { endpoint: 'notifications' } }]
}
