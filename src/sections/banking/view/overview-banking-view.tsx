'use client'

import { useState, useEffect, useMemo } from 'react'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'

import { useTranslate } from 'src/locales'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetTokens, useGetWalletBalance, useGetWalletTransactions } from 'src/app/api/hooks'
import { getTokenPricesWithChange } from 'src/app/api/services/coingecko/coingecko-service'

import { useSettingsContext } from 'src/components/settings'

import type { IAccount } from 'src/types/account'
import type { IToken, IBalances, ITransaction } from 'src/types/wallet'
import type { TokenPriceData } from 'src/app/api/services/coingecko/coingecko-service'

import BankingBalances from '../banking-balances'
import BankingAssetBreakdown from '../banking-asset-breakdown'
import BankingRecentTransitions from '../banking-recent-transitions'

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [contextUser] = useState<IAccount | null>(null)
  const [priceData, setPriceData] = useState<Record<string, TokenPriceData>>({})

  // Fetch tokens from database
  const { data: tokensData } = useGetTokens()
  const tokens: IToken[] = tokensData?.data || []

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  useEffect(() => {
    if (contextUser && contextUser.wallet) {
      setWalletAddress(contextUser.wallet)
    }
  }, [contextUser])

  const { data: balances, isLoading: isLoadingBalances }: { data: IBalances; isLoading: boolean } =
    useGetWalletBalance(walletAddress)

  const {
    data: transactions,
    isLoading: isLoadingTrxs
  }: { data: ITransaction[]; isLoading: boolean } = useGetWalletTransactions(walletAddress)

  // Fetch CoinGecko price data for all tokens
  useEffect(() => {
    const fetchPrices = async () => {
      if (balances?.balances && balances.balances.length > 0) {
        const tokenSymbols = balances.balances.map((b) => b.token)
        const prices = await getTokenPricesWithChange(tokenSymbols)
        setPriceData(prices)
      }
    }

    fetchPrices()
  }, [balances?.balances])

  // Create token logo mapping from database
  const tokenLogos = useMemo(() => {
    const logoMap: Record<string, string> = {}
    for (const token of tokens) {
      logoMap[token.symbol] = token.logo
    }
    return logoMap
  }, [tokens])

  // ✅ Fallbacks si no hay wallet
  const safeBalances: IBalances =
    !walletAddress || isLoadingBalances
      ? { wallet: '', balances: [], totals: { usd: 0, ars: 0, brl: 0, uyu: 0 } }
      : balances

  const safeTransactions: ITransaction[] = !walletAddress || isLoadingTrxs ? [] : transactions

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <BankingBalances title={t('balances.title')} tableData={safeBalances} />
        </Grid>

        <Grid xs={12} md={5}>
          <BankingAssetBreakdown
            balances={safeBalances.balances}
            priceData={priceData}
            tokenLogos={tokenLogos}
            isLoading={isLoadingBalances || !walletAddress}
          />
        </Grid>

        <Grid xs={12} md={7}>
          <BankingRecentTransitions
            title={t('transactions.title')}
            isLoading={isLoadingTrxs || !walletAddress}
            tableData={safeTransactions}
            tableLabels={[
              { id: 'description', label: t('transactions.table-transaction') },
              { id: 'amount', label: t('transactions.table-amount') },
              { id: 'date', label: t('transactions.table-date') },
              { id: '' }
            ]}
            userWallet={walletAddress || ''}
            tokenLogos={tokenLogos}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
