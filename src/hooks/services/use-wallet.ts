import { endpoints } from 'src/app/api/_utils/apiResolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetWalletBalance(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.balance(walletId))
}

export function useGetWalletDummy(walletId: string) {
  return useGetCommon(endpoints.dashboard.wallet.dummy(walletId))
}
