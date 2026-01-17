import axios from 'axios'

import { cache } from 'src/app/api/services/cache/cache-service'

// ----------------------------------------------------------------------

export type TokenPriceData = {
  usd: number
  usd_24h_change: number
}

export type CoinGeckoPriceResponse = {
  [tokenId: string]: {
    usd?: number
    usd_24h_change?: number
  }
}

// ----------------------------------------------------------------------

/**
 * Fetch token prices and 24h price change from CoinGecko
 * @param tokenSymbols Array of token symbols (e.g., ['USDT', 'USDC', 'ETH'])
 * @returns Object mapping token symbols to price data
 */
export async function getTokenPricesWithChange(
  tokenSymbols: string[]
): Promise<Record<string, TokenPriceData>> {
  const cacheKey = `coingecko_prices_${tokenSymbols.sort().join('_')}`
  const fromCache = cache.get(cacheKey) as Record<string, TokenPriceData>

  if (fromCache) {
    console.info('CoinGecko prices from cache:', cacheKey)
    return fromCache
  }

  try {
    // Map token symbols to CoinGecko IDs
    const tokenIds = tokenSymbols.map((symbol) => getCoingeckoIdBySymbol(symbol)).join(',')

    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price'
    const params = {
      ids: tokenIds,
      vs_currencies: 'usd',
      include_24hr_change: 'true'
    }

    const response = await axios.get<CoinGeckoPriceResponse>(apiUrl, { params })
    const data = response.data

    // Map back to original symbols
    const result: Record<string, TokenPriceData> = {}
    for (const symbol of tokenSymbols) {
      const coinId = getCoingeckoIdBySymbol(symbol)
      const priceData = data[coinId]

      result[symbol] = {
        usd: priceData?.usd || 0,
        usd_24h_change: priceData?.usd_24h_change || 0
      }
    }

    // Cache for 5 minutes
    cache.set(cacheKey, result, 300)
    return result
  } catch (error) {
    console.error('Error fetching CoinGecko prices:', error.message)

    // Return fallback values
    const fallback: Record<string, TokenPriceData> = {}
    for (const symbol of tokenSymbols) {
      fallback[symbol] = { usd: 0, usd_24h_change: 0 }
    }
    return fallback
  }
}

/**
 * Map token symbol to CoinGecko token ID
 * Following the same mapping pattern as blockchain-service.ts
 */
function getCoingeckoIdBySymbol(symbol: string): string {
  switch (symbol.toUpperCase()) {
    case 'USDC':
      return 'usd-coin'
    case 'USDT':
      return 'tether'
    case 'DAI':
      return 'dai'
    case 'ETH':
    case 'WETH':
      return 'ethereum'
    case 'BTC':
    case 'WBTC':
      return 'wrapped-bitcoin'
    case 'SCR':
      return 'scroll'
    case 'USX':
      return 'usx'
    case 'STAKEDUS X':
      return 'usx' // Same as USX
    case 'USDQ':
      return 'usdq'
    case 'WSTETH':
      return 'wrapped-steth'
    default:
      console.warn(`Unknown token symbol: ${symbol}, using as-is`)
      return symbol.toLowerCase()
  }
}

/**
 * Get single token price data
 */
export async function getTokenPriceWithChange(symbol: string): Promise<TokenPriceData> {
  const result = await getTokenPricesWithChange([symbol])
  return result[symbol] || { usd: 0, usd_24h_change: 0 }
}
