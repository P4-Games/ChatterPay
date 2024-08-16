const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard'
}

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`
    }
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`
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
