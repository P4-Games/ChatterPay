import NftShareView from 'src/sections/nfts/view/nft-share-view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'NFT Share'
}

export default function NftMintPage({ params }: { params: { id: string } }) {
  return <NftShareView nftId={params.id} />
}
