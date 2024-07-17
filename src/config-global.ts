import { paths } from 'src/routes/paths'

import { Network } from './types/networks'

// ----------------------------------------------------------------------

// environment: server-side
export const { APP_ENV } = process.env || 'development'
export const { NODE_ENV } = process.env || 'development'
export const { MONGODB } = process.env
export const { BOT_API_TOKEN } = process.env

export const nodeProviderUrlSepolia = process.env.NODE_PROVIDER_SEPOLIA_URL
export const nodeProviderUrlPolygon = process.env.NODE_PROVIDER_MUMBAI_URL
export const nodeProviderUrlScroll = process.env.NODE_PROVIDER_SCROLL_URL

// ----------------------------------------------------------------------

// environment: client-side
export const UI_API_URL = process.env.NEXT_PUBLIC_UI_URL
export const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL
export const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || 'true') === 'true'
export const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '*'

// ----------------------------------------------------------------------

// internal
export const PATH_AFTER_LOGIN = paths.dashboard.root
export const TRX_EXPLORER = 'https://sepolia.etherscan.io'
export const STORAGE_KEY_TOKEN = 'accessToken'
export const STORAGE_KEY_SETTINGS = 'settings'
export const JWT_SECRET = '65OcvHlcxqkBhniJBRtSc1HkzgjoKt2GmL2vV3COdw1BbKPs2etUxnVlynJUT1I'

export const tokensByNetwork: { [networkKey: string]: Network } = {
  scroll_testnet: {
    config: {
      enabled: 'true',
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
        token: 'USDC',
        contract: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
        decimals: 6
      },
      usdt: {
        enabled: 'false',
        token: 'USDT',
        contract: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
        decimals: 6
      },
      dai: {
        enabled: 'false',
        token: 'DAI',
        contract: '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97',
        decimals: 18
      }
    }
  },
  mumbai: {
    config: {
      enabled: 'true',
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
        token: 'USDC',
        contract: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747 ',
        decimals: 6
      },
      usdt: {
        enabled: 'false',
        token: 'USDT',
        contract: '',
        decimals: 6
      },
      dai: {
        enabled: 'false',
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
        token: 'USDC',
        contract: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
        decimals: 6
      },
      usdt: {
        enabled: 'false',
        token: 'USDT',
        contract: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        decimals: 6
      },
      dai: {
        enabled: 'false',
        token: 'DAI',
        contract: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
        decimals: 18
      }
    }
  }
}
