export type jwtPayloadUser = {
  id: string
  displayName: string
  wallet: string
  walletEOA: string
  email: string
  photoURL: string
  phoneNumber: string
}

export type JwtPayload = {
  user: jwtPayloadUser
  accessToken: string
  sessionId: string
}
