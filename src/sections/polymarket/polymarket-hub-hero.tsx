'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { fNumber } from 'src/utils/format-number'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import Iconify from 'src/components/iconify'

import PolymarketPNLWidget from './polymarket-pnl-widget'

import type { IPolymarketPortfolio, IPolymarketPosition } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  portfolio: IPolymarketPortfolio | null
  positions: IPolymarketPosition[]
  isPortfolioLoading: boolean
  isPositionsLoading: boolean
  onOpenPortfolio: VoidFunction
}

/**
 * Hub hero: heading, portfolio-value trigger button (logged-in users) and the
 * compact P&L sparkline.
 * @param {Props} props - Portfolio data, loading flags and drawer opener.
 * @returns {JSX.Element} The hero row.
 */
export default function PolymarketHubHero({
  portfolio,
  positions,
  isPortfolioLoading,
  isPositionsLoading,
  onOpenPortfolio
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()

  // Mirror the PNL widget logic: use portfolio total, fall back to summing positions
  const displayValue = useMemo(() => {
    const fromPortfolio = portfolio?.total_value ?? portfolio?.totalValue ?? 0
    const fromPositions = positions.reduce(
      (sum, p) => sum + (p.currentValue ?? p.size * (p.current_price ?? p.curPrice ?? 0)),
      0
    )
    return fromPortfolio > 0 ? fromPortfolio : fromPositions
  }, [portfolio, positions])
  const isValueLoading = isPortfolioLoading || isPositionsLoading

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent='space-between'
      spacing={4}
    >
      {/* Left: heading + optional portfolio trigger button */}
      <Box sx={{ maxWidth: 480, width: '100%' }}>
        <Typography
          variant='h1'
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: 32, md: 36 },
            letterSpacing: '-0.36px'
          }}
        >
          {t('polymarket.making-predictions')}
        </Typography>
        <Typography
          variant='body1'
          sx={{
            color: 'text.primary',
            fontSize: 16,
            letterSpacing: '-0.16px',
            lineHeight: 1.5,
            mb: 3
          }}
        >
          {t('polymarket.just-with-whatsapp')}
        </Typography>

        {/* Portfolio trigger — prominent button in the free space below the heading */}
        {user?.id && (
          <Box
            onClick={onOpenPortfolio}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              cursor: 'pointer',
              bgcolor: 'background.paper',
              borderRadius: 2,
              px: 2.5,
              py: 2,
              boxShadow: theme.customShadows.card,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 300 },
              transition: 'all 0.18s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.customShadows.z20
              },
              '&:active': { transform: 'translateY(0)' }
            }}
          >
            <Stack direction='row' alignItems='center' spacing={2}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Iconify
                  icon='solar:wallet-bold-duotone'
                  width={24}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Box>
                <Typography
                  variant='caption'
                  sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}
                >
                  {t('polymarket.portfolio-title')}
                </Typography>
                <Typography variant='subtitle2' fontWeight={700}>
                  {isValueLoading ? '—' : `$${fNumber(displayValue) || '0.00'}`}
                </Typography>
              </Box>
            </Stack>
            <Iconify
              icon='eva:arrow-ios-forward-fill'
              width={20}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            />
          </Box>
        )}
      </Box>

      {/* Right: compact P&L sparkline (informational).
          Hidden on mobile to save vertical space — the same P&L is
          available expanded inside the portfolio drawer. */}
      <PolymarketPNLWidget
        sx={{ display: { xs: 'none', md: 'flex' } }}
        portfolioData={portfolio ?? null}
        positions={positions}
        isLoadingExternal={isPortfolioLoading}
      />
    </Stack>
  )
}
