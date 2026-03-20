'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useState, useEffect, useRef, useCallback } from 'react'
import { polymarketGetPortfolio } from 'src/app/api/hooks'
import { fNumber } from 'src/utils/format-number'
import type { IPolymarketPortfolio } from 'src/types/polymarket'

// ----------------------------------------------------------------------

// Animated SVG line chart
function PnlChart({ isPositive, animate }: { isPositive: boolean; animate: boolean }) {
  const theme = useTheme()
  const pathRef = useRef<SVGPathElement>(null)

  const color = isPositive ? theme.palette.success.main : theme.palette.error.main
  const fillColor = isPositive ? theme.palette.success.lighter : theme.palette.error.lighter

  // Generate smooth wave-like path
  const width = 400
  const height = 100
  const points = [
    { x: 0, y: 60 },
    { x: 30, y: 55 },
    { x: 60, y: 65 },
    { x: 90, y: 45 },
    { x: 120, y: 50 },
    { x: 150, y: 35 },
    { x: 180, y: 55 },
    { x: 210, y: 30 },
    { x: 240, y: 40 },
    { x: 270, y: 25 },
    { x: 300, y: 45 },
    { x: 330, y: 20 },
    { x: 360, y: 35 },
    { x: 400, y: 15 },
  ]

  // Build smooth cubic bezier path
  const buildPath = useCallback(() => {
    if (points.length < 2) return ''

    let d = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(i + 2, points.length - 1)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return d
  }, [])

  const linePath = buildPath()
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  useEffect(() => {
    const path = pathRef.current
    if (!path || !animate) return

    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`

    // Trigger animation
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.5s ease-in-out'
      path.style.strokeDashoffset = '0'
    })
  }, [animate])

  return (
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
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio='none'
        width='100%'
        height='100%'
        style={{ overflow: 'visible' }}
      >
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id='pnl-gradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} stopOpacity={0.2} />
            <stop offset='100%' stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill='url(#pnl-gradient)'
          style={{
            opacity: animate ? 1 : 0,
            transition: 'opacity 1s ease-in-out 0.5s'
          }}
        />

        {/* Animated line */}
        <path
          ref={pathRef}
          d={linePath}
          fill='none'
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </Box>
  )
}

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
  portfolioData?: IPolymarketPortfolio | null
  isLoadingExternal?: boolean
}

export default function PolymarketPNLWidget({ sx, portfolioData, isLoadingExternal }: Props = {}) {
  const { t } = useTranslate()
  const theme = useTheme()

  const [portfolio, setPortfolio] = useState<IPolymarketPortfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chartAnimate, setChartAnimate] = useState(false)

  // Use externally provided data if available, otherwise fetch internally
  useEffect(() => {
    if (portfolioData !== undefined) {
      setPortfolio(portfolioData)
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const portfolioRes = await polymarketGetPortfolio()
        if (portfolioRes.ok && portfolioRes.data) {
          // Backend wraps response in { portfolio: {...} }
          const raw = portfolioRes.data as any
          setPortfolio(raw.portfolio ?? raw)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [portfolioData])

  // Trigger chart animation after data loads
  useEffect(() => {
    const loading = isLoadingExternal ?? isLoading
    if (!loading) {
      const timer = setTimeout(() => setChartAnimate(true), 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isLoadingExternal, isLoading])

  const loading = isLoadingExternal ?? isLoading
  const totalValue = portfolio?.total_value ?? portfolio?.totalValue ?? 0
  const pnl = portfolio?.total_pnl ?? portfolio?.totalPnl ?? 0
  const isPositive = pnl >= 0
  const pnlPercent = totalValue > 0 ? (pnl / (totalValue - pnl)) * 100 : 0

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
        ...sx as any
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Profit / Loss
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: 50,
            bgcolor: theme.palette.grey[200],
          }}
        >
          {['1D', '1W', '1M', 'All'].map((tab) => (
            <Box
              key={tab}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 50,
                cursor: 'pointer',
                typography: 'caption',
                fontWeight: 600,
                ...(tab === 'All'
                  ? {
                      bgcolor: 'background.paper',
                      boxShadow: theme.customShadows.z1,
                    }
                  : {
                      color: 'text.secondary',
                    }),
              }}
            >
              {tab}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ position: 'relative', flexGrow: 1, mt: 1.5 }}>
        {loading ? (
          <CircularProgress size={24} sx={{ position: 'absolute', top: 0, left: 0 }} />
        ) : (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              ${fNumber(totalValue)}
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
              }}
            >
              {isPositive ? '+' : ''}{fNumber(Math.abs(pnlPercent))}%
            </Box>
          </Stack>
        )}

        {/* Animated chart */}
        <PnlChart isPositive={isPositive} animate={chartAnimate} />
      </Box>
    </Card>
  )
}
