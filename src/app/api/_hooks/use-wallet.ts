import { endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.balance(walletId))
}

export function useGetWalletTransactions(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.transactions(walletId))
}

export function useGetWalletNfts(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.nfts(walletId))
}
