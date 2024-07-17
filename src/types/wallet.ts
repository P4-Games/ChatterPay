export type IBalance = {
  network: string
  token: string
  balance: number
  balance_conv: {
    usd: number
    ars: number
    brl: number
  }
}

export type CurrencyKey = 'usd' | 'ars' | 'brl'

export type IBalances = {
  balances: IBalance[]
  totals: Record<CurrencyKey, number>
}

export type ITransaction = {
  id: string
  trx_hash: string
  date: Date | number | string
  wallet_from: string
  contact_from_phone: string
  contact_from_name: string | null
  contact_from_avatar_url: string | null
  wallet_to: string | null
  contact_to_phone: string
  contact_to_name: string | null
  contact_to_avatar_url: string | null
  token: string
  amount: number
  type: string
  status: string
}
