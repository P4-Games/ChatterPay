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
  
  // Global hide/show state for all values (balance, assets, transactions)
  const [hideValues, setHideValues] = useState(false)
  
  // Global currency selection state
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'ars' | 'brl' | 'uyu'>('usd')

  // Load hide preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('hideAllValues')
    if (savedPreference !== null) {
      setHideValues(savedPreference === 'true')
    }
  }, [])

  // Save hide preference to localStorage
  const handleToggleHideValues = () => {
    const newValue = !hideValues
    setHideValues(newValue)
    localStorage.setItem('hideAllValues', String(newValue))
  }
  
  // Handle currency change
  const handleCurrencyChange = (currency: 'usd' | 'ars' | 'brl' | 'uyu') => {
    setSelectedCurrency(currency)
  }

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
          <BankingBalances 
            title={t('balances.title')} 
            tableData={safeBalances} 
            hideValues={hideValues}
            onToggleHideValues={handleToggleHideValues}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
        </Grid>

        {/* Responsive grid: 1 column mobile, 1 column small tablet, 2 columns large tablet, 5 cols desktop, 5 cols TV */}
        <Grid xs={12} sm={12} md={6} lg={5} xl={5}>
          <BankingAssetBreakdown
            balances={safeBalances.balances}
            priceData={priceData}
            tokenLogos={tokenLogos}
            isLoading={isLoadingBalances || !walletAddress}
            hideValues={hideValues}
            selectedCurrency={selectedCurrency}
          />
        </Grid>

        <Grid xs={12} sm={12} md={6} lg={7} xl={7}>
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
            hideValues={hideValues}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
