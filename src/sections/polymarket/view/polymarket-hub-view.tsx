'use client'

import { useState, useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslate } from 'src/locales'
import { POLYMARKET_REFRESH } from 'src/config-global'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetPolymarketEvents,
  useGetPolymarketEventsInfinite,
  useSearchPolymarkets,
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR
} from 'src/app/api/hooks'

import { useBoolean } from 'src/hooks/use-boolean'
import { useDebounce } from 'src/hooks/use-debounce'
import { useSettingsContext } from 'src/components/settings'

import type { IPolymarketEvent } from 'src/types/polymarket'

import PolymarketMarketList from '../polymarket-market-list'
import PolymarketHubHero from '../polymarket-hub-hero'
import PolymarketTrendingMarquee from '../polymarket-trending-marquee'
import PolymarketPNLWidget from '../polymarket-pnl-widget'
import PolymarketTermsOverlay from '../polymarket-terms-overlay'
import { usePolymarketAccountStatus } from '../use-polymarket-account-status'
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
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const trimmedSearchQuery = debouncedSearchQuery.trim()
  const isSearching = trimmedSearchQuery.length > 0

  const portfolioDrawer = useBoolean()
  const isDrawerOpen = portfolioDrawer.value

  const { accountStatus, showTermsOverlay, checkAccountStatus } = usePolymarketAccountStatus()

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

  // Events with infinite scroll
  const { events, isLoading, isLoadingMore, hasMore, loadMore } = useGetPolymarketEventsInfinite(
    category,
    user?.id
  )

  // Search — separate fetch, no pagination support server-side, so it fully
  // replaces the infinite-scroll list while active instead of augmenting it.
  const { data: searchResult, isLoading: isSearchLoading } =
    useSearchPolymarkets(trimmedSearchQuery)
  const searchEvents: IPolymarketEvent[] = useMemo(
    () => (searchResult?.ok && Array.isArray(searchResult.data) ? searchResult.data : []),
    [searchResult]
  )

  // Trending: separate fetch without category filter (first 4)
  const { data: trendingData } = useGetPolymarketEvents()
  const trendingEvents: IPolymarketEvent[] = Array.isArray(trendingData?.data)
    ? trendingData.data.slice(0, 4)
    : []

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
              <PolymarketHubHero
                portfolio={portfolio ?? null}
                positions={positions}
                isPortfolioLoading={isPortfolioLoading}
                isPositionsLoading={isPositionsLoading}
                onOpenPortfolio={portfolioDrawer.onTrue}
              />

              <PolymarketTrendingMarquee events={trendingEvents} />
            </Stack>
          </Container>
        </Box>

        {/* Market List */}
        <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ mt: 5 }}>
          <Typography variant='h5' sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            {t('polymarket.all-markets')}
          </Typography>

          <PolymarketMarketList
            events={isSearching ? searchEvents : events}
            isLoading={isSearching ? isSearchLoading : isLoading}
            category={category}
            onChangeCategory={setCategory}
            sortBy={sortBy}
            onChangeSortBy={setSortBy}
            searchQuery={searchQuery}
            onChangeSearchQuery={setSearchQuery}
            isSearching={isSearching}
            pagination={
              isSearching ? null : { hasMore, isLoadingMore: !!isLoadingMore, onLoadMore: loadMore }
            }
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
