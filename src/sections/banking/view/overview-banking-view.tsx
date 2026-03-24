'use client'

import { useState, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetTokens,
  useGetWalletBalance,
  useGetWalletTransactions,
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR,
  useGetPolymarketTradesSWR,
  polymarketBridgeWithdraw
} from 'src/app/api/hooks'
import { getTokenPricesWithChange } from 'src/app/api/services/coingecko/coingecko-service'
import { useSWRConfig } from 'swr'

import { useBoolean } from 'src/hooks/use-boolean'

import { useSettingsContext } from 'src/components/settings'
import { useSnackbar } from 'src/components/snackbar'


import type { IToken, IBalances, ITransaction } from 'src/types/wallet'
import type { TokenPriceData } from 'src/app/api/services/coingecko/coingecko-service'

import PolymarketPNLWidget from 'src/sections/polymarket/polymarket-pnl-widget'

import BankingRecentTransitions from '../banking-recent-transitions'
import DashboardDepositModal from '../dashboard-deposit-modal'
import DashboardWithdrawModal from '../dashboard-withdraw-modal'
import DashboardPortfolioBalance from '../dashboard-portfolio-balance'
import DashboardPositionsTable from '../dashboard-positions-table'
import DashboardDrawer from '../dashboard-drawer'

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()

  const [walletAddress, setWalletAddress] = useState<string>('')
  const [hideValues, setHideValues] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'ars' | 'brl' | 'uyu'>('usd')
  const [isClaiming, setIsClaiming] = useState(false)
  const [priceData, setPriceData] = useState<Record<string, TokenPriceData>>({})
  const [cryptoExpanded, setCryptoExpanded] = useState(false)

  const depositModal = useBoolean()
  const withdrawModal = useBoolean()
  const polymarketDrawer = useBoolean()

  // Load hide preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('hideAllValues')
    if (savedPreference !== null) {
      setHideValues(savedPreference === 'true')
    }
  }, [])

  const handleToggleHideValues = () => {
    const newValue = !hideValues
    setHideValues(newValue)
    localStorage.setItem('hideAllValues', String(newValue))
  }

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

  // Wallet data
  const { data: balances, isLoading: isLoadingBalances }: { data: IBalances; isLoading: boolean } =
    useGetWalletBalance(walletAddress)

  const {
    data: transactions,
    isLoading: isLoadingTrxs
  }: { data: ITransaction[]; isLoading: boolean } = useGetWalletTransactions(walletAddress)

  // Polymarket data (pre-loaded for drawer)
  const { data: positions = [], isLoading: isLoadingPositions } = useGetPolymarketPositionsSWR(10000)
  const { data: orders = [], isLoading: isLoadingOrders } = useGetPolymarketOrdersSWR(10000)
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useGetPolymarketPortfolioSWR(10000)
  const { data: trades = [], isLoading: isLoadingTrades } = useGetPolymarketTradesSWR(30000)

  // Fetch CoinGecko price data for crypto dropdown
  useEffect(() => {
    const fetchPrices = async () => {
      if (balances?.balances && Array.isArray(balances.balances) && balances.balances.length > 0) {
        const tokenSymbols = balances.balances.map((b) => b.token)
        const prices = await getTokenPricesWithChange(tokenSymbols)
        setPriceData(prices)
      }
    }
    fetchPrices()
  }, [balances?.balances])

  // Create token logo mapping
  const tokenLogos = useMemo(() => {
    const logoMap: Record<string, string> = {}
    for (const token of tokens) {
      logoMap[token.symbol] = token.logo
      if (token.display_symbol && token.display_symbol !== token.symbol) {
        logoMap[token.display_symbol] = token.logo
      }
    }
    return logoMap
  }, [tokens])

  // Safe fallbacks
  const safeBalances: IBalances =
    !walletAddress || isLoadingBalances
      ? { wallet: '', balances: [], totals: { usd: 0, ars: 0, brl: 0, uyu: 0 } }
      : balances || { wallet: '', balances: [], totals: { usd: 0, ars: 0, brl: 0, uyu: 0 } }

  const safeTransactions: ITransaction[] = !walletAddress || isLoadingTrxs ? [] : transactions

  const idleUsdc = safeBalances.polymarket?.idle_usdc ?? 0
  const polymarketTotalUsd = safeBalances.polymarket?.total_usd ?? 0

  // Claim handler
  const handleClaimSubmit = async () => {
    if (idleUsdc <= 0) {
      enqueueSnackbar('No idle funds to claim', { variant: 'warning' })
      return
    }

    setIsClaiming(true)
    try {
      const result = await polymarketBridgeWithdraw(idleUsdc.toString())
      if (result.ok) {
        enqueueSnackbar('Funds Claiming... This may take a minute.', { variant: 'info' })
        setTimeout(() => {
          mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'))
          mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio'))
          enqueueSnackbar('Scroll Wallet Balance Updated', { variant: 'success' })
        }, 40000)
      } else {
        enqueueSnackbar(result.message || 'Error claiming funds', { variant: 'error' })
      }
    } catch {
      enqueueSnackbar('Error claiming funds', { variant: 'error' })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <>
      {/* Background gradient */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '50vh',
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        {/* Portfolio Balance — full width with inline crypto dropdown */}
        <DashboardPortfolioBalance
          cryptoTotalUsd={safeBalances.totals.usd}
          polymarketTotalUsd={polymarketTotalUsd}
          idleUsdc={idleUsdc}
          isLoading={isLoadingBalances}
          hideValues={hideValues}
          onToggleHideValues={handleToggleHideValues}
          onDepositClick={depositModal.onTrue}
          onWithdrawClick={withdrawModal.onTrue}
          onClaimClick={handleClaimSubmit}
          onCryptoClick={() => setCryptoExpanded((prev) => !prev)}
          onPolymarketClick={polymarketDrawer.onTrue}
          isClaiming={isClaiming}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          totals={safeBalances.totals}
          tokenLogos={tokenLogos}
          balances={safeBalances.balances}
          cryptoExpanded={cryptoExpanded}
          onCryptoToggle={() => setCryptoExpanded((prev) => !prev)}
          priceData={priceData}
        />

        {/* Full-width History */}
        <Box sx={{ mt: 3 }}>
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
        </Box>
      </Container>

      {/* Polymarket Drawer — PNL + Positions (50% screen width) */}
      <DashboardDrawer
        open={polymarketDrawer.value}
        onClose={polymarketDrawer.onFalse}
        title='Polymarket'
        width='50vw'
      >
        <Stack spacing={3}>
          <PolymarketPNLWidget
            variant='expanded'
            portfolioData={portfolioData ?? null}
            positions={positions}
            trades={trades}
            isLoadingExternal={isLoadingPortfolio || isLoadingTrades}
          />
          <DashboardPositionsTable
            positions={positions}
            orders={orders}
            isLoading={isLoadingPositions || isLoadingOrders}
            idleUsdc={idleUsdc}
          />
        </Stack>
      </DashboardDrawer>

      {/* Deposit Modal */}
      <DashboardDepositModal
        open={depositModal.value}
        onClose={depositModal.onFalse}
        walletAddress={walletAddress}
      />

      {/* Withdraw Modal */}
      <DashboardWithdrawModal
        open={withdrawModal.value}
        onClose={withdrawModal.onFalse}
        balances={safeBalances.balances}
        tokenLogos={tokenLogos}
        transactions={safeTransactions}
        userWallet={walletAddress}
      />
    </>
  )
}
