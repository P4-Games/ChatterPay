import axios from 'axios'
import { ethers, JsonRpcProvider } from 'ethers'

import { USE_MOCK, defaultBalance, tokensByNetwork } from 'src/config-global'

import { IBalance, IBalances, CurrencyKey } from 'src/types/wallet'

import { _balances } from './_mock'

// ---------------------------------------------------------------------------------------------

export async function getBalancesWithTotals(walletAddress: string): Promise<IBalances> {
  let balances: IBalance[] = [defaultBalance]

  if (USE_MOCK) {
    balances = _balances
  } else {
    balances = await getBalances(walletAddress)
  }

  const balancesWithConversion: IBalance[] = await convertBalancesToUSD(balances)
  const totals: Record<CurrencyKey, number> = calculateTotals(balancesWithConversion)

  return {
    balances: balancesWithConversion,
    totals
  }
}

// ---------------------------------------------------------------------------------------------

async function getBalances(walletAddress: string): Promise<any[]> {
  const balances: any[] = []
  const tokenAbi = ['function balanceOf(address) view returns (uint256)']

  await Promise.all(
    Object.entries(tokensByNetwork)
      .filter(([networkKey, network]) => network.config.enabled === 'true')
      .map(async ([networkKey, network]) => {
        const provider = new JsonRpcProvider(network.config.chainNodeProviderUrl)
        const ethBalance = await provider.getBalance(walletAddress)
        balances.push({
          network: network.config.chainName,
          token: network.config.chainCurrency,
          balance: ethers.formatUnits(ethBalance, 18)
        })

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
                balances.push({
                  network: network.config.chainName,
                  token: token.token,
                  balance: ethers.formatUnits(tokenBalance, token.decimals)
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

async function convertBalancesToUSD(balances: IBalance[]): Promise<IBalance[]> {
  const ratesCoingecko = await getCoingeckoConversionRates()
  // const ratesApi3 = await getApi3ConversationRates()

  if (!ratesCoingecko) {
    throw new Error('Could not fetch conversion rates')
  }

  return balances.map((balance) => {
    let conversionRates = { usd: 0, ars: 0, brl: 0 }
    switch (balance.token.toLowerCase()) {
      case 'usdc':
        conversionRates = ratesCoingecko['usd-coin']
        break
      case 'usdt':
        conversionRates = ratesCoingecko.tether
        break
      case 'eth':
        conversionRates = ratesCoingecko.ethereum
        break
      case 'btc':
        conversionRates = ratesCoingecko.bitcoin
        break
      case 'wbtc':
        conversionRates = ratesCoingecko['wrapped-bitcoin']
        break
      default:
        conversionRates = { usd: 1, ars: 1, brl: 1 } // Assuming 1 for unknown tokens for simplicity
    }
    return {
      ...balance,
      balance_conv: {
        usd: balance.balance * conversionRates.usd,
        ars: balance.balance * conversionRates.ars,
        brl: balance.balance * conversionRates.brl
      }
    }
  })
}

async function getCoingeckoConversionRates() {
  try {
    const ratesConvBaseUrl = 'https://api.coingecko.com/api/v3/simple/price'
    const ratesConvTokensIds = 'usd-coin,tether,ethereum,bitcoin,wrapped-bitcoin'
    const ratesConvResultCurrencies = 'usd,ars,brl'
    const ratesConvCompleteUrl = `${ratesConvBaseUrl}?ids=${ratesConvTokensIds}&vs_currencies=${ratesConvResultCurrencies}`
    const response = await axios.get(ratesConvCompleteUrl)
    return response.data
  } catch (error) {
    console.error('Error fetching conversion rates:', error)
    return null
  }
}

function calculateTotals(balances: IBalance[]): { usd: number; ars: number; brl: number } {
  const totals = balances.reduce(
    (acc, balance) => {
      acc.usd += balance.balance_conv.usd
      acc.ars += balance.balance_conv.ars
      acc.brl += balance.balance_conv.brl
      return acc
    },
    { usd: 0, ars: 0, brl: 0 }
  )

  return totals
}
