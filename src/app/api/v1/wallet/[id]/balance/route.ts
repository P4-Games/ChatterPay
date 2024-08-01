import axios from 'axios'
import { NextResponse } from 'next/server'

import { USE_MOCK } from 'src/config-global'
import { _balances } from 'src/app/api/_data/_mock'
import { getBalances } from 'src/app/api/_data/blk-service'

import { IBalance } from 'src/types/wallet'
import { IErrorResponse } from 'src/types/api'

// ----------------------------------------------------------------------

type IParams = {
  id: string
}

const defaultBalance = {
  network: '',
  token: '',
  balance: 0,
  balance_conv: {
    usd: 0,
    ars: 0,
    brl: 0
  }
}

// ----------------------------------------------------------------------

export async function GET(request: Request, { params }: { params: IParams }) {
  if (!params.id) {
    const errorMessage: IErrorResponse = {
      error: {
        code: 'WALLET_NOT_FOUND',
        message: `Wallet id '${params.id}' not found`,
        details: '',
        stack: '',
        url: request.url
      }
    }
    return new NextResponse(JSON.stringify(errorMessage), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // avoid slow context-user load issues
  if (params.id === 'none') {
    return NextResponse.json([defaultBalance])
  }

  try {
    let balances: IBalance[] = [defaultBalance]
    if (USE_MOCK) {
      balances = _balances
    } else {
      balances = await getBalances(params.id)
    }

    const balancesWithConversion = await convertBalancesToUSD(balances)
    const totals = calculateTotals(balancesWithConversion)

    const responsePayload = {
      balances: balancesWithConversion,
      totals
    }

    return NextResponse.json(responsePayload)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting balance' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// ----------------------------------------------------------------------

async function convertBalancesToUSD(balances: IBalance[]): Promise<IBalance[]> {
  const rates = await getConversionRates()
  if (!rates) {
    throw new Error('Could not fetch conversion rates')
  }

  return balances.map((balance) => {
    let conversionRates = { usd: 0, ars: 0, brl: 0 }
    switch (balance.token.toLowerCase()) {
      case 'usdc':
        conversionRates = rates['usd-coin']
        break
      case 'usdt':
        conversionRates = rates.tether
        break
      case 'eth':
        conversionRates = rates.ethereum
        break
      case 'btc':
        conversionRates = rates.bitcoin
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

async function getConversionRates() {
  try {
    const ratesConvBaseUrl = 'https://api.coingecko.com/api/v3/simple/price'
    const ratesConvTokensIds = 'usd-coin,tether,ethereum,bitcoin'
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
