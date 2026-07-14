import { NFT_IMAGE_REPOSITORY } from 'src/config-global'

import type { INFT, ImageURLRepository } from 'src/types/wallet'

// ----------------------------------------------------------------------

/**
 * Resolves the display image for an NFT, preferring the configured repository.
 * @param {INFT} nft - NFT record.
 * @returns {string} Image URL (falls back to the default artwork).
 */
export function getNftImageUrl(nft: INFT): string {
  const repo = NFT_IMAGE_REPOSITORY as ImageURLRepository
  return (
    nft.metadata.image_url[repo] ||
    nft.metadata.image_url.gcp ||
    '/assets/images/nfts/default_nft.png'
  )
}
