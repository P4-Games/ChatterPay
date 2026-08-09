import { endpoints } from 'src/app/api/hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetTokens() {
  return useGetCommon(endpoints.tokens)
}
