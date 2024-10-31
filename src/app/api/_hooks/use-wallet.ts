import { post, endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon } from './common'

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

// ----------------------------------------------------------------------

export async function transferAll(userId: string, data: { walletTo: string }) {
  console.log('trasnfer all', userId, data)
  const res = await post(endpoints.dashboard.user.transferAll(userId), data, {})
  console.log('x', res)
  return res
}
