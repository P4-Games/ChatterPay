'use client'

import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetPolymarketEvents,
  useGetPolymarketEventsInfinite,
  polymarketAccountStatus
} from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'

import type { IPolymarketEvent, IPolymarketAccountStatus } from 'src/types/polymarket'

import PolymarketMarketList from '../polymarket-market-list'
import PolymarketMarketCard from '../polymarket-market-card'
import PolymarketEventCard from '../polymarket-event-card'
import PolymarketPNLWidget from '../polymarket-pnl-widget'
import PolymarketTermsOverlay from '../polymarket-terms-overlay'
import Marquee from 'src/components/marquee'

// ----------------------------------------------------------------------

export default function PolymarketHubView() {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user } = useAuthContext()

  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')

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

  // Events with infinite scroll
  const {
    events,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore
  } = useGetPolymarketEventsInfinite(category, user?.id)

  // Trending: separate fetch without category filter (first 4)
  const { data: trendingData } = useGetPolymarketEvents()
  const trendingEvents: IPolymarketEvent[] = Array.isArray(trendingData?.data)
    ? trendingData.data.slice(0, 4)
    : []

  // Show terms overlay if logged in + terms not accepted
  const showTermsOverlay = !statusLoading &&
    !!user?.id &&
    accountStatus &&
    !accountStatus.account?.terms_accepted

  return (
    <>
      {showTermsOverlay && accountStatus?.terms && (
        <PolymarketTermsOverlay
          terms={accountStatus.terms}
          onAccepted={checkAccountStatus}
        />
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
        mb: { xs: -10, md: -15 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 15, md: 20 } }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent='space-between'
              spacing={4}
            >
              <Box sx={{ maxWidth: 480 }}>
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
                  {t('polymarket.title')}
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
                  Make your predictions on Polymarket<br />just with WhatsApp!
                </Typography>
              </Box>

              <PolymarketPNLWidget />
            </Stack>

            {/* Trending */}
            {trendingEvents.length > 0 && (
              <Box sx={{ pt: 4 }}>
                <Typography
                  variant='body1'
                  sx={{
                    mb: 3,
                    color: 'text.primary',
                    fontSize: 16,
                    letterSpacing: '-0.16px',
                    fontFamily: "'Satoshi Variable', sans-serif"
                  }}
                >
                  Trending Today:
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
    </>
  )
}
