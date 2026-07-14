'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import Marquee from 'src/components/marquee'
import Iconify from 'src/components/iconify'

import PolymarketMarketCard from './polymarket-market-card'
import PolymarketEventCard from './polymarket-event-card'

import type { IPolymarketEvent } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  events: IPolymarketEvent[]
}

/**
 * "Trending today" strip: auto-scrolling marquee of compact market cards.
 * Renders nothing when there are no events.
 * @param {Props} props - Trending events to display.
 * @returns {JSX.Element | null} The trending section.
 */
export default function PolymarketTrendingMarquee({ events }: Props) {
  const { t } = useTranslate()

  if (!events.length) return null

  return (
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
          {events.map((event) => {
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
  )
}
