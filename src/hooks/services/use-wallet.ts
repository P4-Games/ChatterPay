import { endpoints } from 'src/app/api/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.balance(walletId))
}

export function useGetWalletTranscations(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.transactions(walletId))
}
