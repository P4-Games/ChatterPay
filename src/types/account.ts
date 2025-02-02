export type UserSession = {
  id: string
  creationDate: { $date: string } | string
  expirationDate: { $date: string } | string
  token: string
  status: 'created' | 'active' | 'terminated' | 'expired'
  ip: string
}

export type IAccount = {
  id: string
  name: string
  email?: string
  phone_number: string
  photo: string
  wallet: string
  walletEOA: string
  code?: string
  front?: {
    sessions?: UserSession[]
  }
}
