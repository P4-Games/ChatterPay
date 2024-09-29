const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard'
}

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  terms: '/terms',
  policy: '/policy',
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`
    }
  },
  dashboard: {
    root: `${ROOTS.DASHBOARD}`,
    nfts: {
      root: `${ROOTS.DASHBOARD}/nfts`,
      content: (id: string) => `${ROOTS.DASHBOARD}/nfts`
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user/account`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      wallet: {
        root: (walletId: string) => `${ROOTS.DASHBOARD}/user/wallet/${walletId}`,
        nfts: {
          root: (walletId: string) => `${ROOTS.DASHBOARD}/user/wallet/${walletId}/nfts`,
          item: (walletId: string, nftId: string) =>
            `${ROOTS.DASHBOARD}/user/wallet/${walletId}/nfts/${nftId}`
        }
      }
    }
  }
}
