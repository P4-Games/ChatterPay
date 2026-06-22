'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { fCurrency } from 'src/utils/format-number'
import { useTranslate } from 'src/locales'
import { POLYMARKET_REFRESH } from 'src/config-global'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetPolymarketEvents,
  useGetPolymarketEventsInfinite,
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR,
  polymarketAccountStatus
} from 'src/app/api/hooks'

import { useBoolean } from 'src/hooks/use-boolean'
import { useSettingsContext } from 'src/components/settings'

import type { IPolymarketEvent, IPolymarketAccountStatus } from 'src/types/polymarket'

import PolymarketMarketList from '../polymarket-market-list'
import PolymarketMarketCard from '../polymarket-market-card'
import PolymarketEventCard from '../polymarket-event-card'
import PolymarketPNLWidget from '../polymarket-pnl-widget'
import PolymarketTermsOverlay from '../polymarket-terms-overlay'
import Marquee from 'src/components/marquee'
import Iconify from 'src/components/iconify'
import DashboardDrawer from 'src/sections/banking/dashboard-drawer'
import DashboardPositionsTable from 'src/sections/banking/dashboard-positions-table'
import { PolymarketActivityProvider } from 'src/sections/banking/polymarket-activity-context'

// ----------------------------------------------------------------------

function PolymarketHubContent() {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user } = useAuthContext()

  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')

  const portfolioDrawer = useBoolean()
  const isDrawerOpen = portfolioDrawer.value

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
      // Silently fail — don't block the hub
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

  // Portfolio + positions — always fetched when logged in so the button value matches the drawer
  const { data: portfolio, isLoading: isPortfolioLoading } = useGetPolymarketPortfolioSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    !!user?.id
  )
  const { data: positions = [], isLoading: isPositionsLoading } = useGetPolymarketPositionsSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    !!user?.id
  )

  // Orders — lazy, only fetched while drawer is open
  const { data: orders = [], isLoading: isOrdersLoading } = useGetPolymarketOrdersSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    isDrawerOpen
  )

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

  // Events with infinite scroll
  const { events, isLoading, isLoadingMore, hasMore, loadMore } = useGetPolymarketEventsInfinite(
    category,
    user?.id
  )

  // Trending: separate fetch without category filter (first 4)
  const { data: trendingData } = useGetPolymarketEvents()
  const trendingEvents: IPolymarketEvent[] = Array.isArray(trendingData?.data)
    ? trendingData.data.slice(0, 4)
    : []

  // Show terms overlay if logged in + terms not accepted
  const showTermsOverlay =
    !statusLoading && !!user?.id && accountStatus && !accountStatus.account?.terms_accepted

  return (
    <>
      {showTermsOverlay && accountStatus?.terms && (
        <PolymarketTermsOverlay terms={accountStatus.terms} onAccepted={checkAccountStatus} />
      )}
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          minHeight: '100vh',
          bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
          backgroundImage: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
          pb: { xs: 10, md: 15 },
          mb: { xs: -10, md: -15 }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Container
            maxWidth={settings.themeStretch ? false : 'xl'}
            sx={{ pt: { xs: 15, md: 20 } }}
          >
            <Stack spacing={3}>
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
                      onClick={portfolioDrawer.onTrue}
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
                            {isValueLoading ? '—' : fCurrency(displayValue)}
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

              {/* Trending */}
              {trendingEvents.length > 0 && (
                <Box sx={{ pt: 4 }}>
                  <Typography
                    variant='body1'
                    sx={{
                      mb: 2,
                      color: 'text.primary',
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: '-0.16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Iconify icon='solar:fire-bold' width={22} sx={{ color: 'error.main' }} />
                    {t('polymarket.trending-today')}
                  </Typography>

                  <Box sx={{ py: 1.5 }}>
                    <Marquee speed={30} pauseOnHover>
                      {trendingEvents.map((event) => {
                        const isSingleMarket = !event.markets || event.markets.length <= 1
                        const topMarket = event.markets?.[0]
                        if (!topMarket) return null

                        return (
                          <Box key={event.id || event.slug} sx={{ width: 361, flexShrink: 0 }}>
                            {isSingleMarket ? (
                              <PolymarketMarketCard market={topMarket} compact />
                            ) : (
                              <PolymarketEventCard event={event} compact />
                            )}
                          </Box>
                        )
                      })}
                    </Marquee>
                  </Box>
                </Box>
              )}
            </Stack>
          </Container>
        </Box>

        {/* Market List */}
        <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ mt: 5 }}>
          <Typography variant='h5' sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            {t('polymarket.all-markets')}
          </Typography>

          <PolymarketMarketList
            events={events}
            trendingEvents={trendingEvents}
            isLoading={isLoading}
            category={category}
            onChangeCategory={setCategory}
            sortBy={sortBy}
            onChangeSortBy={setSortBy}
            hasMore={hasMore}
            isLoadingMore={!!isLoadingMore}
            onLoadMore={loadMore}
          />
        </Container>
      </Box>

      {/* Portfolio Drawer — same pattern as dashboard, opens on compact widget click */}
      <DashboardDrawer
        open={isDrawerOpen}
        onClose={portfolioDrawer.onFalse}
        title={t('polymarket.portfolio-title')}
        width='50vw'
      >
        <Stack spacing={3}>
          <PolymarketPNLWidget
            variant='expanded'
            portfolioData={portfolio ?? null}
            positions={positions}
            isLoadingExternal={isPortfolioLoading}
          />
          <DashboardPositionsTable
            positions={positions}
            orders={orders}
            isLoading={isPositionsLoading || isOrdersLoading}
          />
        </Stack>
      </DashboardDrawer>
    </>
  )
}

// ----------------------------------------------------------------------

export default function PolymarketHubView() {
  const { user } = useAuthContext()

  // Provide the optimistic-activity context the positions table relies on, so
  // selling/claiming from the portfolio drawer works here just like on /dashboard.
  return (
    <PolymarketActivityProvider wallet={user?.wallet ?? ''}>
      <PolymarketHubContent />
    </PolymarketActivityProvider>
  )
}
