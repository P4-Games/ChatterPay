import { endpoints } from 'src/app/api/hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export type LifiChainSummary = {
  key: string
  name: string
  logoURI: string
}

/** Mainnet networks LiFi can bridge to, trimmed to name + logo by the proxy route. */
export function useGetLifiChainsSummary() {
  return useGetCommon(endpoints.proxy.lifiChainsSummary)
}
