'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useGetPolymarketMarkets, useGetPolymarketEvents } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'

import type { IPolymarketMarket, IPolymarketEvent } from 'src/types/polymarket'

import PolymarketSearch from '../polymarket-search'
import PolymarketMarketList from '../polymarket-market-list'
import PolymarketMarketCard from '../polymarket-market-card'
import PolymarketPNLWidget from '../polymarket-pnl-widget'
import Marquee from 'src/components/marquee'

// ----------------------------------------------------------------------

export default function PolymarketHubView() {
  const { t } = useTranslate()
  const theme = useTheme()
  const settings = useSettingsContext()

  const { data, isLoading } = useGetPolymarketMarkets()
  const markets: IPolymarketMarket[] = Array.isArray(data?.data) ? data.data : []

  const { data: eventsData } = useGetPolymarketEvents()
  const trendingEvents: IPolymarketEvent[] = Array.isArray(eventsData?.data) 
    ? eventsData.data.slice(0, 4) 
    : []

  return (
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        minHeight: '100vh',
        bgcolor: '#B8F6C9',
        backgroundImage: `linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)`,
        pb: 10,
        mb: -10, // Extend below to avoid any margin artifacts from layout
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
                    color: '#173f35',
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
                    color: '#173f35', 
                    fontSize: 16, 
                    letterSpacing: '-0.16px',
                    lineHeight: 1.5
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
                    color: '#173f35', 
                    fontSize: 16, 
                    letterSpacing: '-0.16px',
                    fontFamily: "'Satoshi Variable', sans-serif"
                  }}
                >
                  Trending Markets Today:
                </Typography>

                <Box sx={{ py: 1.5 }}>
                  <Marquee speed={30} pauseOnHover>
                    {trendingEvents.map((event) => {
                      const topMarket = event.markets?.[0]
                      if (!topMarket) return null
                      return (
                        <Box key={event.id || event.slug} sx={{ width: 361, flexShrink: 0 }}>
                          <PolymarketMarketCard
                            market={topMarket}
                            compact
                          />
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
        <Typography variant='h5' sx={{ mb: 3, fontWeight: 700, color: '#173f35' }}>
          {t('polymarket.all-markets')}
        </Typography>

        <PolymarketMarketList markets={markets} isLoading={isLoading} />
      </Container>
    </Box>
  )
}
