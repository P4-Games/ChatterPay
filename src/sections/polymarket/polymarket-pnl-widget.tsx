'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useState, useEffect } from 'react'
import { polymarketGetPortfolio } from 'src/app/api/hooks'
import { fNumber } from 'src/utils/format-number'
import type { IPolymarketPortfolio } from 'src/types/polymarket'

// ----------------------------------------------------------------------

export default function PolymarketPNLWidget() {
  const { t } = useTranslate()
  const theme = useTheme()

  const [portfolio, setPortfolio] = useState<IPolymarketPortfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioRes = await polymarketGetPortfolio()
        if (portfolioRes.ok && portfolioRes.data) {
          setPortfolio(portfolioRes.data)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const pnl = portfolio?.total_pnl || 0
  const isPositive = pnl >= 0

  return (
    <Card
      sx={{
        p: 3,
        width: { xs: '100%', md: 360 },
        height: 157,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.customShadows.card
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Profit/Loss
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

      <Box sx={{ position: 'relative', flexGrow: 1, mt: 2 }}>
        {isLoading ? (
          <CircularProgress size={24} sx={{ position: 'absolute', top: 0, left: 0 }} />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontFamily: "'Armin Grotesk', sans-serif"
            }}
          >
            {isPositive ? '+' : ''}${fNumber(Math.abs(pnl))} USD
          </Typography>
        )}
        
        {/* Placeholder for the chart wave from Figma */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -24, // Adjust based on Card padding
            left: -24,
            width: 'calc(100% + 48px)',
            height: 76,
            backgroundImage: 'url(/assets/icons/polymarket/pnl-wave.svg)', // Assuming an SVG or similar background, adjust as needed or use a small recharts component
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            opacity: 0.5,
            pointerEvents: 'none'
          }}
        />
      </Box>
    </Card>
  )
}
