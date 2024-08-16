import { useParams } from 'next/navigation'

import { NftView } from 'src/sections/nfts/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'user - NFTs'
}

export default function NftIdPage() {
  const params = useParams()

  // Asegurar que los parámetros sean string
  const walletId = Array.isArray(params.walletId) ? params.walletId[0] : params.walletId
  const nftId = Array.isArray(params.nftId) ? params.nftId[0] : params.nftId
  return <NftView walletId={walletId} nftId={nftId} />
}
