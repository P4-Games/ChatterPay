import type { IAccountWallet } from './account'

export type jwtPayloadUser = {
  id: string
  displayName: string
  wallet: string
  /**
   * Every wallet of the user, one per chain. Display-only (profile, NFT and
   * transaction history across networks) — deliberately kept out of the signed
   * token, it is attached to the API response instead.
   */
  wallets?: IAccountWallet[]
  email: string
  photoURL: string
  phoneNumber: string
}

export type JwtPayload = {
  user: jwtPayloadUser
  accessToken: string
  sessionId: string
}
