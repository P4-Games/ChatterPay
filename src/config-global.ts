import { ENV } from '@pushprotocol/restapi/src/lib/constants'

import { Network } from './types/networks'
import { IBalance, IBalances } from './types/wallet'

// ----------------------------------------------------------------------

// environment: server-side
export const APP_ENV = process.env.APP_ENV?.toString().toLowerCase() || 'development'
export const NODE_ENV = process.env.NODE_ENV?.toString().toLowerCase() || 'development'
export const { MONGODB, MONGODB_BOT } = process.env
export const { BOT_API_TOKEN, BOT_API_URL } = process.env
export const { BACKEND_API_URL, BACKEND_API_TOKEN } = process.env
export const botApiWappEnabled =
  (process.env.BOT_API_WAPP_ENABLED?.toString().toLowerCase() || 'true') === 'true'
export const nodeProviderUrlSepolia = process.env.NODE_PROVIDER_SEPOLIA_URL
export const nodeProviderUrlPolygon = process.env.NODE_PROVIDER_MUMBAI_URL
export const nodeProviderUrlScroll = process.env.NODE_PROVIDER_SCROLL_URL
export const { JWT_SECRET } = process.env
export const API3_ENABLED =
  (process.env.API3_ENABLED?.toString().toLowerCase() || 'false') === 'true'
export const DB_CHATTERPAY_NAME = process.env.DB_CHATTERPAY_NAME || 'chatterpay_dev'
export const DB_BOT_NAME = process.env.DB_BOT_NAME || 'chatterpay-develop'
export const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY || ''
export const PUSH_NETWORK: string = process.env.PUSH_NETWORK || '11155111'
export const PUSH_ENVIRONMENT: ENV = (process.env.PUSH_ENVIRONMENT as ENV) || ENV.DEV

// Vercel has a timeout of 10 seconds (only for free plan) in the APIs.
// The login has certain logic between ChatterPay and the backend of the Chatizalo,
// which may cause it to take about 10 seconds, so this variable is used to improve that logic.
export const handleVercelFreePlanTimeOut =
  (process.env.HANDLE_VERCEL_FREE_PLAN_TIMEOUT?.toString().toLowerCase() || 'true') === 'true'

// ----------------------------------------------------------------------

// environment: client-side
export const UI_BASE_URL = process.env.NEXT_PUBLIC_UI_URL || 'https://chatterpay.net'
export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK?.toString().toLowerCase() || 'true') === 'true'
export const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '*'
export const fromICP =
  (process.env.NEXT_PUBLIC_FROM_ICP?.toString().toLowerCase() || 'true') === 'true'
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
export const EXPLORER_L1_URL: string =
  process.env.NEXT_PUBLIC_EXPLORER_L1_URL || 'https://sepolia.etherscan.io'
export const EXPLORER_L2_URL: string =
  process.env.NEXT_PUBLIC_EXPLORER_L2_URL || 'https://sepolia.arbiscan.io'
export const EXPLORER_NFT_URL: string =
  process.env.NEXT_PUBLIC_EXPLORER_NFT_URL || 'https://sepolia.arbiscan.io'
export const NFT_IMAGE_REPOSITORY = (
  process.env.NEXT_PUBLIC_NFT_IMAGE_REPOSITORY || 'gcp'
).toLowerCase()
export const CHATIZALO_PHONE_NUMBER = process.env.NEXT_PUBLIC_CHATIZALO_PHONE_NUMBER || 0
// ----------------------------------------------------------------------

// internal
export const STORAGE_OPTION = 'local'
export const USER_SESSION_EXPIRATION_MINUTES = 60
export const PATH_AFTER_LOGIN = `/dashboard`
export const IS_DEVELOPMENT =
  APP_ENV.toLowerCase() === 'development' || APP_ENV.toLowerCase() === 'testing'
export const BOT_WAPP_URL = `https://api.whatsapp.com/send/?phone=${CHATIZALO_PHONE_NUMBER}&text=MESSAGE&type=phone_number&app_absent=0`

export const NFT_MARKETPLACE_URL =
  process.env.NEXT_PUBLIC_NFT_MARKETPLACE_URL ||
  'https://testnets.opensea.io/assets/arbitrum_sepolia'

export const NFT_SHARE = 'https://api.whatsapp.com/send/?text=MESSAGE'
export const STORAGE_KEY_TOKEN = `chatterpay_${APP_ENV}_jwtToken`
export const STORAGE_KEY_SETTINGS = `chatterpay_${APP_ENV}_settings`
export const CONTACT_EMAIL = 'contacto@chatterpay.com.ar'
export const GET_BALANCES_FROM_BACKEND = true
export const NOTIFICATIONS_PAGE_SIZE: number = Number.isNaN(
  parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_PAGE_SIZE ?? '', 10)
)
  ? 20
  : parseInt(process.env.NEXT_PUBLIC_NOTIFICATIONS_PAGE_SIZE ?? '10', 10)
export const NOTIFICATIONS_INTERVAL_TO_FETCH_PAGE: number = Number.isNaN(
  parseInt(process.env.NEXT_PUBLIC_CHATS_INTERVAL_TO_FETCH_PAGE ?? '', 10)
)
  ? 3000
  : parseInt(process.env.NEXT_PUBLIC_CHATS_INTERVAL_TO_FETCH_PAGE ?? '3000', 10)

export const notificationsRefreshInterval = 5000

export const defaultBalance: IBalance = {
  network: '',
  token: '',
  balance: 0,
  balance_conv: {
    usd: 0,
    ars: 0,
    brl: 0,
    uyu: 0
  }
}

export const defaultBalances: IBalances = {
  balances: [defaultBalance],
  totals: {
    usd: 0,
    ars: 0,
    brl: 0,
    uyu: 0
  },
  certificates: [],
  wallet: '',
  message: ''
}

export const tokensByNetwork: { [networkKey: string]: Network } = {
  scroll_testnet: {
    config: {
      enabled: 'false',
      chainName: 'Scroll-Sepolia',
      chainId: '8292f', // '534351'
      chainCurrency: 'ETH',
      ChainRpcUrl: 'https://scroll-sepolia.drpc.org',
      chainExplorerUrl: 'https://sepolia.scrollscan.com/',
      chainOpenSeaBaseUrl: '',
      chainNftUrl: '',
      chainNodeProviderUrl: nodeProviderUrlScroll
    },
    tokens: {
      usdc: {
        enabled: 'false',
        api3Exists: false,
        token: 'USDC',
        contract: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
        decimals: 6
      },
      usdt: {
        enabled: 'false',
        api3Exists: false,
        token: 'USDT',
        contract: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
        decimals: 6
      },
      dai: {
        enabled: 'false',
        api3Exists: false,
        token: 'DAI',
        contract: '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97',
        decimals: 18
      }
    }
  },
  mumbai: {
    config: {
      enabled: 'false',
      chainName: 'mumbai',
      chainId: '0x13881',
      chainCurrency: 'MATIC',
      ChainRpcUrl: 'https://rpc-mumbai.maticvigil.com',
      chainExplorerUrl: 'https://mumbai.polygonscan.com',
      chainOpenSeaBaseUrl: 'https://testnets.opensea.io/assets/mumbai',
      chainNftUrl: 'https://mumbai.polygonscan.com/',
      chainNodeProviderUrl: nodeProviderUrlPolygon
    },
    tokens: {
      usdc: {
        enabled: 'false',
        api3Exists: false,
        token: 'USDC',
        contract: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747 ',
        decimals: 6
      },
      usdt: {
        enabled: 'false',
        api3Exists: false,
        token: 'USDT',
        contract: '',
        decimals: 6
      },
      dai: {
        enabled: 'false',
        api3Exists: false,
        token: 'DAI',
        contract: '0xEa4c35c858E15Cef77821278A88435dE57bc8707',
        decimals: 18
      }
    }
  },
  sepolia: {
    config: {
      enabled: 'true',
      chainName: 'sepolia',
      chainId: '0xaa36a7',
      chainCurrency: 'ETH',
      ChainRpcUrl: 'https://sepolia.gateway.tenderly.co',
      chainExplorerUrl: 'https://sepolia.etherscan.io',
      chainOpenSeaBaseUrl: 'https://testnets.opensea.io',
      chainNftUrl: '',
      chainNodeProviderUrl: nodeProviderUrlSepolia
    },
    tokens: {
      usdc: {
        enabled: 'true',
        api3Exists: true,
        token: 'USDC',
        contract: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
        decimals: 6
      },
      usdt: {
        enabled: 'true',
        api3Exists: false,
        token: 'USDT',
        contract: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        decimals: 6
      },
      dai: {
        enabled: 'true',
        api3Exists: false,
        token: 'DAI',
        contract: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
        decimals: 18
      },
      wbtc: {
        enabled: 'true',
        api3Exists: true,
        token: 'WBTC',
        contract: '0x931a39323cbed457e77c52a7586e7732e3e4dbbb',
        decimals: 18
      }
    }
  }
}

export const _socials = [
  {
    value: 'facebook',
    name: 'FaceBook',
    icon: 'eva:facebook-fill',
    colorDark: '#1877F2',
    colorLight: '#1877F2',
    path: 'https://www.facebook.com/chatterpay'
  },
  {
    value: 'instagram',
    name: 'Instagram',
    icon: 'ant-design:instagram-filled',
    colorDark: '#E02D69',
    colorLight: '#E02D69',
    path: 'https://www.instagram.com/chatterpayofficial'
  },
  {
    value: 'linkedin',
    name: 'Linkedin',
    icon: 'eva:linkedin-fill',
    colorDark: '#007EBB',
    colorLight: '#007EBB',
    path: 'https://www.linkedin.com/company/chatterpay'
  },
  {
    value: 'X',
    name: 'X',
    icon: 'eva:twitter-fill',
    colorDark: '#00AAEC',
    colorLight: '#00AAEC',
    path: 'https://www.twitter.com/chatterpay'
  },
  {
    value: 'youtube',
    name: 'YouTube',
    icon: 'logos:youtube-icon',
    colorDark: '#FF0000',
    colorLight: '#FF0000',
    path: 'https://www.youtube.com/@chatterpay'
  },
  {
    value: 'github',
    name: 'Github',
    icon: 'eva:github-fill',
    colorDark: '#FFFFFF',
    colorLight: '#181717',
    path: 'https://github.com/chatterpay'
  }
]
