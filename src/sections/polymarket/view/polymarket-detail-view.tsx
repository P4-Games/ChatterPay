'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'

import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react'

setWasmUrl('/dotlottie-player.wasm')

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import ButtonGroup from '@mui/material/ButtonGroup'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Unstable_Grid2'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import { alpha, useTheme } from '@mui/material/styles'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'
import { useResponsive } from 'src/hooks/use-responsive'
import {
  useGetPolymarketMarket,
  useGetPolymarketEventsInfinite,
  polymarketAccountStatus,
  polymarketPurchase,
  useGetWalletBalance,
  polymarketPurchaseStatus,
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  polymarketCancelOrder,
  useGetPolymarketTradesSWR
} from 'src/app/api/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useSWRConfig } from 'swr'
import { useAuthContext } from 'src/auth/hooks'

import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'
import Chart, { useChart } from 'src/components/chart'
import { POLYMARKET_REFRESH, POLYMARKET_MIN_ORDER_USD } from 'src/config-global'

import { fNumber } from 'src/utils/format-number'
import { toEpochMs } from 'src/utils/format-time'

import PolymarketTermsOverlay from '../polymarket-terms-overlay'

import type {
  IPolymarketMarket,
  IPolymarketPosition,
  IPolymarketAccountStatus
} from 'src/types/polymarket'
import type { IBalances } from 'src/types/wallet'
import type { AuthUserType } from 'src/auth/types'

// ----------------------------------------------------------------------

const PRESET_AMOUNTS = [POLYMARKET_MIN_ORDER_USD, 5, 10, 50, 100]

// Static part of the order-success bottom drawer style (backgroundColor stays inline — it's theme-dependent).
const ORDER_SUCCESS_DRAWER_STYLE = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 320,
  borderRadius: '20px 20px 0 0',
  zIndex: 11,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  padding: '36px 24px 32px',
  cursor: 'grab',
  touchAction: 'none'
} as const

const OUTCOME_COLORS_LIGHT = [
  '#1B1B1B', // Black
  '#2196F3', // Blue
  '#F44336', // Red
  '#FF9800', // Orange
  '#673AB7', // Purple
  '#9E9E9E' // Grey (Other)
]

const OUTCOME_COLORS_DARK = [
  '#E0E0E0', // Light grey (replaces black)
  '#64B5F6', // Blue (brighter)
  '#EF5350', // Red
  '#FFB74D', // Orange
  '#B39DDB', // Purple (brighter)
  '#BDBDBD' // Grey (Other)
]

function getOutcomeColor(index: number, dark: boolean): string {
  const palette = dark ? OUTCOME_COLORS_DARK : OUTCOME_COLORS_LIGHT
  return palette[index % palette.length]
}

/** Generate deterministic mock price history based on current prices */
function generateMockPriceHistory(outcomes: string[], prices: number[]) {
  const categories = ['Nov 30', 'Dec 31', 'Jan 14', 'Jan 31', 'Feb 26']

  const series = outcomes.map((name, idx) => {
    const current = (prices[idx] || 0) * 100
    const seed = name.length + idx * 7
    // Start from a mid-range base and converge toward current price
    const startBase = Math.max(5, Math.min(30, current * 0.7 + 5))
    const data = categories.map((_, i) => {
      const progress = i / (categories.length - 1)
      const base = startBase + (current - startBase) * progress
      const wobble = Math.sin(seed * (i + 1) * 0.7) * 3
      return Math.max(1, Math.round((base + wobble) * 10) / 10)
    })
    // Snap last point to actual current price
    data[data.length - 1] = Math.round(current * 10) / 10
    return { name, data }
  })

  // Compute dynamic Y-axis max (round up to nearest 5, minimum 35)
  const allValues = series.flatMap((s) => s.data)
  const dataMax = Math.max(...allValues, 35)
  const yMax = Math.ceil(dataMax / 5) * 5

  return { categories, series, yMax }
}

// ── Active purchase tracking ──
type ActivePurchase = {
  purchase_id: string
  side: 'BUY' | 'SELL'
  outcome: string
  size: number
  price: number
  current_step: string
  status: string
}

const STEP_LABELS: Record<string, string> = {
  submitting: 'Submitting',
  account_creation: 'Creating account',
  bridge: 'Bridging funds',
  order_placement: 'Placing order',
  done: 'Complete'
}

// ── Framer Motion variants ──
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

// ----------------------------------------------------------------------

type Props = { slug: string }

export default function PolymarketDetailView({ slug }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const router = useRouter()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const mdUp = useResponsive('up', 'md')

  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()

  // Account status for terms check
  const [accountStatus, setAccountStatus] = useState<IPolymarketAccountStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const checkAccountStatus = useCallback(async () => {
    try {
      const result = await polymarketAccountStatus()
      if (result.ok && result.data) {
        setAccountStatus(result.data)
      }
    } catch {
      // Silently fail — don't block the market
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      checkAccountStatus()
    } else {
      setStatusLoading(false)
    }
  }, [user?.id, checkAccountStatus])

  // Show terms overlay if logged in + terms not accepted
  const showTermsOverlay =
    !statusLoading && !!user?.id && accountStatus && !accountStatus.account?.terms_accepted

  const { data, isLoading, isValidating } = useGetPolymarketMarket(slug)
  const {
    events,
    isLoading: eventsLoading,
    isLoadingMore: eventsLoadingMore
  } = useGetPolymarketEventsInfinite(undefined, user?.id)
  const marketFromApi: IPolymarketMarket | null = data?.data || null
  // Fall back to the markets already cached from the hub/events list. This is the page's
  // instant-render path when navigating from /polymarket, and — crucially — the only source
  // for closed/resolved markets, which the by-slug endpoint 404s on even though they're still
  // listed in the hub. (We deliberately do NOT auto-paginate the events feed here: the backend
  // returns a full page for every offset, so `hasMore` is never false and a paginate-until-found
  // loop would never terminate. The detail view shares the hub's SWR cache, so any page the user
  // has already scrolled is available without re-fetching.)
  const marketFromCache: IPolymarketMarket | null = !marketFromApi
    ? (events.flatMap((e) => e.markets).find((m) => m.slug === slug) ?? null)
    : null
  const market: IPolymarketMarket | null = marketFromApi || marketFromCache

  // Only treat the market as "not found" once every source has settled. While the by-slug
  // request is loading or revalidating (including SWR's silent error retries), or the events
  // cache is still loading, keep the skeleton up so the transition stays smooth.
  const isResolvingMarket =
    !market && (isLoading || isValidating || eventsLoading || eventsLoadingMore)

  // Wallet balance
  const walletAddress = user?.wallet || ''
  const { data: balancesData } = useGetWalletBalance(walletAddress)
  const balances: IBalances | null = balancesData || null

  const maxBalanceToken = balances?.balances?.reduce(
    (max, b) => (b.balance_conv?.usd > (max?.balance_conv?.usd || 0) ? b : max),
    balances?.balances?.[0] || null
  )
  const availableBalance = maxBalanceToken?.balance_conv?.usd || 0
  const balanceTokenSymbol = maxBalanceToken?.token || 'USDC'

  // Token selector (null = use highest-balance token by default)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const effectiveToken = selectedToken ?? maxBalanceToken?.token ?? ''
  const availableTokens = (balances?.balances || []).filter((b) => (b.balance_conv?.usd || 0) > 0)
  const selectedTokenData =
    balances?.balances?.find((b) => b.token === effectiveToken) ?? maxBalanceToken
  const selectedTokenBalance = selectedTokenData?.balance_conv?.usd || 0

  const dynamicPresets = PRESET_AMOUNTS.filter((p) => p <= selectedTokenBalance)
  const depositUrl = `https://chatterpay.net/deposit?address=${walletAddress}`

  // Trade state
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0)
  const [amount, setAmount] = useState<number>(POLYMARKET_MIN_ORDER_USD)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [sellingPos, setSellingPos] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState<string>(String(POLYMARKET_MIN_ORDER_USD))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [activePurchases, setActivePurchases] = useState<ActivePurchase[]>([])
  const [soldPositionKeys, setSoldPositionKeys] = useState<Set<string>>(new Set())
  const [partialSellAnchor, setPartialSellAnchor] = useState<HTMLElement | null>(null)
  const [tokenMenuAnchor, setTokenMenuAnchor] = useState<HTMLElement | null>(null)
  const [partialSellPos, setPartialSellPos] = useState<IPolymarketPosition | null>(null)
  const [partialSellAmount, setPartialSellAmount] = useState('')
  const [optimisticPositions, setOptimisticPositions] = useState<IPolymarketPosition[]>([])
  const [orderSuccess, setOrderSuccess] = useState<{ side: 'BUY' | 'SELL' } | null>(null)

  const closeOrderSuccess = () => {
    setOrderSuccess(null)
    setAmount(0)
    setCustomAmount('0')
    setError(null)
  }

  const { data: positions = [] } = useGetPolymarketPositionsSWR(POLYMARKET_REFRESH.LIVE_MS)
  const { data: orders = [] } = useGetPolymarketOrdersSWR(POLYMARKET_REFRESH.LIVE_MS)
  const { data: marketTrades = [] } = useGetPolymarketTradesSWR(
    POLYMARKET_REFRESH.HISTORY_MS,
    market?.condition_id
  )

  const realMarketPositions = positions.filter((p) => {
    if (p.conditionId !== market?.condition_id && p.market?.condition_id !== market?.condition_id)
      return false
    return !soldPositionKeys.has((p.market?.condition_id || p.conditionId) + p.outcome)
  })

  // Merge optimistic positions, removing any that now exist in real data
  const realOutcomes = new Set(realMarketPositions.map((p) => p.outcome))
  const pendingOptimistic = optimisticPositions.filter((op) => !realOutcomes.has(op.outcome))
  const marketPositions = [...realMarketPositions, ...pendingOptimistic]
  const marketOrders = orders.filter((o) => o.market?.condition_id === market?.condition_id)

  const outcomes = market?.outcomes || ['Yes', 'No']
  const prices = (market?.outcome_prices || []).map(Number)
  const selectedPrice = prices[selectedOutcome] || 0
  const estimatedReturn = selectedPrice > 0 ? amount / selectedPrice : 0
  const estimatedProfit = estimatedReturn - amount
  const belowMinimum = amount > 0 && amount < POLYMARKET_MIN_ORDER_USD
  const tokenId = market?.tokens?.[selectedOutcome]?.token_id || ''

  // Chart data (memoised on market id)
  const chartData = useMemo(
    () => (market ? generateMockPriceHistory(outcomes, prices) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [market?.condition_id]
  )

  const yMax = chartData?.yMax || 35

  const chartOptions = useChart({
    colors: outcomes.map((_, idx) => getOutcomeColor(idx, isDark)),
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.28,
        opacityTo: 0.02,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartData?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.disabled, fontSize: '11px' } }
    },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: 4,
      labels: {
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { colors: theme.palette.text.disabled, fontSize: '11px' }
      }
    },
    grid: {
      strokeDashArray: 4,
      borderColor: alpha(theme.palette.grey[500], 0.16),
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: false },
    tooltip: { theme: 'false' as const, y: { formatter: (val: number) => `${val.toFixed(1)}%` } },
    markers: { size: 0 }
  })

  // ── Handlers ──
  const handlePresetClick = (val: number) => {
    setAmount(val)
    setCustomAmount(String(val))
    setError(null)
    setSuccess(null)
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomAmount(val)
    const parsed = Number.parseFloat(val)
    if (!Number.isNaN(parsed) && parsed >= 0) setAmount(parsed)
    setError(null)
    setSuccess(null)
  }

  const handleSellPosition = async (pos: IPolymarketPosition, overrideSize?: number) => {
    const posKey = (pos.market?.condition_id || pos.conditionId) + pos.outcome
    setSellingPos(posKey)

    const token = market?.tokens?.find((tk) => tk.outcome === pos.outcome)
    if (!token?.token_id) {
      enqueueSnackbar(t('polymarket.token-id-not-found'), { variant: 'error' })
      setSellingPos(null)
      return
    }

    const sellSize = overrideSize ?? Math.floor(pos.size * 1e6) / 1e6
    const sellPrice = pos.current_price ?? pos.curPrice ?? 0
    const tempId = `temp-${Date.now()}`

    setActivePurchases((prev) => [
      ...prev,
      {
        purchase_id: tempId,
        side: 'SELL',
        outcome: pos.outcome,
        size: sellSize,
        price: sellPrice,
        current_step: 'submitting',
        status: 'processing'
      }
    ])

    try {
      const res = await polymarketPurchase({
        token_id: token.token_id,
        side: 'SELL',
        size: sellSize,
        price: sellPrice,
        bridge_amount: '0'
      })
      if (res.ok) {
        const purchaseId = res.data?.purchase_id
        setSoldPositionKeys((prev) => new Set(prev).add(posKey))

        const revalidateSell = () => {
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/positions'),
            undefined,
            { revalidate: true }
          )
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders'),
            undefined,
            { revalidate: true }
          )
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio'),
            undefined,
            { revalidate: true }
          )
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'),
            undefined,
            { revalidate: true }
          )
        }

        // No purchase_id → backend completed the operation synchronously (e.g. claim).
        if (!purchaseId) {
          setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
          enqueueSnackbar(t('polymarket.sell-completed'), { variant: 'success' })
          revalidateSell()
          setTimeout(revalidateSell, 3000)
          setSoldPositionKeys((prev) => {
            const n = new Set(prev)
            n.delete(posKey)
            return n
          })
        } else {
          setActivePurchases((prev) =>
            prev.map((p) =>
              p.purchase_id === tempId
                ? { ...p, purchase_id: purchaseId, current_step: 'order_placement' }
                : p
            )
          )

          const poll = async () => {
            try {
              const statusRes = await polymarketPurchaseStatus(purchaseId)
              if (!statusRes.ok) {
                // Purchase not found or backend error — stop polling to avoid infinite loop.
                clearInterval(pollInterval)
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar(t('polymarket.sell-completed'), { variant: 'success' })
                revalidateSell()
                setTimeout(revalidateSell, 3000)
                setSoldPositionKeys((prev) => {
                  const n = new Set(prev)
                  n.delete(posKey)
                  return n
                })
                return
              }
              if (statusRes.data) {
                const st = statusRes.data.status
                const step = statusRes.data.current_step || ''
                setActivePurchases((prev) =>
                  prev.map((p) =>
                    p.purchase_id === purchaseId ? { ...p, current_step: step, status: st } : p
                  )
                )
                if (st === 'completed') {
                  clearInterval(pollInterval)
                  setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                  enqueueSnackbar(t('polymarket.sell-completed'), { variant: 'success' })
                  revalidateSell()
                  setTimeout(revalidateSell, 3000)
                  setSoldPositionKeys((prev) => {
                    const n = new Set(prev)
                    n.delete(posKey)
                    return n
                  })
                } else if (st === 'failed') {
                  clearInterval(pollInterval)
                  setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                  enqueueSnackbar(statusRes.data.error || t('polymarket.sell-failed'), {
                    variant: 'error'
                  })
                  setSoldPositionKeys((prev) => {
                    const n = new Set(prev)
                    n.delete(posKey)
                    return n
                  })
                }
              }
            } catch (e) {
              console.error(e)
            }
          }
          poll()
          const pollInterval = setInterval(poll, 4000)
        }
      } else {
        setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
        enqueueSnackbar(res.message || t('polymarket.error-executing-sell'), { variant: 'error' })
      }
    } catch {
      setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
      enqueueSnackbar(t('polymarket.error-executing-sell'), { variant: 'error' })
    } finally {
      setSellingPos(null)
    }
  }

  const handlePartialSell = () => {
    if (!partialSellPos) return
    const amt = parseFloat(partialSellAmount)
    if (!amt || amt <= 0 || amt > partialSellPos.size) return
    setPartialSellAnchor(null)
    handleSellPosition(partialSellPos, Math.floor(amt * 1e6) / 1e6)
    setPartialSellPos(null)
    setPartialSellAmount('')
  }

  const handleSubmit = async () => {
    if (amount <= 0 || !tokenId || selectedPrice <= 0) return
    if (amount < POLYMARKET_MIN_ORDER_USD) {
      setError(t('polymarket.minimum-order', { amount: fNumber(POLYMARKET_MIN_ORDER_USD) }))
      return
    }
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const tokenQuantity = Math.floor((amount / selectedPrice) * 100) / 100
      const bridgeAmountWei = Math.floor(amount * 1e6).toString()

      const result = await polymarketPurchase({
        token_id: tokenId,
        side: 'BUY',
        size: tokenQuantity,
        price: selectedPrice,
        bridge_amount: bridgeAmountWei,
        bridge_token: effectiveToken || balanceTokenSymbol
      })

      if (result.ok) {
        setOrderSuccess({ side: 'BUY' })

        mutate(
          (key: any) =>
            Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'),
          (currentData: any) => {
            if (!currentData || !Array.isArray(currentData.balances)) return currentData
            return {
              ...currentData,
              balances: currentData.balances.map((b: any) =>
                b.token === effectiveToken
                  ? {
                      ...b,
                      balance_conv: {
                        ...b.balance_conv,
                        usd: Math.max(0, (b.balance_conv?.usd || 0) - amount)
                      }
                    }
                  : b
              ),
              totals: {
                ...currentData.totals,
                usd: Math.max(0, (currentData.totals?.usd || 0) - amount)
              }
            }
          },
          { revalidate: false }
        )

        const purchaseId = result.data?.purchase_id
        if (purchaseId) {
          // Track active purchase in UI
          const newPurchase: ActivePurchase = {
            purchase_id: purchaseId,
            side: 'BUY',
            outcome: outcomes[selectedOutcome],
            size: tokenQuantity,
            price: selectedPrice,
            current_step: 'bridge',
            status: 'processing'
          }
          setActivePurchases((prev) => [...prev, newPurchase])

          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await polymarketPurchaseStatus(purchaseId)
              if (!statusRes.ok) {
                // Purchase not found or backend error — stop polling to avoid an
                // infinite loop. A 404 here most likely means the order already
                // settled without a status record.
                clearInterval(pollInterval)
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar(t('polymarket.order-placed'), { variant: 'success' })
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) &&
                    typeof key[0] === 'string' &&
                    key[0].includes('/positions')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) &&
                    typeof key[0] === 'string' &&
                    key[0].includes('/portfolio')
                )
                return
              }
              if (statusRes.ok && statusRes.data) {
                const st = statusRes.data.status
                const step = statusRes.data.current_step || ''

                // Update active purchase step
                setActivePurchases((prev) =>
                  prev.map((p) =>
                    p.purchase_id === purchaseId ? { ...p, current_step: step, status: st } : p
                  )
                )

                if (st === 'completed') {
                  clearInterval(pollInterval)
                  setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))

                  // Add optimistic position immediately so the user sees it
                  if (market) {
                    const optPos: IPolymarketPosition = {
                      market,
                      outcome: outcomes[selectedOutcome],
                      size: tokenQuantity,
                      avg_price: selectedPrice,
                      current_price: selectedPrice,
                      pnl: 0,
                      pnl_percent: 0,
                      conditionId: market.condition_id
                    }
                    setOptimisticPositions((prev) => [...prev, optPos])
                    // Clear optimistic position after 30s (real data should arrive by then)
                    setTimeout(() => {
                      setOptimisticPositions((prev) => prev.filter((op) => op !== optPos))
                    }, 30000)
                  }

                  // Revalidate all related data
                  const revalidateAll = () => {
                    mutate(
                      (key: any) =>
                        Array.isArray(key) &&
                        typeof key[0] === 'string' &&
                        key[0].includes('/balance'),
                      undefined,
                      { revalidate: true }
                    )
                    mutate(
                      (key: any) =>
                        Array.isArray(key) &&
                        typeof key[0] === 'string' &&
                        key[0].includes('/positions'),
                      undefined,
                      { revalidate: true }
                    )
                    mutate(
                      (key: any) =>
                        Array.isArray(key) &&
                        typeof key[0] === 'string' &&
                        key[0].includes('/orders'),
                      undefined,
                      { revalidate: true }
                    )
                    mutate(
                      (key: any) =>
                        Array.isArray(key) &&
                        typeof key[0] === 'string' &&
                        key[0].includes('/portfolio'),
                      undefined,
                      { revalidate: true }
                    )
                  }
                  revalidateAll()
                  // Retry after 3s in case backend hasn't settled yet
                  setTimeout(revalidateAll, 3000)
                } else if (st === 'failed') {
                  clearInterval(pollInterval)
                  setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                  enqueueSnackbar(statusRes.data.error || 'Transaction failed', {
                    variant: 'error'
                  })
                  mutate(
                    (key: any) =>
                      Array.isArray(key) &&
                      typeof key[0] === 'string' &&
                      key[0].includes('/balance')
                  )
                }
              }
            } catch (e) {
              console.error(e)
            }
          }, 4000)
        }
      } else {
        setError(result.message || t('polymarket.order-error'))
      }
    } catch {
      setError(t('polymarket.order-error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Loading skeleton ──
  if (isResolvingMarket) {
    return (
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          flex: 1,
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          minHeight: '100vh',
          pb: 10
        }}
      >
        <Container
          maxWidth={settings.themeStretch ? false : 'xl'}
          sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
        >
          <Stack spacing={3}>
            <Skeleton variant='rounded' height={60} />
            <Grid container spacing={3}>
              <Grid xs={12} md={5}>
                <Skeleton variant='rounded' height={500} />
              </Grid>
              <Grid xs={12} md={7}>
                <Skeleton variant='rounded' height={500} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    )
  }

  // ── Not found ──
  if (!market) {
    return (
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          flex: 1,
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          minHeight: '100vh'
        }}
      >
        <Container
          maxWidth={settings.themeStretch ? false : 'xl'}
          sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
        >
          <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
            <Typography variant='h6'>{t('polymarket.market-not-found')}</Typography>
            <Button
              variant='contained'
              onClick={() => router.push(paths.dashboard.polymarket.root)}
              startIcon={<HugeiconsIcon icon={ArrowLeft01Icon} />}
              sx={{ mt: 2 }}
            >
              {t('polymarket.back-to-markets')}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  // Closed / resolved markets are read-only: still viewable, but no new predictions.
  // Key off `closed` only — the backend also flags some live placeholder markets as
  // `active: false`, so that field would wrongly mark them as closed.
  const isMarketClosed = !!market.closed

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDER SECTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── Bet Module ──
  const renderBetModule = (
    <Stack
      spacing={3}
      component={m.div}
      variants={staggerContainer}
      initial='initial'
      animate='animate'
    >
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <Card
          component={m.div}
          variants={fadeInUp}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          sx={{
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            boxShadow: 'none',
            overflow: 'visible'
          }}
        >
          {/* WHO DO YOU THINK WINS? */}
          <Box sx={{ p: 3 }}>
            <Typography
              variant='overline'
              sx={{
                mb: 2,
                display: 'block',
                color: 'text.secondary',
                letterSpacing: 1.5,
                fontSize: '0.7rem'
              }}
            >
              {isMarketClosed
                ? t('polymarket.final-result')
                : outcomes.length === 2
                  ? t('polymarket.predict-question-yn')
                  : t('polymarket.predict-question-header')}
            </Typography>

            <Stack spacing={0}>
              {outcomes.map((outcome, idx) => {
                const price = prices[idx] || 0
                const percent = Math.round(price * 100)
                const isSelected = selectedOutcome === idx
                const dotColor = getOutcomeColor(idx, isDark)

                return (
                  <Box
                    key={outcome}
                    onClick={() => {
                      setSelectedOutcome(idx)
                      setError(null)
                      setSuccess(null)
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.75,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      border: `2px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      transition: 'border-color 0.1s ease, background-color 0.1s ease',
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.06) }
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: dotColor,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        {outcome === 'Yes'
                          ? t('common.yes')
                          : outcome === 'No'
                            ? t('common.no')
                            : outcome}
                      </Typography>
                    </Stack>

                    <Stack direction='row' alignItems='center' spacing={1}>
                      <Typography variant='body2' color='text.secondary'>
                        {percent}% {t('polymarket.chance')}
                      </Typography>
                      {isSelected && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={18}
                          style={{ color: theme.palette.primary.main }}
                        />
                      )}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          {isMarketClosed ? (
            <>
              <Divider />
              <Box sx={{ p: 3 }}>
                <Alert
                  severity='info'
                  icon={false}
                  sx={{ justifyContent: 'center', fontWeight: 600 }}
                >
                  {t('polymarket.market-closed-notice')}
                </Alert>
              </Box>
            </>
          ) : (
            <>
              <Divider />

              {/* HOW MUCH DO YOU WANT TO PREDICT? */}
              <Box sx={{ p: 3 }}>
                <Typography
                  variant='overline'
                  sx={{
                    mb: 2.5,
                    display: 'block',
                    color: 'text.secondary',
                    letterSpacing: 1.5,
                    fontSize: '0.7rem'
                  }}
                >
                  {t('polymarket.predict-amount-header')}
                </Typography>

                {/* Preset pills */}
                <Stack direction='row' spacing={1} sx={{ mb: 2.5 }} flexWrap='wrap' useFlexGap>
                  {PRESET_AMOUNTS.map((preset) => {
                    const isActive = amount === preset
                    return (
                      <Button
                        key={preset}
                        variant={isActive ? 'contained' : 'outlined'}
                        onClick={() => handlePresetClick(preset)}
                        sx={{
                          minWidth: 64,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          borderRadius: 50,
                          textTransform: 'none',
                          px: 2.5,
                          py: 1,
                          ...(isActive
                            ? {
                                bgcolor: isDark ? theme.palette.grey[200] : '#1B1B1B',
                                color: isDark ? theme.palette.grey[900] : '#fff',
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: isDark ? theme.palette.grey[300] : '#333',
                                  boxShadow: 'none'
                                }
                              }
                            : {
                                borderColor: alpha(theme.palette.grey[500], 0.24),
                                color: 'text.primary',
                                '&:hover': {
                                  borderColor: theme.palette.grey[400],
                                  bgcolor: alpha(theme.palette.grey[500], 0.08)
                                }
                              })
                        }}
                      >
                        ${preset}
                      </Button>
                    )
                  })}
                </Stack>

                {/* Custom amount input */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${amount > selectedTokenBalance && selectedTokenBalance > 0 ? theme.palette.warning.main : alpha(theme.palette.grey[500], 0.2)}`,
                    borderRadius: 1.5,
                    px: 2,
                    py: 1.25,
                    maxWidth: { xs: '100%', md: 200 }
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}
                  >
                    $
                  </Typography>
                  <Box
                    component='input'
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    type='number'
                    min={POLYMARKET_MIN_ORDER_USD}
                    sx={{
                      border: 'none',
                      outline: 'none',
                      bgcolor: 'transparent',
                      fontSize: 15,
                      fontWeight: 500,
                      width: '100%',
                      fontFamily: 'inherit',
                      color: 'text.primary',
                      '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0
                      }
                    }}
                  />
                </Box>

                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {t('polymarket.available')}: ${fNumber(selectedTokenBalance)}
                  <Box
                    component='span'
                    onClick={
                      availableTokens.length > 1
                        ? (e: any) => setTokenMenuAnchor(e.currentTarget)
                        : undefined
                    }
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      px: 0.75,
                      py: 0.125,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      letterSpacing: 0.5,
                      cursor: availableTokens.length > 1 ? 'pointer' : 'default',
                      userSelect: 'none',
                      '&:hover':
                        availableTokens.length > 1
                          ? { bgcolor: alpha(theme.palette.primary.main, 0.16) }
                          : {}
                    }}
                  >
                    {effectiveToken || balanceTokenSymbol}
                    {availableTokens.length > 1 && (
                      <Iconify icon='eva:chevron-down-fill' width={10} />
                    )}
                  </Box>
                </Typography>

                <Menu
                  anchorEl={tokenMenuAnchor}
                  open={Boolean(tokenMenuAnchor)}
                  onClose={() => setTokenMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5 } } }}
                >
                  {availableTokens.map((tok) => (
                    <MenuItem
                      key={tok.token}
                      selected={effectiveToken === tok.token}
                      onClick={() => {
                        setSelectedToken(tok.token)
                        setTokenMenuAnchor(null)
                      }}
                      sx={{ fontSize: '0.85rem' }}
                    >
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        width='100%'
                        spacing={2}
                      >
                        <Typography variant='body2' fontWeight={600}>
                          {tok.token}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ${fNumber(tok.balance_conv.usd)}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Menu>

                {/* Below minimum order */}
                {belowMinimum && (
                  <Alert severity='warning' sx={{ mt: 1.5, py: 0.75 }}>
                    {t('polymarket.minimum-order', { amount: fNumber(POLYMARKET_MIN_ORDER_USD) })}
                  </Alert>
                )}

                {/* Insufficient balance */}
                {amount > selectedTokenBalance && selectedTokenBalance >= 0 && amount > 0 && (
                  <Alert
                    severity='warning'
                    sx={{ mt: 1.5, py: 0.75 }}
                    action={
                      <Button
                        size='small'
                        href={depositUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        {t('polymarket.deposit')}
                      </Button>
                    }
                  >
                    {t('polymarket.insufficient-balance')}
                  </Alert>
                )}
              </Box>

              {/* Return estimate */}
              {amount > 0 && selectedPrice > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {t('polymarket.if-outcome-wins', {
                        outcome:
                          outcomes[selectedOutcome] === 'Yes'
                            ? t('common.yes')
                            : outcomes[selectedOutcome] === 'No'
                              ? t('common.no')
                              : outcomes[selectedOutcome]
                      })}
                    </Typography>
                    <Typography variant='h4' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {t('polymarket.you-get-back', { amount: fNumber(estimatedReturn) })}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {t('polymarket.prediction-summary', {
                        amount: fNumber(amount),
                        profit: fNumber(estimatedProfit)
                      })}
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </Card>

        {/* ── Success drawer scoped to this card ── */}
        <AnimatePresence>
          {orderSuccess && (
            <>
              <m.div
                key='card-backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeOrderSuccess}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              />
              <m.div
                key='card-drawer'
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                drag='y'
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0, bottom: 0.25 }}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.y > 60 || velocity.y > 400) closeOrderSuccess()
                }}
                transition={{ type: 'spring', damping: 38, stiffness: 380 }}
                style={{
                  ...ORDER_SUCCESS_DRAWER_STYLE,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.24)
                  }}
                />
                <Box sx={{ width: 140, height: 140, flexShrink: 0 }}>
                  <DotLottieReact
                    src='/assets/images/illustrations/checkmark_animation.json'
                    autoplay
                    loop={false}
                    style={{ width: 140, height: 140 }}
                  />
                </Box>
                <Stack alignItems='center' spacing={0.5}>
                  <Typography variant='h5' fontWeight={800} textAlign='center'>
                    {t('polymarket.order-sent')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    {t('polymarket.order-sent-subtitle')}
                  </Typography>
                </Stack>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </Box>

      {/* Alerts */}
      {error && (
        <m.div variants={fadeInUp}>
          <Alert severity='error'>{error}</Alert>
        </m.div>
      )}
      {success && (
        <m.div variants={fadeInUp}>
          <Alert severity='success'>{success}</Alert>
        </m.div>
      )}

      {/* CTA */}
      <Box
        component={m.div}
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Button
          fullWidth
          variant='contained'
          color='primary'
          size='large'
          onClick={orderSuccess ? closeOrderSuccess : handleSubmit}
          disabled={
            isMarketClosed ||
            (!orderSuccess &&
              (amount <= 0 || belowMinimum || isSubmitting || amount > selectedTokenBalance))
          }
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color='inherit' />
            ) : orderSuccess ? (
              <Iconify icon='eva:refresh-fill' width={20} />
            ) : null
          }
          sx={{
            py: 2,
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: 50,
            textTransform: 'none'
          }}
        >
          {isMarketClosed
            ? t('polymarket.market-closed-cta')
            : orderSuccess
              ? t('polymarket.place-another')
              : isSubmitting
                ? t('polymarket.placing-prediction')
                : t('polymarket.predict-cta', {
                    amount: fNumber(amount),
                    outcome:
                      outcomes[selectedOutcome] === 'Yes'
                        ? t('common.yes')
                        : outcomes[selectedOutcome] === 'No'
                          ? t('common.no')
                          : outcomes[selectedOutcome]
                  })}
        </Button>
      </Box>
    </Stack>
  )

  // ── Market Details (chart + odds + how-it-works) ──
  const renderMarketDetails = (
    <Card
      component={m.div}
      variants={fadeInUp}
      initial='initial'
      animate='animate'
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, boxShadow: 'none' }}
    >
      {/* ODDS OVER TIME */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant='overline'
          sx={{
            mb: 2,
            display: 'block',
            color: 'text.secondary',
            letterSpacing: 1.5,
            fontSize: '0.7rem'
          }}
        >
          {t('polymarket.odds-time')}
        </Typography>

        {chartData && (
          <Chart type='area' series={chartData.series} options={chartOptions} height={220} />
        )}

        {/* Legend */}
        <Stack direction='row' spacing={2} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {outcomes.map((outcome, idx) => (
            <Stack key={outcome} direction='row' alignItems='center' spacing={0.75}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: getOutcomeColor(idx, isDark),
                  flexShrink: 0
                }}
              />
              <Typography variant='caption' sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {outcome}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* CURRENT ODDS */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant='overline'
          sx={{
            mb: 2.5,
            display: 'block',
            color: 'text.secondary',
            letterSpacing: 1.5,
            fontSize: '0.7rem'
          }}
        >
          {t('polymarket.current-odds')}
        </Typography>

        <Stack spacing={2}>
          {outcomes.map((outcome, idx) => {
            const price = prices[idx] || 0
            const percent = Math.round(price * 100)
            const color = getOutcomeColor(idx, isDark)

            return (
              <Stack key={outcome} direction='row' alignItems='center' spacing={2}>
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }}
                />
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, minWidth: { xs: 60, md: 80 }, flexShrink: 0 }}
                >
                  {outcome}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant='determinate'
                    value={percent}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.grey[500], 0.08),
                      '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: color }
                    }}
                  />
                </Box>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 700, minWidth: 36, textAlign: 'right', flexShrink: 0 }}
                >
                  {percent}%
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* HOW IT WORKS */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
        <Typography
          variant='overline'
          sx={{
            mb: 1.5,
            display: 'block',
            color: 'text.secondary',
            letterSpacing: 1.5,
            fontSize: '0.7rem'
          }}
        >
          {t('polymarket.how-it-works')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('polymarket.how-it-works-desc')}
          {market.end_date_iso && (
            <>
              {' '}
              {t('polymarket.market-closes')}{' '}
              {new Date(market.end_date_iso).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              .
            </>
          )}
        </Typography>
      </Box>
    </Card>
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  MAIN RETURN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <>
      {showTermsOverlay && accountStatus?.terms && (
        <PolymarketTermsOverlay terms={accountStatus.terms} onAccepted={checkAccountStatus} />
      )}
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          flex: 1,
          minHeight: '100vh',
          bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
          backgroundImage: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
          pb: { xs: 10, md: 15 },
          mb: { xs: -10, md: -15 } // Buffer to prevent any clipping from parent layout
        }}
      >
        <Container
          maxWidth={settings.themeStretch ? false : 'xl'}
          sx={{
            pt: { xs: 11, md: 12 },
            px: { xs: 2, md: 3 }
          }}
        >
          <Stack
            spacing={3}
            component={m.div}
            initial='initial'
            animate='animate'
            variants={staggerContainer}
          >
            {/* ── HEADER ── */}
            <Stack
              spacing={1.5}
              component={m.div}
              variants={fadeInUp}
              transition={{ duration: 0.4 }}
            >
              <Button
                onClick={() => router.push(paths.dashboard.polymarket.root)}
                startIcon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />}
                sx={{
                  alignSelf: 'flex-start',
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 0,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', color: 'text.primary' }
                }}
              >
                {t('polymarket.back')}
              </Button>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent='space-between'
                spacing={2}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={2}
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  {market.image && (
                    <Box
                      component='img'
                      src={market.image}
                      alt={market.question}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                        bgcolor: 'grey.200',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <Typography
                    variant='h5'
                    sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: 20, md: 24 } }}
                  >
                    {market.question}
                  </Typography>
                  {market.category && (
                    <Chip
                      label={market.category}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: 0.75,
                        flexShrink: 0
                      }}
                    />
                  )}
                  {isMarketClosed && (
                    <Chip
                      label={t('polymarket.closed')}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.text.disabled, 0.16),
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: 0.75,
                        flexShrink: 0
                      }}
                    />
                  )}
                </Stack>

                <Stack direction='row' alignItems='center' spacing={3} sx={{ flexShrink: 0 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('polymarket.vol')} <strong>${fNumber(market.volume)}</strong>
                  </Typography>
                  {market.end_date_iso && (
                    <Typography variant='body2' color='text.secondary'>
                      {t('polymarket.ends-label')}{' '}
                      <strong>
                        {new Date(market.end_date_iso).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </strong>
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>

            {/* ── DESKTOP: side-by-side layout ── */}
            {mdUp && (
              <Grid container spacing={3}>
                <Grid xs={12} md={5}>
                  {renderBetModule}
                </Grid>
                <Grid xs={12} md={7}>
                  {renderMarketDetails}
                </Grid>
              </Grid>
            )}

            {/* ── MOBILE: bet module inside gradient ── */}
            {!mdUp && renderBetModule}

            {/* ── MOBILE: Market Details (also inside gradient) ── */}
            {!mdUp && (
              <Box component={m.div} variants={fadeInUp} transition={{ duration: 0.4 }}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 700 }}>
                  {t('polymarket.market-details')}
                </Typography>
                {renderMarketDetails}
              </Box>
            )}

            {/* ── POSITIONS & ORDERS ── */}
            <Box component={m.div} variants={fadeInUp} transition={{ duration: 0.4 }}>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 700, mt: mdUp ? 5 : 0 }}>
                {t('polymarket.my-activity')}
              </Typography>

              <Stack spacing={3}>
                {/* Active Positions */}
                <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ px: 3, py: 2.5 }}
                  >
                    <Typography variant='subtitle1' fontWeight={700}>
                      {t('polymarket.open-positions')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.16),
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      {marketPositions.length}
                    </Box>
                  </Stack>
                  {marketPositions.length === 0 ? (
                    <Stack alignItems='center' spacing={1.5} sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {t('polymarket.no-positions-market')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('polymarket.outcome')}</TableCell>
                          <TableCell align='right'>{t('polymarket.size')}</TableCell>
                          <TableCell align='right'>{t('polymarket.avg-price')}</TableCell>
                          <TableCell align='right'>{t('polymarket.current')}</TableCell>
                          <TableCell align='right'>{t('polymarket.pnl')}</TableCell>
                          <TableCell align='right'>{t('polymarket.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {marketPositions.map((pos, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <Chip
                                label={pos.outcome}
                                size='small'
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: alpha(
                                    pos.outcome?.toLowerCase() === 'yes'
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                    0.1
                                  ),
                                  color:
                                    pos.outcome?.toLowerCase() === 'yes'
                                      ? theme.palette.success.dark
                                      : theme.palette.error.dark
                                }}
                              />
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2' fontWeight={600}>
                                {fNumber(pos.size)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2'>
                                {Math.round((pos.avg_price ?? pos.avgPrice ?? 0) * 100)}¢
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2'>
                                {Math.round((pos.current_price ?? pos.curPrice ?? 0) * 100)}¢
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              {(() => {
                                const pnlVal = pos.pnl ?? pos.cashPnl ?? 0
                                const pnlRounded =
                                  (Math.floor(Math.abs(pnlVal) * 1e2) / 1e2) * (pnlVal < 0 ? -1 : 1)
                                return (
                                  <Typography
                                    variant='body2'
                                    fontWeight={700}
                                    color={pnlVal >= 0 ? 'success.main' : 'error.main'}
                                  >
                                    {pnlRounded === 0
                                      ? '$0.00'
                                      : `${pnlVal > 0 ? '+' : ''}$${fNumber(pnlRounded)}`}
                                  </Typography>
                                )
                              })()}
                            </TableCell>
                            <TableCell align='right'>
                              {(() => {
                                const posKey =
                                  (pos.market?.condition_id || pos.conditionId) + pos.outcome
                                return (
                                  <ButtonGroup
                                    size='small'
                                    color='error'
                                    variant='contained'
                                    disabled={sellingPos === posKey}
                                  >
                                    <Button onClick={() => handleSellPosition(pos)}>
                                      {sellingPos === posKey ? (
                                        <CircularProgress size={14} color='inherit' />
                                      ) : (
                                        t('polymarket.sell-all')
                                      )}
                                    </Button>
                                    <Button
                                      sx={{ px: 0.5, minWidth: 28 }}
                                      onClick={(e) => {
                                        setPartialSellPos(pos)
                                        setPartialSellAmount(
                                          String(Math.floor(pos.size * 1e6) / 1e6)
                                        )
                                        setPartialSellAnchor(e.currentTarget)
                                      }}
                                    >
                                      <Iconify icon='eva:chevron-down-fill' width={16} />
                                    </Button>
                                  </ButtonGroup>
                                )
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>

                {/* Open Orders */}
                <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ px: 3, py: 2.5 }}
                  >
                    <Typography variant='subtitle1' fontWeight={700}>
                      {t('polymarket.open-orders')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.warning.main, 0.16),
                        color: 'warning.main',
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      {activePurchases.length + marketOrders.length}
                    </Box>
                  </Stack>
                  {activePurchases.length === 0 && marketOrders.length === 0 ? (
                    <Stack alignItems='center' spacing={1.5} sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.secondary'>
                        {t('polymarket.no-orders-market')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('polymarket.side')}</TableCell>
                          <TableCell>{t('polymarket.outcome')}</TableCell>
                          <TableCell align='right'>{t('polymarket.size')}</TableCell>
                          <TableCell align='right'>{t('polymarket.price')}</TableCell>
                          <TableCell align='right'>{t('polymarket.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activePurchases.map((ap) => (
                          <TableRow
                            key={ap.purchase_id}
                            sx={{
                              '@keyframes softPulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 }
                              },
                              animation: 'softPulse 2s ease-in-out infinite'
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={ap.side}
                                size='small'
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: alpha(
                                    ap.side === 'BUY'
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                    0.1
                                  ),
                                  color:
                                    ap.side === 'BUY'
                                      ? theme.palette.success.dark
                                      : theme.palette.error.dark
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>{ap.outcome}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2' fontWeight={600}>
                                {fNumber(ap.size)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2'>{fNumber(ap.price)}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Chip
                                label={
                                  <Box
                                    component='span'
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                                  >
                                    <CircularProgress
                                      size={10}
                                      sx={{
                                        color: 'inherit !important',
                                        display: 'block',
                                        mt: '1px'
                                      }}
                                    />
                                    {STEP_LABELS[ap.current_step] || ap.current_step}
                                  </Box>
                                }
                                size='small'
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: theme.palette.text.primary,
                                  color: theme.palette.background.paper,
                                  pointerEvents: 'none'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {marketOrders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>
                              <Chip
                                label={order.side}
                                size='small'
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: alpha(
                                    order.side === 'BUY'
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                    0.1
                                  ),
                                  color:
                                    order.side === 'BUY'
                                      ? theme.palette.success.dark
                                      : theme.palette.error.dark
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>{order.outcome}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2' fontWeight={600}>
                                {fNumber(order.size)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography variant='body2'>{fNumber(order.price)}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              {order.status !== 'cancelled' && order.status !== 'filled' && (
                                <Button
                                  size='small'
                                  variant='outlined'
                                  color='inherit'
                                  disabled={cancellingId === order.id}
                                  onClick={async () => {
                                    setCancellingId(order.id)
                                    try {
                                      const result = await polymarketCancelOrder(order.id)
                                      if (result.ok) {
                                        enqueueSnackbar(t('polymarket.order-cancelled'), {
                                          variant: 'success'
                                        })
                                        mutate(
                                          (key: any) =>
                                            Array.isArray(key) &&
                                            typeof key[0] === 'string' &&
                                            key[0].includes('/orders')
                                        )
                                      }
                                    } catch {
                                    } finally {
                                      setCancellingId(null)
                                    }
                                  }}
                                >
                                  {cancellingId === order.id ? (
                                    <CircularProgress size={14} color='inherit' />
                                  ) : (
                                    t('polymarket.cancel')
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>

                {/* Trade History */}
                {marketTrades.length > 0 && (
                  <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                      sx={{ px: 3, py: 2.5 }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Typography variant='subtitle1' fontWeight={700}>
                          {t('polymarket.trade-history')}
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.info.main, 0.16),
                            color: 'info.main',
                            fontWeight: 700,
                            fontSize: 12
                          }}
                        >
                          {marketTrades.length}
                        </Box>
                      </Stack>
                    </Stack>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('polymarket.side')}</TableCell>
                          <TableCell>{t('polymarket.outcome')}</TableCell>
                          <TableCell align='right'>{t('polymarket.size')}</TableCell>
                          <TableCell align='right'>{t('polymarket.price')}</TableCell>
                          <TableCell align='right'>{t('polymarket.date')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {marketTrades.map((trade) => {
                          const date = new Date(toEpochMs(trade.timestamp))
                          const dateStr = date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })
                          const timeStr = date.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })

                          return (
                            <TableRow key={trade.id} hover>
                              <TableCell>
                                <Chip
                                  label={trade.side}
                                  size='small'
                                  sx={{
                                    fontWeight: 600,
                                    bgcolor: alpha(
                                      trade.side === 'BUY'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                      0.1
                                    ),
                                    color:
                                      trade.side === 'BUY'
                                        ? theme.palette.success.dark
                                        : theme.palette.error.dark
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>{trade.outcome}</Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='body2' fontWeight={600}>
                                  {fNumber(trade.size)}
                                </Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='body2'>
                                  {Math.round(trade.price * 100)}¢
                                </Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Stack alignItems='flex-end'>
                                  <Typography variant='caption' fontWeight={600}>
                                    {dateStr}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {timeStr}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </Stack>
            </Box>
          </Stack>
        </Container>

        <Popover
          open={Boolean(partialSellAnchor)}
          anchorEl={partialSellAnchor}
          onClose={() => {
            setPartialSellAnchor(null)
            setPartialSellPos(null)
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Stack sx={{ p: 2, width: 220 }} spacing={1.5}>
            <Typography variant='subtitle2'>{t('polymarket.partial-sell')}</Typography>
            <TextField
              label={t('polymarket.amount')}
              type='number'
              size='small'
              value={partialSellAmount}
              onChange={(e) => setPartialSellAmount(e.target.value)}
              inputProps={{ min: 0.000001, max: partialSellPos?.size, step: 0.01 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Typography variant='caption' color='text.secondary'>
                      / {partialSellPos ? Math.floor(partialSellPos.size * 1e6) / 1e6 : 0}
                    </Typography>
                  </InputAdornment>
                )
              }}
              helperText={
                partialSellAmount && Number(partialSellAmount) > 0 && partialSellPos
                  ? `≈ $${(Number(partialSellAmount) * (partialSellPos.current_price ?? (partialSellPos as any).curPrice ?? 0)).toFixed(2)}`
                  : ' '
              }
            />
            <Button
              fullWidth
              size='small'
              color='error'
              variant='contained'
              disabled={
                !partialSellAmount ||
                Number(partialSellAmount) <= 0 ||
                Number(partialSellAmount) > (partialSellPos?.size ?? 0)
              }
              onClick={handlePartialSell}
            >
              {t('polymarket.sell-x-shares', { amount: partialSellAmount })}
            </Button>
          </Stack>
        </Popover>
      </Box>
    </>
  )
}
