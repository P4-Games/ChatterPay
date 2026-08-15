export type UserSession = {
  id: string
  creationDate: { $date: string } | string
  expirationDate: { $date: string } | string
  token: string
  status: 'created' | 'active' | 'terminated' | 'expired'
  ip: string
  lastIp?: string
  ipHistory?: { ip: string; at: Date | string }[]
}

export type IAccountWallet = {
  wallet_proxy: string
  wallet_eoa: string
  chain_id: number
  status?: string
}

export type IAccount = {
  id: string
  name: string
  email?: string
  phone_number: string
  photo: string
  /** Proxy wallet of the active chain (see DEFAULT_CHAIN_ID). */
  wallet: string
  /** EOA of the active chain's wallet. */
  walletEOA: string
  /**
   * Every wallet the user owns, one per chain they have operated on. Read paths
   * always fill it in; the update DTOs don't carry it, hence optional.
   */
  wallets?: IAccountWallet[]
  code?: string
  front?: {
    sessions?: UserSession[]
  }
}
