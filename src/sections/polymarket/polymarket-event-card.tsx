'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { m } from 'framer-motion'
import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { fNumber } from 'src/utils/format-number'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

import Iconify from 'src/components/iconify'

import type { IPolymarketEvent } from 'src/types/polymarket'

// ----------------------------------------------------------------------

const MAX_VISIBLE_MARKETS = 4

type Props = {
  event: IPolymarketEvent
  compact?: boolean
}

export default function PolymarketEventCard({ event, compact = false }: Props) {
  const theme = useTheme()
  const router = useRouter()

  const firstMarket = event.markets[0]
  const marketCount = event.markets.length
  const visibleMarkets = event.markets.slice(0, MAX_VISIBLE_MARKETS)
  const hiddenCount = marketCount - MAX_VISIBLE_MARKETS

  const totalVolume = event.markets.reduce((sum, m) => sum + (m.volume || 0), 0)

  const earliestEnd = event.markets
    .filter((m) => m.end_date_iso)
    .sort((a, b) => new Date(a.end_date_iso).getTime() - new Date(b.end_date_iso).getTime())[0]
    ?.end_date_iso

  const handleClick = () => {
    router.push(paths.dashboard.polymarket.event(event.id))
  }

  if (compact) {
    return (
      <Card
        component={m.div}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.1 }}
        onClick={handleClick}
        sx={{
          p: 2.5,
          cursor: 'pointer',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          '&:hover': {
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Stack direction='row' alignItems='center' spacing={2}>
          {firstMarket?.image && (
            <Box
              component='img'
              src={firstMarket.image}
              alt={event.title}
              sx={{
                width: 63,
                height: 49,
                borderRadius: 1.5,
                objectFit: 'cover',
                flexShrink: 0,
                bgcolor: 'grey.200'
              }}
            />
          )}
          <Stack flex={1} spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.2,
                whiteSpace: 'normal'
              }}
            >
              {event.title}
            </Typography>
            <Chip
              label={`${marketCount} markets`}
              size='small'
              sx={{
                alignSelf: 'flex-start',
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: alpha('#1B9C85', 0.12),
                color: '#1B9C85'
              }}
            />
          </Stack>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} style={{ color: theme.palette.text.secondary }} />
        </Stack>
      </Card>
    )
  }

  return (
    <Card
      component={m.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.1 }}
      onClick={handleClick}
      sx={{
        p: 0,
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        overflow: 'hidden',
        '&:hover': {
          boxShadow: theme.shadows[12]
        }
      }}
    >
      {/* Image */}
      {firstMarket?.image && (
        <Box
          component='img'
          src={firstMarket.image}
          alt={event.title}
          sx={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            bgcolor: 'grey.200'
          }}
        />
      )}

      <Stack spacing={2} sx={{ p: 2.5 }}>
        {/* Category + market count */}
        <Stack direction='row' alignItems='center' spacing={1}>
          {firstMarket?.category && (
            <Chip
              label={firstMarket.category}
              size='small'
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.dark,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24
              }}
            />
          )}
          <Chip
            label={`${marketCount} markets`}
            size='small'
            sx={{
              bgcolor: alpha('#1B9C85', 0.12),
              color: '#1B9C85',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24
            }}
          />
        </Stack>

        {/* Event title */}
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
          <Typography
            variant='subtitle1'
            sx={{
              fontWeight: 700,
              minHeight: 48,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
              minWidth: 0,
              whiteSpace: 'normal'
            }}
          >
            {event.title}
          </Typography>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
        </Stack>

        {/* Sub-market list */}
        <Stack spacing={0.75}>
          {visibleMarkets.map((market) => {
            const yesPrice = Number(market.outcome_prices?.[0] || 0)
            const yesPercent = Math.round(yesPrice * 100)

            return (
              <Stack
                key={market.condition_id || market.slug}
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                spacing={1}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.04)
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 500,
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {market.question}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.success.main,
                    flexShrink: 0
                  }}
                >
                  {yesPercent}%
                </Typography>
              </Stack>
            )
          })}

          {hiddenCount > 0 && (
            <Typography
              variant='caption'
              sx={{
                px: 1.5,
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              +{hiddenCount} more market{hiddenCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Stack>

        {/* Volume & End Date */}
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ pt: 0.5 }}>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Iconify icon='solar:graph-up-bold' width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary'>
              ${fNumber(totalVolume)}
            </Typography>
          </Stack>
          {earliestEnd && (
            <Typography variant='caption' color='text.secondary'>
              Ends {new Date(earliestEnd).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
