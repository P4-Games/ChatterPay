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
  aboutUs: '/about-us',

  products: {
    root: '/products',
    basic: '/products/basic',
    chatterpoints: '/products/chatterpoints',
    staking: '/products/staking',
    telegram: '/products/telegram',
    b2b: '/products/b2b'
  },
  roadmap: '/roadmap',
  development: '/development',

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
    chatterpoints: {
      root: `${ROOTS.DASHBOARD}/chatterpoints`
    },
    transfer: {
      all: `${ROOTS.DASHBOARD}/transfer/all`
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      profileName: `${ROOTS.DASHBOARD}/user/profile/name`,
      referrals: `${ROOTS.DASHBOARD}/user/referrals`,
      referralsReferredCode: `${ROOTS.DASHBOARD}/user/referrals/referred-code`,
      email: `${ROOTS.DASHBOARD}/user/account/email`,
      notifications: `${ROOTS.DASHBOARD}/user/notifications`,
      security: `${ROOTS.DASHBOARD}/user/security`,
      securityStatus: `${ROOTS.DASHBOARD}/user/security/status`,
      securityRecovery: `${ROOTS.DASHBOARD}/user/security/recovery-questions`,
      securityEvents: `${ROOTS.DASHBOARD}/user/security/events`,
      securityPin: `${ROOTS.DASHBOARD}/user/security/pin`
    }
  }
}
