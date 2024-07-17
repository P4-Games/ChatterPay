export interface Token {
  contract: string
  enabled: string
  token: string
  decimals: number
}

export interface NetworkConfig {
  enabled: string
  chainName: string
  chainId: string
  chainCurrency: string
  ChainRpcUrl: string
  chainExplorerUrl: string
  chainOpenSeaBaseUrl: string
  chainNftUrl: string
  chainNodeProviderUrl: string | undefined
}

export interface Network {
  config: NetworkConfig
  tokens: { [tokenKey: string]: Token }
}
