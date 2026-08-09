import { endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetChatterpointsSummary(walletId: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.chatterpoints.history(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  )
}
