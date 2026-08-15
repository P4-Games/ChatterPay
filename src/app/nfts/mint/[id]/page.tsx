import { NftMintView } from 'src/sections/nfts/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'NFT Mint'
}

export default function NftMintPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams?: { chainId?: string }
}) {
  // Token ids repeat across networks; a link may name the one it belongs to.
  const chainId = Number(searchParams?.chainId) || undefined

  return <NftMintView nftId={params.id} chainId={chainId} />
}
