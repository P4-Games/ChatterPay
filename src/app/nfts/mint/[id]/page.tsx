import { NftMintView } from 'src/sections/nfts/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'NFT Mint'
}

export default function NftMintPage({ params }: { params: { id: string } }) {
  return <NftMintView nftId={params.id} />
}
