import { endpoints } from 'src/app/api/hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetNftById(nftId: string, chainId?: number) {
  return useGetCommon(endpoints.nft.id(nftId, chainId))
}
