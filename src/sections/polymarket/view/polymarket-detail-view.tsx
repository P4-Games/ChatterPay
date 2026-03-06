'use client'

import { useState, useMemo } from 'react'
import { m } from 'framer-motion'

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
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Unstable_Grid2'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'
import { useResponsive } from 'src/hooks/use-responsive'
import { useGetPolymarketMarket, polymarketPlaceOrder, useGetWalletBalance } from 'src/app/api/hooks'
import { useAuthContext } from 'src/auth/hooks'

import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'
import Chart, { useChart } from 'src/components/chart'

import { fNumber } from 'src/utils/format-number'

import type { IPolymarketMarket } from 'src/types/polymarket'
import type { IBalances } from 'src/types/wallet'
import type { AuthUserType } from 'src/auth/types'

// ----------------------------------------------------------------------

const PRESET_AMOUNTS = [10, 25, 50, 100]

const OUTCOME_COLORS = [
  '#1B1B1B', // Black
  '#2196F3', // Blue
  '#F44336', // Red
  '#FF9800', // Orange
  '#673AB7', // Purple
  '#9E9E9E', // Grey (Other)
]

function getOutcomeColor(index: number): string {
  return OUTCOME_COLORS[index % OUTCOME_COLORS.length]
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

// ── Framer Motion variants ──
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

// ----------------------------------------------------------------------

type Props = { slug: string }

export default function PolymarketDetailView({ slug }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const router = useRouter()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const mdUp = useResponsive('up', 'md')

  const { data, isLoading } = useGetPolymarketMarket(slug)
  const market: IPolymarketMarket | null = data?.data || null

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

  // Trade state
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0)
  const [amount, setAmount] = useState<number>(10)
  const [customAmount, setCustomAmount] = useState<string>('10')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const outcomes = market?.outcomes || ['Yes', 'No']
  const prices = (market?.outcome_prices || []).map(Number)
  const selectedPrice = prices[selectedOutcome] || 0
  const estimatedReturn = selectedPrice > 0 ? amount / selectedPrice : 0
  const estimatedProfit = estimatedReturn - amount
  const tokenId = market?.tokens?.[selectedOutcome]?.token_id || ''

  // Chart data (memoised on market id)
  const chartData = useMemo(
    () => (market ? generateMockPriceHistory(outcomes, prices) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [market?.condition_id]
  )

  const yMax = chartData?.yMax || 35

  const chartOptions = useChart({
    colors: outcomes.map((_, idx) => getOutcomeColor(idx)),
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.28,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: chartData?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.disabled, fontSize: '11px' } },
    },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: 4,
      labels: {
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { colors: theme.palette.text.disabled, fontSize: '11px' },
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: alpha(theme.palette.grey[500], 0.16),
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { theme: 'false' as const, y: { formatter: (val: number) => `${val.toFixed(1)}%` } },
    markers: { size: 0 },
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

  const handleSubmit = async () => {
    if (amount <= 0 || !tokenId) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await polymarketPlaceOrder({
        token_id: tokenId,
        side: 'BUY',
        size: amount,
        price: selectedPrice,
      })
      if (result.ok) {
        setSuccess(t('polymarket.order-placed'))
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
  if (isLoading) {
    return (
      <Box sx={{ mt: -13, mx: { xs: 0, lg: -2 }, flex: 1, background: 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)', minHeight: '100vh', pb: 10 }}>
        <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={60} />
            <Grid container spacing={3}>
              <Grid xs={12} md={5}><Skeleton variant="rounded" height={500} /></Grid>
              <Grid xs={12} md={7}><Skeleton variant="rounded" height={500} /></Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    )
  }

  // ── Not found ──
  if (!market) {
    return (
      <Box sx={{ mt: -13, mx: { xs: 0, lg: -2 }, flex: 1, background: 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)', minHeight: '100vh' }}>
        <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}>
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              {t('polymarket.market-not-found')}
            </Typography>
            <Button
              onClick={() => router.push(paths.dashboard.polymarket.root)}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              sx={{ mt: 2 }}
            >
              {t('polymarket.back-to-markets')}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDER SECTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ── Bet Module ──
  const renderBetModule = (
    <Stack
      spacing={3}
      component={m.div}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <Card
        component={m.div}
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, boxShadow: 'none', overflow: 'visible' }}
      >
        {/* WHO DO YOU THINK WINS? */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="overline"
            sx={{ mb: 2, display: 'block', color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}
          >
            WHO DO YOU THINK WINS?
          </Typography>

          <Stack spacing={0}>
            {outcomes.map((outcome, idx) => {
              const price = prices[idx] || 0
              const percent = Math.round(price * 100)
              const isSelected = selectedOutcome === idx
              const dotColor = getOutcomeColor(idx)

              return (
                <Box
                  key={outcome}
                  onClick={() => { setSelectedOutcome(idx); setError(null); setSuccess(null) }}
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
                    '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.06) },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{outcome}</Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.secondary">{percent}% chance</Typography>
                    {isSelected && (
                      <HugeiconsIcon icon={Tick02Icon} size={18} style={{ color: theme.palette.primary.main }} />
                    )}
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Box>

        <Divider />

        {/* HOW MUCH DO YOU WANT TO PREDICT? */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="overline"
            sx={{ mb: 2.5, display: 'block', color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}
          >
            HOW MUCH DO YOU WANT TO PREDICT?
          </Typography>

          {/* Preset pills */}
          <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
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
                      ? { bgcolor: '#1B1B1B', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#333', boxShadow: 'none' } }
                      : {
                          borderColor: alpha(theme.palette.grey[500], 0.24),
                          color: 'text.primary',
                          '&:hover': { borderColor: theme.palette.grey[400], bgcolor: alpha(theme.palette.grey[500], 0.08) },
                        }),
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
              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
              borderRadius: 1.5,
              px: 2,
              py: 1.25,
              maxWidth: { xs: '100%', md: 200 },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>$</Typography>
            <Box
              component="input"
              value={customAmount}
              onChange={handleCustomAmountChange}
              type="number"
              sx={{
                border: 'none',
                outline: 'none',
                bgcolor: 'transparent',
                fontSize: 15,
                fontWeight: 500,
                width: '100%',
                fontFamily: 'inherit',
                color: 'text.primary',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Available: ${fNumber(availableBalance)} ({balanceTokenSymbol})
          </Typography>
        </Box>

        {/* Return estimate */}
        {amount > 0 && selectedPrice > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 3, bgcolor: alpha('#1B9C85', 0.06) }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                If {outcomes[selectedOutcome]} wins...
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#173F35' }}>
                You get back ${fNumber(estimatedReturn)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                That&apos;s your ${fNumber(amount)} prediction + ${fNumber(estimatedProfit)} profit
              </Typography>
            </Box>
          </>
        )}
      </Card>

      {/* Alerts */}
      {error && <m.div variants={fadeInUp}><Alert severity="error">{error}</Alert></m.div>}
      {success && <m.div variants={fadeInUp}><Alert severity="success">{success}</Alert></m.div>}

      {/* CTA */}
      <Box component={m.div} variants={fadeInUp} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={amount <= 0 || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{
            py: 2,
            fontWeight: 700,
            fontSize: '1rem',
            borderRadius: 50,
            textTransform: 'none',
          }}
        >
          {isSubmitting
            ? 'Placing prediction...'
            : `Predict $${fNumber(amount)} on ${outcomes[selectedOutcome]}`}
        </Button>
      </Box>
    </Stack>
  )

  // ── Market Details (chart + odds + how-it-works) ──
  const renderMarketDetails = (
    <Card
      component={m.div}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, boxShadow: 'none' }}
    >
      {/* ODDS OVER TIME */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="overline"
          sx={{ mb: 2, display: 'block', color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}
        >
          ODDS OVER TIME (%)
        </Typography>

        {chartData && (
          <Chart type="area" series={chartData.series} options={chartOptions} height={220} />
        )}

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          {outcomes.map((outcome, idx) => (
            <Stack key={outcome} direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getOutcomeColor(idx), flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{outcome}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* CURRENT ODDS */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="overline"
          sx={{ mb: 2.5, display: 'block', color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}
        >
          CURRENT ODDS
        </Typography>

        <Stack spacing={2}>
          {outcomes.map((outcome, idx) => {
            const price = prices[idx] || 0
            const percent = Math.round(price * 100)
            const color = getOutcomeColor(idx)

            return (
              <Stack key={outcome} direction="row" alignItems="center" spacing={2}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: { xs: 60, md: 80 }, flexShrink: 0 }}>
                  {outcome}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.grey[500], 0.08),
                      '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: color },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 36, textAlign: 'right', flexShrink: 0 }}>
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
          variant="overline"
          sx={{ mb: 1.5, display: 'block', color: 'text.secondary', letterSpacing: 1.5, fontSize: '0.7rem' }}
        >
          HOW IT WORKS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Pick who you think will win. If you&apos;re right, you get your money back plus your
          winnings. If you&apos;re wrong, you lose your bet.
          {market.end_date_iso && (
            <>
              {' '}Market closes on{' '}
              {new Date(market.end_date_iso).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}.
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
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        flex: 1,
        minHeight: '100vh',
        bgcolor: '#B8F6C9',
        backgroundImage: `linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)`,
        pb: { xs: 5, md: 7.5 },
        mb: { xs: -5, md: -7.5 }, // Buffer to prevent any clipping from parent layout
      }}
    >
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{
          pt: { xs: 11, md: 12 },
          px: { xs: 2, md: 3 },
        }}
      >
          <Stack
            spacing={3}
            component={m.div}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* ── HEADER ── */}
            <Stack spacing={1.5} component={m.div} variants={fadeInUp} transition={{ duration: 0.4 }}>
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
                  '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
                }}
              >
                Back
              </Button>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                  {market.image && (
                    <Box
                      component="img"
                      src={market.image}
                      alt={market.question}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                        bgcolor: 'grey.200',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: '#173f35', fontSize: { xs: 20, md: 24 } }}
                  >
                    {market.question}
                  </Typography>
                  {market.category && (
                    <Chip
                      label={market.category}
                      size="small"
                      sx={{
                        bgcolor: alpha('#1B9C85', 0.12),
                        color: '#1B9C85',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        borderRadius: 0.75,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={3} sx={{ flexShrink: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vol: <strong>${fNumber(market.volume)}</strong>
                  </Typography>
                  {market.end_date_iso && (
                    <Typography variant="body2" color="text.secondary">
                      Ends:{' '}
                      <strong>
                        {new Date(market.end_date_iso).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
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
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Market Details
                </Typography>
                {renderMarketDetails}
              </Box>
            )}
          </Stack>
        </Container>
    </Box>
  )
}
