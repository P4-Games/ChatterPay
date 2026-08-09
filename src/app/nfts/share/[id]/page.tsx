import NftShareView from 'src/sections/nfts/view/nft-share-view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'NFT Share'
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

  return <NftShareView nftId={params.id} chainId={chainId} />
}
