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
  /**
   * Path segment the explorer uses for a transaction, between the base URL and the hash.
   *
   * Every EVM explorer uses `/tx`, which is why callers used to hardcode it. Cardanoscan uses
   * `/transaction`, and a link built with the wrong one is a 404 pointing at a transaction that
   * really happened. Defaults to `/tx` when a chain does not say otherwise.
   */
  txPath?: string
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

// Values arriving from environment variables are trimmed as well as stripped: a stray
// space in a Cloud Build trigger would otherwise survive into the href and produce a
// malformed link. Seen in the develop trigger, where the marketplace URL was configured
// with a leading space.
const stripTrailingSlash = (url: string): string => url.trim().replace(/\/+$/, '')

export const SCROLL_CHAIN_ID = 534352
export const SCROLL_SEPOLIA_CHAIN_ID = 534351
export const ARBITRUM_CHAIN_ID = 42161
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614
/** Polymarket runs on Polygon mainnet, regardless of the active ChatterPay network. */
export const POLYGON_CHAIN_ID = 137

/**
 * Cardano has no EIP-155 chain id, so the backend assigns internal ones: `9e11 + network magic`.
 * They must match `src/config/cardanoConfig.ts` in the backend exactly — they are what a wallet, a
 * transaction and a token row carry in the database.
 */
export const CARDANO_PREPROD_CHAIN_ID = 900000000001
export const CARDANO_MAINNET_CHAIN_ID = 900764824073

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
    // OpenSea dropped testnet support, so testnets point at the block explorer,
    // which has its own NFT page and renders the artwork from the tokenURI.
    nftMarketplaceUrl: 'https://sepolia.scrollscan.com/nft',
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
    // OpenSea dropped testnet support — see the Scroll Sepolia entry above.
    nftMarketplaceUrl: 'https://sepolia.arbiscan.io/nft',
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
  },
  [CARDANO_PREPROD_CHAIN_ID]: {
    chainId: CARDANO_PREPROD_CHAIN_ID,
    name: 'Cardano Preprod',
    explorerUrl: 'https://preprod.cardanoscan.io',
    // Cardanoscan does not use `/tx`.
    txPath: '/transaction',
    nftExplorerUrl: 'https://preprod.cardanoscan.io',
    // No NFTs on Cardano in this release; the explorer's own page is the only sensible target.
    nftMarketplaceUrl: 'https://preprod.cardanoscan.io',
    logo: '',
    // Layerswap does not list Cardano, so the deposit widget hides itself — which is correct, and
    // why the wallet needs its own "receive" view instead.
    layerswapNetwork: '',
    testnet: true
  },
  [CARDANO_MAINNET_CHAIN_ID]: {
    chainId: CARDANO_MAINNET_CHAIN_ID,
    name: 'Cardano',
    explorerUrl: 'https://cardanoscan.io',
    txPath: '/transaction',
    nftExplorerUrl: 'https://cardanoscan.io',
    nftMarketplaceUrl: 'https://cardanoscan.io',
    logo: '',
    layerswapNetwork: '',
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
 * Whether a chain id belongs to the Cardano family.
 *
 * @param {number} [chainId] - Chain id to test.
 * @returns {boolean} True for either Cardano network.
 */
export function isCardanoChain(chainId?: number): boolean {
  return chainId === CARDANO_PREPROD_CHAIN_ID || chainId === CARDANO_MAINNET_CHAIN_ID
}

/**
 * Whether a transaction record points at something really on a chain.
 *
 * Not every row does: Polymarket orders and withdrawals carry synthetic ids (`pm-order-…`), and
 * linking those to an explorer produces a dead page. EVM hashes are recognised by their `0x`
 * prefix, which is why the check used to be just that — but **a Cardano transaction id is 64 hex
 * characters with no prefix**, so the same test silently strips the link off every Cardano
 * transfer.
 *
 * @param {string | undefined} txHash - The hash on the record.
 * @param {number} [chainId] - Chain the record belongs to.
 * @returns {boolean} True when the hash can be linked to an explorer.
 */
export function isOnChainTxHash(txHash?: string, chainId?: number): boolean {
  if (!txHash) return false
  if (isCardanoChain(chainId)) return /^[0-9a-f]{64}$/i.test(txHash)
  return txHash.startsWith('0x')
}

/**
 * Link to a transaction on its own chain's explorer.
 *
 * Use this instead of concatenating `/tx/`: the path is not the same on every explorer, and a link
 * built with the wrong one is a dead page for a transaction that really settled. The chain id comes
 * from the transaction record, so a row belonging to a network the app is not currently operating
 * on still links correctly.
 *
 * @param {string} txHash - Transaction hash or id, as the chain reports it.
 * @param {number} [chainId] - Chain the transaction belongs to; defaults to the active chain.
 * @returns {string} Absolute URL of the transaction on its explorer.
 */
export function getTxUrl(txHash: string, chainId?: number): string {
  const path = getChainConfig(chainId)?.txPath || '/tx'
  return `${getExplorerUrl(chainId)}${path}/${txHash}`
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
