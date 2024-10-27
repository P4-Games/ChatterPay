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

export async function transferAll(walletId: string, data: { walletTo: string }) {
  const res = await post(endpoints.dashboard.wallet.transferAll(walletId), data, {})
  return res
}
