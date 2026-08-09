import {
  NETWORK_NAME,
  EXPLORER_L2_URL,
  DEFAULT_CHAIN_ID,
  EXPLORER_NFT_URL,
  GCP_BUCKET_BASE_URL,
  NFT_MARKETPLACE_URL
} from './config-global'

// ----------------------------------------------------------------------
// Chain registry
//
// The app *operates* on a single chain at a time (the active one, configured
// via NEXT_PUBLIC_DEFAULT_CHAIN_ID + the NEXT_PUBLIC_EXPLORER_* vars). But it
// has to *display* data that belongs to other chains: a user keeps the wallet,
// NFTs and transaction history of every network they ever operated on, and
// those rows need their own explorer / marketplace links.
//
// A single active value per environment variable can't cover that, so the
// per-chain, non-sensitive presentation config lives here, versioned with the
// code and indexed by chain id. The active chain still reads its URLs from the
// environment first, so a deployment can override them without a code change.
// ----------------------------------------------------------------------

export type ChainConfig = {
  chainId: number
  /** Human-readable network name shown in the UI. */
  name: string
  /** Block explorer base URL (no trailing slash). */
  explorerUrl: string
  /** Explorer used for NFT mint transactions — usually the same as `explorerUrl`. */
  nftExplorerUrl: string
  /** NFT marketplace collection base URL: `<url>/<contract>/<tokenId>`. */
  nftMarketplaceUrl: string
  /**
   * Network icon, relative to GCP_BUCKET_BASE_URL. Empty when there is no
   * artwork uploaded for the chain — callers fall back to a text avatar.
   */
  logo: string
  /**
   * Network identifier used by Layerswap as the deposit destination, taken from
   * their networks API. Empty when Layerswap does not list the chain: the
   * deposit widget is then hidden, because sending a user to deposit on a
   * network other than the one their wallet lives on would misroute the funds.
   */
  layerswapNetwork: string
  testnet: boolean
}

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

export const SCROLL_CHAIN_ID = 534352
export const SCROLL_SEPOLIA_CHAIN_ID = 534351
export const ARBITRUM_CHAIN_ID = 42161
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614
/** Polymarket runs on Polygon mainnet, regardless of the active ChatterPay network. */
export const POLYGON_CHAIN_ID = 137

export const CHAINS: Record<number, ChainConfig> = {
  [SCROLL_CHAIN_ID]: {
    chainId: SCROLL_CHAIN_ID,
    name: 'Scroll',
    explorerUrl: 'https://scrollscan.com',
    nftExplorerUrl: 'https://scrollscan.com',
    nftMarketplaceUrl: 'https://opensea.io/assets/scroll',
    logo: '',
    layerswapNetwork: 'SCROLL_MAINNET',
    testnet: false
  },
  [SCROLL_SEPOLIA_CHAIN_ID]: {
    chainId: SCROLL_SEPOLIA_CHAIN_ID,
    name: 'Scroll Sepolia',
    explorerUrl: 'https://sepolia.scrollscan.com',
    nftExplorerUrl: 'https://sepolia.scrollscan.com',
    nftMarketplaceUrl: 'https://testnets.opensea.io/assets/scroll-sepolia',
    logo: '',
    // Layerswap lists no testnets in its public networks API.
    layerswapNetwork: '',
    testnet: true
  },
  [ARBITRUM_CHAIN_ID]: {
    chainId: ARBITRUM_CHAIN_ID,
    name: 'Arbitrum',
    explorerUrl: 'https://arbiscan.io',
    nftExplorerUrl: 'https://arbiscan.io',
    nftMarketplaceUrl: 'https://opensea.io/assets/arbitrum',
    logo: '',
    layerswapNetwork: 'ARBITRUM_MAINNET',
    testnet: false
  },
  [ARBITRUM_SEPOLIA_CHAIN_ID]: {
    chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
    name: 'Arbitrum Sepolia',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nftExplorerUrl: 'https://sepolia.arbiscan.io',
    nftMarketplaceUrl: 'https://testnets.opensea.io/assets/arbitrum_sepolia',
    logo: '',
    // Pending: confirm the sandbox identifier with Layerswap to re-enable deposits in dev.
    layerswapNetwork: '',
    testnet: true
  },
  [POLYGON_CHAIN_ID]: {
    chainId: POLYGON_CHAIN_ID,
    name: 'Polygon',
    explorerUrl: 'https://polygonscan.com',
    nftExplorerUrl: 'https://polygonscan.com',
    nftMarketplaceUrl: 'https://opensea.io/assets/matic',
    logo: '',
    layerswapNetwork: 'POLYGON_MAINNET',
    testnet: false
  }
}

// ----------------------------------------------------------------------

const isActiveChain = (chainId?: number): boolean => chainId == null || chainId === DEFAULT_CHAIN_ID

/**
 * Registry entry for a chain id, or `undefined` when the chain is unknown.
 * @param {number} [chainId] - Chain id to look up; defaults to the active chain.
 * @returns {ChainConfig | undefined} Chain configuration.
 */
export function getChainConfig(chainId?: number): ChainConfig | undefined {
  return CHAINS[chainId ?? DEFAULT_CHAIN_ID]
}

/**
 * Display name of a network. The active chain honours NEXT_PUBLIC_NETWORK so a
 * deployment can rename it without touching the registry.
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Network name, or a generic label for unknown chains.
 */
export function getChainName(chainId?: number): string {
  if (isActiveChain(chainId)) return NETWORK_NAME
  return getChainConfig(chainId)?.name || `Chain ${chainId}`
}

/**
 * Block explorer base URL for a chain, environment value first for the active one.
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Explorer base URL without trailing slash.
 */
export function getExplorerUrl(chainId?: number): string {
  if (isActiveChain(chainId)) return stripTrailingSlash(EXPLORER_L2_URL)
  return stripTrailingSlash(getChainConfig(chainId)?.explorerUrl || EXPLORER_L2_URL)
}

/**
 * Explorer base URL used for NFT mint transactions.
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Explorer base URL without trailing slash.
 */
export function getNftExplorerUrl(chainId?: number): string {
  if (isActiveChain(chainId)) return stripTrailingSlash(EXPLORER_NFT_URL)
  return stripTrailingSlash(getChainConfig(chainId)?.nftExplorerUrl || EXPLORER_NFT_URL)
}

/**
 * NFT marketplace collection base URL for a chain.
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Marketplace base URL without trailing slash.
 */
export function getNftMarketplaceUrl(chainId?: number): string {
  if (isActiveChain(chainId)) return stripTrailingSlash(NFT_MARKETPLACE_URL)
  return stripTrailingSlash(getChainConfig(chainId)?.nftMarketplaceUrl || NFT_MARKETPLACE_URL)
}

/**
 * Absolute URL of the network icon, or an empty string when the chain has none.
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Icon URL, or '' when there is no artwork for the chain.
 */
export function getChainLogoUrl(chainId?: number): string {
  const logo = getChainConfig(chainId)?.logo
  return logo ? `${GCP_BUCKET_BASE_URL}/${logo}` : ''
}

/**
 * Layerswap destination network for a chain, or '' when Layerswap has none.
 *
 * A deposit lands on the network Layerswap is told to send it to, at the
 * address it is given. Those two have to belong to the same chain: a user's
 * ChatterPay address is a per-chain proxy, so the same address on another
 * network is not theirs. That is why this follows the active chain rather than
 * being fixed, and why callers must treat '' as "no deposit flow available"
 * instead of falling back to some other network.
 *
 * @param {number} [chainId] - Chain id; defaults to the active chain.
 * @returns {string} Layerswap network identifier, or '' when unsupported.
 */
export function getLayerswapNetwork(chainId?: number): string {
  return getChainConfig(chainId)?.layerswapNetwork || ''
}
