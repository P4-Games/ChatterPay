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
  message?: string
  certificates?: []
}

export type INFTMetadata = {
  image_url: {
    gcp: string
    ipfs: string
    icp: string
  }
  geolocation?: {
    latitud?: string
    longitud?: string
  }
  description: string
}

export type ImageURLRepository = keyof INFTMetadata['image_url']

export type INFT = {
  bddId: string
  nftId: string
  channel_user_id: string
  wallet: string
  trxId: string
  timestamp: Date
  original: boolean
  tota_of_this: number
  copy_of?: string
  copy_order: number
  copy_of_original?: string
  copy_order_original: number
  total_of_original?: number
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
