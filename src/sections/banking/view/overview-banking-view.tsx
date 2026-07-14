'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { POLYMARKET_REFRESH } from 'src/config-global'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetTokens,
  useGetWalletBalance,
  useGetWalletTransactionsCached,
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR,
  useGetPolymarketTradesSWR,
  polymarketBridgeWithdraw,
  polymarketAccountStatus
} from 'src/app/api/hooks'
import { getTokenPricesWithChange } from 'src/app/api/services/coingecko/coingecko-service'

import { useBoolean } from 'src/hooks/use-boolean'

import { useSettingsContext } from 'src/components/settings'
import { useSnackbar } from 'src/components/snackbar'

import type { IToken, IBalances, ITransaction } from 'src/types/wallet'
import type { TokenPriceData } from 'src/app/api/services/coingecko/coingecko-service'

import BankingRecentTransitions from '../banking-recent-transitions'
import DashboardPortfolioBalance from '../dashboard-portfolio-balance'
import DashboardPositionsTable from '../dashboard-positions-table'
import DashboardDrawer from '../dashboard-drawer'
import { pendingOpToTransaction } from '../pending-op-transaction'
import { usePolymarketActivity, PolymarketActivityProvider } from '../polymarket-activity-context'

// ----------------------------------------------------------------------

// Code-split on-demand / heavy components so they stay out of the initial dashboard bundle.
const PolymarketPNLWidget = dynamic(() => import('src/sections/polymarket/polymarket-pnl-widget'), {
  ssr: false
})
const DashboardDepositModal = dynamic(() => import('../dashboard-deposit-modal'), { ssr: false })
const DashboardWithdrawModal = dynamic(() => import('../dashboard-withdraw-modal'), { ssr: false })
const DashboardSwapModal = dynamic(() => import('../dashboard-swap-modal'), { ssr: false })

// ----------------------------------------------------------------------

function BankingDashboardContent() {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()

  const [polymarketReady, setPolymarketReady] = useState<boolean | null>(null)

  const [walletAddress, setWalletAddress] = useState<string>('')
  const [hideValues, setHideValues] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'ars' | 'brl' | 'uyu'>('usd')
  const [isClaiming, setIsClaiming] = useState(false)
  const [priceData, setPriceData] = useState<Record<string, TokenPriceData>>({})
  const [cryptoExpanded, setCryptoExpanded] = useState(false)

  const depositModal = useBoolean()
  const withdrawModal = useBoolean()
  const swapModal = useBoolean()
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
  // Stable reference: the `[]` fallback would otherwise be a new array every
  // render and invalidate the tokenLogos memo below on each update.
  const tokens = useMemo<IToken[]>(() => tokensData?.data || [], [tokensData])

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  useEffect(() => {
    if (!user?.id) return
    polymarketAccountStatus().then((res) => {
      const ready = !!res.data?.account?.has_account && !!res.data.account.terms_accepted
      setPolymarketReady(ready)
    })
  }, [user?.id])

  // Wallet data
  const { data: balances, isLoading: isLoadingBalances }: { data: IBalances; isLoading: boolean } =
    useGetWalletBalance(walletAddress)

  const {
    data: transactions,
    isLoading: isLoadingTrxs
  }: { data: ITransaction[]; isLoading: boolean } = useGetWalletTransactionsCached(walletAddress)

  const { pendingOps, addClaim, failOp, completeOp } = usePolymarketActivity()

  // Polymarket data — only fetch/poll while the drawer is open (data is only shown there).
  // SWR keeps the cache per key, so re-opening shows data instantly and revalidates in background.
  const isPolymarketDrawerOpen = polymarketDrawer.value
  const { data: positions = [], isLoading: isLoadingPositions } = useGetPolymarketPositionsSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    isPolymarketDrawerOpen
  )
  const { data: orders = [], isLoading: isLoadingOrders } = useGetPolymarketOrdersSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    isPolymarketDrawerOpen
  )
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useGetPolymarketPortfolioSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    isPolymarketDrawerOpen
  )
  const { data: trades = [], isLoading: isLoadingTrades } = useGetPolymarketTradesSWR(
    POLYMARKET_REFRESH.HISTORY_MS,
    undefined,
    isPolymarketDrawerOpen
  )

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

  // Stable reference: the `[]` fallback would otherwise be a new array every
  // render and invalidate the merge memo below on each update.
  const safeTransactions = useMemo<ITransaction[]>(
    () => (!walletAddress || isLoadingTrxs ? [] : transactions),
    [walletAddress, isLoadingTrxs, transactions]
  )

  // Merge optimistic (in-flight) records on top of the real history. A synthetic
  // row is dropped once its real backend counterpart shows up: by purchase_id for
  // sells, or by a matching claim/withdraw record dated after the claim started.
  const mergedTransactions = useMemo<ITransaction[]>(() => {
    if (!pendingOps.length) return safeTransactions

    const realPurchaseIds = new Set(
      safeTransactions.flatMap((tx) =>
        tx.polymarket_purchase_id ? [tx.polymarket_purchase_id] : []
      )
    )

    const txMs = (tx: ITransaction): number => {
      const d = tx.date
      if (typeof d === 'number') return d
      const ms = new Date(d as string | Date).getTime()
      return Number.isNaN(ms) ? 0 : ms
    }

    const visibleOps = pendingOps.filter((op) => {
      if (op.purchaseId && realPurchaseIds.has(op.purchaseId)) return false
      if (op.kind === 'claim') {
        const supersededBy = safeTransactions.some(
          (tx) =>
            (tx.type === 'polymarket_claim' || tx.type === 'polymarket_withdraw') &&
            txMs(tx) >= op.createdAt - 5000
        )
        if (supersededBy) return false
      }
      return true
    })

    if (!visibleOps.length) return safeTransactions

    const synthetic = visibleOps
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((op) => pendingOpToTransaction(op, walletAddress))

    return [...synthetic, ...safeTransactions]
  }, [pendingOps, safeTransactions, walletAddress])

  const idleUsdc = safeBalances.polymarket?.idle_usdc ?? 0
  const polymarketTotalUsd = safeBalances.polymarket?.total_usd ?? 0

  // A claim keeps processing in the background (~45 s) after the API responds, while
  // the on-chain balance hasn't refreshed yet. Keep the button disabled for the whole
  // in-flight window — driven by the persisted op, so it survives reloads too.
  const claimInProgress = useMemo(
    () => pendingOps.some((op) => op.kind === 'claim' && op.status === 'processing'),
    [pendingOps]
  )

  // Claim handler — drops an optimistic record immediately; the activity context
  // owns its lifecycle (status tracking + balance/portfolio revalidation), so it
  // stays visible in the history even after this view's button resets.
  const handleClaimSubmit = async () => {
    if (idleUsdc <= 0) {
      enqueueSnackbar('No idle funds to claim', { variant: 'warning' })
      return
    }

    const opId = addClaim(idleUsdc)
    setIsClaiming(true)
    try {
      const result = await polymarketBridgeWithdraw(idleUsdc.toString())
      if (result.ok) {
        if (result.data?.hash) {
          // Bridge completed synchronously — close the op now, don't wait 45 s.
          completeOp(opId)
          enqueueSnackbar('Funds transferred to Scroll!', { variant: 'success' })
        } else {
          // Background claim triggered — auto-resolves after CLAIM_RESOLVE_MS.
          enqueueSnackbar('Funds Claiming... This may take a minute.', { variant: 'info' })
        }
      } else {
        failOp(opId, result.message)
        enqueueSnackbar(result.message || 'Error claiming funds', { variant: 'error' })
      }
    } catch {
      failOp(opId)
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
          bottom: 0,
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          zIndex: -1,
          pointerEvents: 'none'
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
          onSwapClick={swapModal.onTrue}
          onClaimClick={handleClaimSubmit}
          onCryptoClick={() => setCryptoExpanded((prev) => !prev)}
          onPolymarketClick={polymarketDrawer.onTrue}
          isClaiming={isClaiming || claimInProgress}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          totals={safeBalances.totals}
          tokenLogos={tokenLogos}
          balances={safeBalances.balances}
          cryptoExpanded={cryptoExpanded}
          onCryptoToggle={() => setCryptoExpanded((prev) => !prev)}
          priceData={priceData}
          polymarketReady={polymarketReady}
        />

        {/* Full-width History */}
        <Box sx={{ mt: 3 }}>
          <BankingRecentTransitions
            title={t('transactions.title')}
            isLoading={isLoadingTrxs || !walletAddress}
            tableData={mergedTransactions}
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
        tokens={tokens}
        selectedCurrency={selectedCurrency}
      />

      {/* Swap Modal */}
      <DashboardSwapModal
        open={swapModal.value}
        onClose={swapModal.onFalse}
        balances={safeBalances.balances}
        tokenLogos={tokenLogos}
        userWallet={walletAddress}
        tokens={tokens}
        selectedCurrency={selectedCurrency}
      />
    </>
  )
}

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const { user }: { user: AuthUserType } = useAuthContext()
  const [wallet, setWallet] = useState<string>('')

  useEffect(() => {
    if (user?.wallet) setWallet(user.wallet)
  }, [user])

  return (
    <PolymarketActivityProvider wallet={wallet}>
      <BankingDashboardContent />
    </PolymarketActivityProvider>
  )
}
