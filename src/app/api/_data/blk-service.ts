import { ethers, JsonRpcProvider } from 'ethers'

import { tokensByNetwork } from 'src/config-global'

// ---------------------------------------------------------------------------------------------

export async function getBalances(walletAddress: string): Promise<any[]> {
  const balances: any[] = []
  const tokenAbi = ['function balanceOf(address) view returns (uint256)']

  await Promise.all(
    Object.entries(tokensByNetwork)
      .filter(([networkKey, network]) => network.config.enabled === 'true')
      .map(async ([networkKey, network]) => {
        const provider = new JsonRpcProvider(network.config.chainNodeProviderUrl)
        const ethBalance = await provider.getBalance(walletAddress)
        balances.push({
          network: network.config.chainName,
          token: network.config.chainCurrency,
          balance: ethers.formatUnits(ethBalance, 18)
        })

        await Promise.all(
          Object.entries(network.tokens)
            .filter(([tokenKey, token]) => token.enabled === 'true')
            .map(async ([tokenKey, token]) => {
              try {
                const tokenContract = new ethers.Contract(
                  removeQuotes(token.contract),
                  tokenAbi,
                  provider
                )
                const tokenBalance = await getTokenBalance(tokenContract, walletAddress)
                balances.push({
                  network: network.config.chainName,
                  token: token.token,
                  balance: ethers.formatUnits(tokenBalance, token.decimals)
                })
              } catch (error) {
                console.error(
                  `Error getting ${token.token} balance of ${walletAddress} on ${network.config.chainName}`
                )
              }
            })
        )
      })
  )

  return balances
}

// ---------------------------------------------------------------------------------------------
async function getTokenBalance(
  tokenContract: ethers.Contract,
  walletAddress: string
): Promise<any> {
  try {
    const tokenBalance = await tokenContract.balanceOf(walletAddress)
    return tokenBalance
  } catch (error) {
    console.error(error)
    throw error
  }
}

function removeQuotes(text: string): string {
  if (text === '' || !text) return text
  return text.replace(/['"]/g, '')
}
