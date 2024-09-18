import { paths } from 'src/routes/paths'

import { Network } from './types/networks'

// ----------------------------------------------------------------------

// environment: server-side
export const { APP_ENV } = process.env || 'development'
export const { NODE_ENV } = process.env || 'development'
export const { MONGODB, MONGODB_BOT } = process.env
export const { BOT_API_TOKEN, BOT_API_URL } = process.env
export const { BACKEND_API_URL } = process.env
export const botApiWappEnabled = (process.env.BOT_API_WAPP_ENABLED || 'true') === 'true'
export const nodeProviderUrlSepolia = process.env.NODE_PROVIDER_SEPOLIA_URL
export const nodeProviderUrlPolygon = process.env.NODE_PROVIDER_MUMBAI_URL
export const nodeProviderUrlScroll = process.env.NODE_PROVIDER_SCROLL_URL
export const JWT_SECRET = process.env.JWT_SECRET || 'some_secr3t'
export const API3_ENABLED = (process.env.API3_ENABLED || 'false') === 'true'
export const DB_CHATTERPAY_NAME = process.env.DB_CHATTERPAY_NAME || 'chatterpay_dev'

// Vercel has a timeout of 10 seconds (only for free plan) in the APIs.
// The login has certain logic between ChatterPay and the backend of the Chatizalo,
// which may cause it to take about 10 seconds, so this variable is used to improve that logic.
export const handleVercelFreePlanTimeOut =
  (process.env.HANDLE_VERCEL_FREE_PLAN_TIMEOUT || 'true') === 'true'

// ----------------------------------------------------------------------

// environment: client-side
export const UI_API_URL = process.env.NEXT_PUBLIC_UI_URL
export const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || 'true') === 'true'
export const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '*'
export const fromICP = (process.env.NEXT_PUBLIC_FROM_ICP || 'false') === 'true'

// ----------------------------------------------------------------------

// internal
export const PATH_AFTER_LOGIN = fromICP ? 'https://chatterpay.net/dashboard' : paths.dashboard.root
export const BOT_WAPP_URL =
  'https://api.whatsapp.com/send/?phone=5491164629653&text=MESSAGE&type=phone_number&app_absent=0'

export const EXPLORER_L1 = 'https://sepolia.etherscan.io'
export const EXPLORER_L2 = 'https://l1sload-blockscout.scroll.io' // Scroll devnet Explorer
export const NFT_TRX_EXPLORER = 'https://sepolia.arbiscan.io'
export const NFT_MARKETPLACE =
  'https://testnets.opensea.io/assets/arbitrum-sepolia/0xedeb3db84518d539c8d7a4755d4be48dc1f876c1/ID'

export const NFT_SHARE = 'https://api.whatsapp.com/send/?text=MESSAGE'

export const STORAGE_KEY_TOKEN = 'accessToken'
export const STORAGE_KEY_SETTINGS = 'settings'
export const CONTACT_EMAIL = 'info@chatterpay.net'
export const GET_BALANCES_FROM_BACKEND = true

export const defaultBalance = {
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
