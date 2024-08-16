import axios from 'axios'
import { ethers, JsonRpcProvider } from 'ethers'

import {
  USE_MOCK,
  API3_ENABLED,
  defaultBalance,
  tokensByNetwork,
  BACKEND_API_URL,
  nodeProviderUrlSepolia
} from 'src/config-global'

import { IBalance, IBalances, CurrencyKey } from 'src/types/wallet'

import { _balances } from './_mock'
import { cache } from './cache-connection'
import TokenPriceFeedsAbi from './_abis/TokenPriceFeedsAbi.json'

// ---------------------------------------------------------------------------------------------

export async function getBalancesWithTotalsFromBackend(walletAddress: string): Promise<IBalances> {
  let balances: IBalances
  const cacheKey = `getBalancesWithTotalsFromBackend.${walletAddress}`
  const fromCache = cache.get(cacheKey) as IBalances

  if (fromCache) {
    console.info('from cache:', cacheKey)
    return fromCache
  }

  try {
    const response = await axios.get(`${BACKEND_API_URL}/balance/${walletAddress}`)
    balances = response.data as IBalances
    cache.set(cacheKey, balances, 60) // 1 minute
    return balances
  } catch (error) {
    console.error('Error fetching balance from backend:', error)
    throw error
  }
}

export async function getBalancesWithTotals(walletAddress: string): Promise<IBalances> {
  let balances: IBalance[] = [defaultBalance]
  const cacheKey = `getBalancesWithTotals.${walletAddress}`

  if (USE_MOCK) {
    balances = _balances
  } else {
    const fromCache = cache.get(cacheKey) as IBalances

    if (fromCache) {
      console.info('from cache:', cacheKey)
      return fromCache
    }

    balances = await getBalances(walletAddress)
  }

  const totals: Record<CurrencyKey, number> = calculateTotals(balances)
  const result = {
    balances,
    totals,
    wallet: walletAddress
  }
  cache.set(cacheKey, result, 60) // 1 minute

  return result
}

export async function getConversationRates(): Promise<any> {
  const cacheKey = `getConversationRates`
  const fromCache = cache.get(cacheKey)

  if (fromCache) {
    return fromCache
  }

  const result = await getCoingeckoConversionRates()
  cache.set(cacheKey, result)
  return result
}

// ---------------------------------------------------------------------------------------------

async function getBalances(walletAddress: string): Promise<any[]> {
  const coinGeckoRates = await getCoingeckoConversionRates()
  const api3Rates = await getApi3ConversationRates() // check inside only if enabled!

  console.info(`Wallet ${walletAddress}, coinGecko Rates:`, coinGeckoRates)
  console.info(
    `Wallet ${walletAddress}, api3 enabled?: ${API3_ENABLED.toString()}, api3 Rates:`,
    api3Rates
  )

  if (!coinGeckoRates) {
    throw new Error('Could not fetch conversion rates')
  }

  const balances: any[] = []
  const tokenAbi = ['function balanceOf(address) view returns (uint256)']

  // Code that need to be refactored by performance
  await Promise.all(
    Object.entries(tokensByNetwork)
      .filter(([networkKey, network]) => network.config.enabled === 'true')
      .map(async ([networkKey, network]) => {
        const provider = new JsonRpcProvider(network.config.chainNodeProviderUrl)
        const ethBalance = await provider.getBalance(walletAddress)
        const ethBalanceFormatted = parseFloat(ethers.formatUnits(ethBalance, 18))
        const ethRateCoinGecko = getRateByKey(coinGeckoRates, 'eth')
        const ethRateApi3 = getRateByKey(api3Rates, 'eth')
        const ethRateApi3Usd = parseFloat(ethers.formatUnits(ethRateApi3.usd, 18)) // API3: no rate in ARS or BRL

        // netowrk Main Token
        balances.push({
          network: network.config.chainName,
          token: network.config.chainCurrency,
          balance: ethers.formatUnits(ethBalance, 18),
          balance_conv: {
            usd: (API3_ENABLED ? ethRateApi3Usd : ethRateCoinGecko.usd) * ethBalanceFormatted,
            ars: ethRateCoinGecko.ars * ethBalanceFormatted,
            brl: ethRateCoinGecko.brl * ethBalanceFormatted,
            uyu: ethRateCoinGecko.uyu * ethBalanceFormatted
          }
        })

        // custom tokens (l2)
        // TODO: to be improved
        const cutomTokens = await fethCustomTokens(walletAddress)
        if (cutomTokens && cutomTokens.balances) {
          const customTokenBalances = cutomTokens.balances[0]
          const customTokenRateCoinGecko = getRateByKey(coinGeckoRates, 'usdt')
          balances.push({
            network: 'Scroll',
            token: customTokenBalances.token,
            balance: customTokenBalances.balance,
            balance_conv: {
              usd: customTokenRateCoinGecko.usd * customTokenBalances.balance,
              ars: customTokenRateCoinGecko.ars * customTokenBalances.balance,
              brl: customTokenRateCoinGecko.brl * customTokenBalances.balance,
              uyu: customTokenRateCoinGecko.uyu * customTokenBalances.balance
            }
          })
        }

        // ERC20 Tokens
        await Promise.all(
          Object.entries(network.tokens)
            .filter(([tokenKey, token]) => token.enabled === 'true')
            .map(async ([tokenKey, token]) => {
              try {
                const tokenContract = new ethers.Contract(
                  removeQuotes(token.contract),
                  tokenAbi,
                  provider
                )
                const tokenBalance = await getTokenBalance(tokenContract, walletAddress)
                const tokenBalanceFormatted = parseFloat(
                  ethers.formatUnits(tokenBalance, token.decimals)
                )
                const tokenRateCoinGecko = getRateByKey(coinGeckoRates, token.token)
                const tokenRateApi3 = getRateByKey(api3Rates, token.token)
                const tokenRateApi3Usd = parseFloat(ethers.formatUnits(tokenRateApi3.usd, 18)) // API3: no rate in ARS or BRL

                balances.push({
                  network: network.config.chainName,
                  token: token.token,
                  balance: ethers.formatUnits(tokenBalance, token.decimals),
                  balance_conv: {
                    usd:
                      (API3_ENABLED && token.api3Exists
                        ? tokenRateApi3Usd
                        : tokenRateCoinGecko.usd) * tokenBalanceFormatted,
                    ars: tokenRateCoinGecko.ars * tokenBalanceFormatted,
                    brl: tokenRateCoinGecko.brl * tokenBalanceFormatted,
                    uyu: tokenRateCoinGecko.uyu * tokenBalanceFormatted
                  }
                })
              } catch (error) {
                console.error(
                  `Error getting ${token.token} balance of ${walletAddress} on ${network.config.chainName}`
                )
              }
            })
        )
      })
  )

  return balances
}

const fethCustomTokens = async (address: string) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/balance/${address}`)
    return response.data
  } catch (error) {
    console.error('Error fetching balance:', error)
    throw error
  }
}

async function getTokenBalance(
  tokenContract: ethers.Contract,
  walletAddress: string
): Promise<any> {
  try {
    const tokenBalance = await tokenContract.balanceOf(walletAddress)
    return tokenBalance
  } catch (error) {
    console.error(error)
    throw error
  }
}

function removeQuotes(text: string): string {
  if (text === '' || !text) return text
  return text.replace(/['"]/g, '')
}

function getRateByKey(rates: any, rateKey: string): any {
  switch (rateKey.toLowerCase()) {
    case 'dai':
      return rates.dai
    case 'usdc':
      return rates['usd-coin']
    case 'usdt':
      return rates.tether
    case 'eth':
      return rates.ethereum
    case 'btc':
      return rates.bitcoin
    case 'wbtc':
      return rates['wrapped-bitcoin']
    default:
      return { usd: 0, ars: 0, brl: 0, uyu: 0 }
  }
}

async function getApi3ConversationRates() {
  if (!API3_ENABLED) {
    return {
      ethereum: {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      },
      'wrapped-bitcoin': {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      },
      'usd-coin': {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      }
    }
  }

  const { abi } = TokenPriceFeedsAbi.output

  const contractAddress = '0xE1Fad061A67b5dfFF17EBFD88d6B957f56A707Ca'
  const api3EthProxy = '0x1A4eE81BBbb479f3923f22E315Bc2bD1f6d5d180'
  const api3UsdcProxy = '0xe8a3E41e620fF07765651a35334c9B6578790ECF'
  const api3WbtcProxy = '0xF33979e0751687500F4dB02B9669837744d4f478'

  const provider = new JsonRpcProvider(nodeProviderUrlSepolia)
  const contract = new ethers.Contract(contractAddress, abi, provider)

  const ethData = await contract.readDataFeed(api3EthProxy)
  const usdcData = await contract.readDataFeed(api3UsdcProxy)
  const wbtcData = await contract.readDataFeed(api3WbtcProxy)

  const result = {
    ethereum: {
      usd: ethData.price.toString(),
      ars: 0,
      brl: 0,
      uyu: 0
    },
    'wrapped-bitcoin': {
      usd: wbtcData.price.toString(),
      ars: 0,
      brl: 0,
      uyu: 0
    },
    'usd-coin': {
      usd: usdcData.price.toString(),
      ars: 0,
      brl: 0,
      uyu: 0
    }
  }

  return result
}

async function getCoingeckoConversionRates() {
  try {
    const ratesConvBaseUrl = 'https://api.coingecko.com/api/v3/simple/price'
    const ratesConvTokensIds = 'usd-coin,tether,ethereum,bitcoin,wrapped-bitcoin,dai'
    const ratesConvResultCurrencies = 'usd,ars,brl,uyu'
    const ratesConvCompleteUrl = `${ratesConvBaseUrl}?ids=${ratesConvTokensIds}&vs_currencies=${ratesConvResultCurrencies}`
    const response = await axios.get(ratesConvCompleteUrl)

    return response.data
  } catch (error) {
    return {
      ethereum: {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      },
      'wrapped-bitcoin': {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      },
      'usd-coin': {
        usd: 0,
        ars: 0,
        brl: 0,
        uyu: 0
      }
    }
  }
}

function calculateTotals(balances: IBalance[]): {
  usd: number
  ars: number
  brl: number
  uyu: number
} {
  const totals = balances.reduce(
    (acc, balance) => {
      acc.usd += balance.balance_conv.usd
      acc.ars += balance.balance_conv.ars
      acc.brl += balance.balance_conv.brl
      acc.uyu += balance.balance_conv.uyu
      return acc
    },
    { usd: 0, ars: 0, brl: 0, uyu: 0 }
  )

  return totals
}
