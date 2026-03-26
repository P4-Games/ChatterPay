'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

import { useState, useEffect, useMemo } from 'react'
import {
  polymarketGetPortfolio,
  polymarketGetPnlHistory,
  polymarketGetPositions,
  polymarketGetTrades
} from 'src/app/api/hooks'
import { fNumber } from 'src/utils/format-number'
import Chart, { useChart } from 'src/components/chart'
import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'
import type {
  IPolymarketPortfolio,
  IPolymarketPosition,
  IPolymarketPnlPoint,
  IPolymarketTrade
} from 'src/types/polymarket'

// ----------------------------------------------------------------------

const TIME_RANGES = ['1D', '1W', '1M', 'All'] as const
type TimeRange = (typeof TIME_RANGES)[number]

function filterByTimeRange(points: IPolymarketPnlPoint[], range: TimeRange): IPolymarketPnlPoint[] {
  if (range === 'All' || points.length === 0) return points

  const now = Date.now()
  const msMap: Record<string, number> = {
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000
  }
  const cutoff = now - (msMap[range] ?? 0)
  return points.filter((p) => new Date(p.timestamp).getTime() >= cutoff)
}

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
  portfolioData?: IPolymarketPortfolio | null
  positions?: IPolymarketPosition[]
  trades?: IPolymarketTrade[]
  isLoadingExternal?: boolean
  /** 'compact' = small sparkline card (hub page), 'expanded' = full stats + chart (drawer) */
  variant?: 'compact' | 'expanded'
}

export default function PolymarketPNLWidget({
  sx,
  portfolioData,
  positions,
  trades,
  isLoadingExternal,
  variant = 'compact'
}: Props = {}) {
  const { t } = useTranslate()
  const theme = useTheme()

  const [portfolio, setPortfolio] = useState<IPolymarketPortfolio | null>(null)
  const [internalPositions, setInternalPositions] = useState<IPolymarketPosition[]>([])
  const [internalTrades, setInternalTrades] = useState<IPolymarketTrade[]>([])
  const [pnlHistory, setPnlHistory] = useState<IPolymarketPnlPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('All')

  // Resolve: use prop if provided, otherwise use internally fetched
  const resolvedPositions = positions ?? internalPositions
  const resolvedTrades = trades ?? internalTrades

  // Use externally provided data if available, otherwise fetch internally
  useEffect(() => {
    if (portfolioData !== undefined) {
      setPortfolio(portfolioData)
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [portfolioRes, positionsRes, tradesRes] = await Promise.all([
          polymarketGetPortfolio(),
          !positions ? polymarketGetPositions() : Promise.resolve(null),
          !trades ? polymarketGetTrades() : Promise.resolve(null)
        ])
        if (portfolioRes.ok && portfolioRes.data) {
          const raw = portfolioRes.data as any
          setPortfolio(raw.portfolio ?? raw)
        }
        if (positionsRes?.ok && positionsRes.data) {
          const raw = positionsRes.data as any
          setInternalPositions(Array.isArray(raw) ? raw : (raw?.positions ?? []))
        }
        if (tradesRes?.ok && tradesRes.data) {
          const raw = tradesRes.data as any
          setInternalTrades(Array.isArray(raw) ? raw : (raw?.trades ?? []))
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [portfolioData, positions, trades])

  // Fetch PNL history for chart
  useEffect(() => {
    const fetchPnl = async () => {
      try {
        const res = await polymarketGetPnlHistory(100)
        if (res.ok && res.data) {
          const raw = res.data as any
          const points = Array.isArray(raw) ? raw : (raw?.points ?? raw?.history ?? [])
          setPnlHistory(points)
        }
      } catch {
        // Silently fail
      }
    }
    fetchPnl()
  }, [])

  const loading = isLoadingExternal ?? isLoading

  // Compute P&L from portfolio data, with positions fallback
  const portfolioPnl = portfolio?.total_pnl ?? portfolio?.totalPnl ?? 0
  const positionsPnl =
    resolvedPositions?.reduce((sum, p) => sum + (p.pnl ?? p.cashPnl ?? 0), 0) ?? 0
  const pnl = portfolioPnl !== 0 ? portfolioPnl : positionsPnl

  const portfolioValue = portfolio?.total_value ?? portfolio?.totalValue ?? 0
  const positionsValue =
    resolvedPositions?.reduce(
      (sum, p) => sum + (p.currentValue ?? p.size * (p.current_price ?? p.curPrice ?? 0)),
      0
    ) ?? 0
  const totalValue = portfolioValue > 0 ? portfolioValue : positionsValue

  // Total volume from ALL trades: sum(trade.size * trade.price)
  const totalVolume = resolvedTrades.reduce((sum, t) => sum + (t.size || 0) * (t.price || 0), 0)

  const isPositive = pnl >= 0
  const invested = totalValue - pnl
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0

  // Chart data filtered by time range
  const filteredHistory = useMemo(
    () => filterByTimeRange(pnlHistory, selectedRange),
    [pnlHistory, selectedRange]
  )

  const chartCategories = useMemo(
    () =>
      filteredHistory.map((p) => {
        const d = new Date(p.timestamp)
        return `${d.getMonth() + 1}/${d.getDate()}`
      }),
    [filteredHistory]
  )

  const chartSeries = useMemo(
    () => [
      { name: 'P&L', data: filteredHistory.map((p) => Number(p.cumulativePnl?.toFixed(2) ?? 0)) }
    ],
    [filteredHistory]
  )

  const hasChartData = filteredHistory.length > 1

  const chartColor = isPositive ? theme.palette.success.main : theme.palette.error.main

  const pnlDisplay =
    pnl === 0 ? '$0.00' : `${pnl > 0 ? '+' : '-'}$${fNumber(Math.abs(pnl)) || '0.00'}`

  // ──────────────────────────────────────────────────────────────────
  // COMPACT variant – small sparkline card with P&L overlay
  // ──────────────────────────────────────────────────────────────────
  const compactChartOptions = useChart({
    colors: [chartColor],
    chart: { toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: true } },
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.24,
        opacityTo: 0.02,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false }
    },
    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: {
      theme: 'false' as const,
      x: { show: true },
      y: { formatter: (val: number) => `$${val.toFixed(2)}` }
    },
    markers: { size: 0 }
  })

  if (variant === 'compact') {
    return (
      <Card
        sx={{
          p: 3,
          width: { xs: '100%', md: 360 },
          height: 220,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: theme.customShadows.card,
          overflow: 'hidden',
          ...(sx as any)
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {t('polymarket.profit-loss')}
          </Typography>

          <Stack
            direction='row'
            spacing={0.5}
            sx={{
              p: 0.5,
              borderRadius: 50,
              bgcolor: alpha(theme.palette.grey[500], 0.08)
            }}
          >
            {TIME_RANGES.map((tab) => (
              <Box
                key={tab}
                onClick={() => setSelectedRange(tab)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 50,
                  cursor: 'pointer',
                  typography: 'caption',
                  fontWeight: 600,
                  ...(tab === selectedRange
                    ? {
                        bgcolor: 'background.paper',
                        boxShadow: theme.customShadows.z1
                      }
                    : {
                        color: 'text.secondary'
                      })
                }}
              >
                {tab === 'All' ? t('polymarket.all') : tab}
              </Box>
            ))}
          </Stack>
        </Stack>

        <Box sx={{ position: 'relative', flexGrow: 1, mt: 1.5 }}>
          {loading ? (
            <CircularProgress size={24} sx={{ position: 'absolute', top: 0, left: 0 }} />
          ) : (
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 700,
                  color: isPositive ? 'success.main' : 'error.main'
                }}
              >
                {pnlDisplay}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.75,
                  bgcolor: alpha(
                    isPositive ? theme.palette.success.main : theme.palette.error.main,
                    0.12
                  ),
                  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                  typography: 'caption',
                  fontWeight: 700
                }}
              >
                {isPositive ? '+' : ''}
                {fNumber(Math.abs(pnlPercent)) || '0.00'}%
              </Box>
            </Stack>
          )}

          {/* Sparkline Chart */}
          {hasChartData && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -12,
                left: -24,
                width: 'calc(100% + 48px)',
                height: 100,
                pointerEvents: 'none'
              }}
            >
              <Chart type='area' series={chartSeries} options={compactChartOptions} height={100} />
            </Box>
          )}
        </Box>
      </Card>
    )
  }

  // ──────────────────────────────────────────────────────────────────
  // EXPANDED variant – full stats + chart (for the drawer)
  // ──────────────────────────────────────────────────────────────────
  const expandedChartOptions = useChart({
    colors: [chartColor],
    chart: { toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: false } },
    stroke: { width: 2.5, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.24,
        opacityTo: 0.02,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        show: true,
        style: {
          colors: theme.palette.text.disabled,
          fontSize: '10px'
        },
        rotate: 0,
        hideOverlappingLabels: true
      }
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: theme.palette.text.disabled,
          fontSize: '10px'
        },
        formatter: (val: number) => `$${val.toFixed(0)}`
      }
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: alpha(theme.palette.grey[500], 0.12),
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: false },
    tooltip: {
      theme: 'false' as const,
      x: { show: true },
      y: { formatter: (val: number) => `$${val.toFixed(2)}` }
    },
    markers: { size: 0 }
  })

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: '100%', ...(sx as any) }}
    >
      {/* Left: Stats Cards */}
      <Stack spacing={2} sx={{ minWidth: { md: 200 }, flexShrink: 0 }}>
        {/* Total Volume Card */}
        <Card
          sx={{
            p: 2.5,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            boxShadow: theme.customShadows.card
          }}
        >
          <Stack spacing={1}>
            <Stack direction='row' alignItems='center' spacing={0.75}>
              <Iconify
                icon='solar:chart-2-bold-duotone'
                width={18}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('polymarket.total-volume')}
              </Typography>
            </Stack>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant='h5' fontWeight={700}>
                ${fNumber(totalVolume)}
              </Typography>
            )}
          </Stack>
        </Card>

        {/* Portfolio Value Card */}
        <Card
          sx={{
            p: 2.5,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            boxShadow: theme.customShadows.card
          }}
        >
          <Stack spacing={1}>
            <Stack direction='row' alignItems='center' spacing={0.75}>
              <Iconify
                icon='solar:wallet-money-bold-duotone'
                width={18}
                sx={{ color: 'info.main' }}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('polymarket.portfolio-value')}
              </Typography>
            </Stack>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant='h5' fontWeight={700}>
                ${fNumber(totalValue)}
              </Typography>
            )}
          </Stack>
        </Card>

        {/* P&L Card */}
        <Card
          sx={{
            p: 2.5,
            border: `1px solid ${alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.04)} 0%, transparent 100%)`,
            boxShadow: theme.customShadows.card
          }}
        >
          <Stack spacing={1}>
            <Stack direction='row' alignItems='center' spacing={0.75}>
              <Iconify
                icon={isPositive ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
                width={18}
                sx={{ color: isPositive ? 'success.main' : 'error.main' }}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('polymarket.profit-loss')}
              </Typography>
            </Stack>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Stack spacing={0.25}>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 700,
                    color: isPositive ? 'success.main' : 'error.main'
                  }}
                >
                  {pnlDisplay}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.75,
                    bgcolor: alpha(
                      isPositive ? theme.palette.success.main : theme.palette.error.main,
                      0.12
                    ),
                    color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                    typography: 'caption',
                    fontWeight: 700,
                    width: 'fit-content'
                  }}
                >
                  {isPositive ? '+' : ''}
                  {fNumber(Math.abs(pnlPercent)) || '0.00'}%
                </Box>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Right: Chart */}
      <Card
        sx={{
          p: 3,
          flex: 1,
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: theme.customShadows.card,
          overflow: 'hidden'
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
            {t('polymarket.pnl-history')}
          </Typography>

          <Stack
            direction='row'
            spacing={0.5}
            sx={{
              p: 0.5,
              borderRadius: 50,
              bgcolor: alpha(theme.palette.grey[500], 0.08)
            }}
          >
            {TIME_RANGES.map((tab) => (
              <Box
                key={tab}
                onClick={() => setSelectedRange(tab)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 50,
                  cursor: 'pointer',
                  typography: 'caption',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  ...(tab === selectedRange
                    ? {
                        bgcolor: 'background.paper',
                        boxShadow: theme.customShadows.z1
                      }
                    : {
                        color: 'text.secondary'
                      })
                }}
              >
                {tab}
              </Box>
            ))}
          </Stack>
        </Stack>

        <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 180 }}>
          {loading ? (
            <Stack alignItems='center' justifyContent='center' sx={{ height: '100%' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : hasChartData ? (
            <Chart type='area' series={chartSeries} options={expandedChartOptions} height='100%' />
          ) : (
            <Stack alignItems='center' justifyContent='center' sx={{ height: '100%' }}>
              <Iconify
                icon='solar:graph-new-up-bold-duotone'
                width={48}
                sx={{ color: 'text.disabled', mb: 1.5 }}
              />
              <Typography variant='body2' color='text.secondary'>
                {t('polymarket.no-pnl-data')}
              </Typography>
            </Stack>
          )}
        </Box>
      </Card>
    </Stack>
  )
}
