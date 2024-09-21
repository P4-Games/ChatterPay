import { endpoints } from 'src/app/api/_hooks/api-resolver'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export function useGetNftById(nftId: string) {
  return useGetCommon(endpoints.nft.id(nftId))
}
