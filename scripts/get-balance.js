
require('dotenv').config()
const { ethers, JsonRpcProvider } = require('ethers')

// ------------------------------------------------------------------------

const nodeProviderUrlSepolia = process.env.NODE_PROVIDER_SEPOLIA_URL
const nodeProviderUrlPolygon = process.env.NODE_PROVIDER_MUMBAI_URL
const nodeProviderUrlScroll = process.env.NODE_PROVIDER_SCROLL_URL


const tokensByNetwork = {  
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
      environment: 'testing',
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
        enabled: 'true',
        token: 'USDT',
        contract: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
        decimals: 6
      },
      dai: {
        enabled: 'true',
        token: 'DAI',
        contract: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
        decimals: 18
      }
    }
  }
}

// ------------------------------------------------------------------------

async function getTokenBalance(tokenContract, walletAddress) {
  try {
    const tokenBalance = await tokenContract.balanceOf(walletAddress)
    return tokenBalance
  } catch (error) {
    console.error(error)
  }
}


function removeQuotes(text) {
  if (text === '' || !text) return text
  return text.replace(/['"]/g, '')
}

async function getBalances() {
  const balances = []
  const tokenAbi = ['function balanceOf(address) view returns (uint256)']
  
  for (const networkKey in tokensByNetwork) {
    const network = tokensByNetwork[networkKey]
    const { config, tokens } = network

    if (config.enabled === 'true') {
      const provider = new JsonRpcProvider(config.chainNodeProviderUrl)
      const ethBalance = await provider.getBalance(walletAddress)
      balances.push({ network: config.chainName, token: config.chainCurrency, balance: ethers.formatUnits(ethBalance, 18) })

      for (const tokenKey in tokens) {
        const token = tokens[tokenKey]
        if (token.enabled === 'true') {
          try {
            const tokenContract = new ethers.Contract(removeQuotes(token.contract), tokenAbi, provider)
            const tokenBalance = await getTokenBalance(tokenContract, walletAddress)
            balances.push({ network: config.chainName, token: token.token, balance: ethers.formatUnits(tokenBalance, token.decimals) })
          } catch (error) {
            console.error(`Error getting ${token.token} balance of ${walletAddress} on ${config.chainName}`)
          }
        }
      }
    }
  }
  return balances
}

// { network: 'sepolia', token: 'usdc', balance: 20}, {network: ....}, {}
getBalances().then(balances => console.log(JSON.stringify(balances, null, 2)))
