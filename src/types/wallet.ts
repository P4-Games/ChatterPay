export type IBalance = {
  network: string
  token: string
  balance: number
  balance_conv: {
    usd: number
    ars: number
    brl: number
    uyu: number
  }
}

export type CurrencyKey = 'usd' | 'ars' | 'brl' | 'uyu'

export type IBalances = {
  wallet: string
  balances: IBalance[]
  totals: Record<CurrencyKey, number>
}

export type INFTMetadata = {
  image: string
  description: string
}

export type INFT = {
  bddId: string
  nftId: number
  channel_user_id: string
  wallet: string
  trxId: string
  metadata: INFTMetadata
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
