'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
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
import { useTranslate } from 'src/locales'

import { sortMarketOptions, isMarketResolvedYes } from './polymarket-market-sort'

import type { IPolymarketEvent } from 'src/types/polymarket'

// ----------------------------------------------------------------------

const MAX_VISIBLE_OPTIONS = 4

type Props = {
  event: IPolymarketEvent
  compact?: boolean
}

export default function PolymarketEventCard({ event, compact = false }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const router = useRouter()

  const firstMarket = event.markets[0]
  const optionCount = event.markets.length
  const sortedMarkets = sortMarketOptions(event.markets)
  const visibleOptions = sortedMarkets.slice(0, MAX_VISIBLE_OPTIONS)
  const hiddenCount = optionCount - MAX_VISIBLE_OPTIONS

  const totalVolume = event.markets.reduce((sum, m) => sum + (m.volume || 0), 0)

  const earliestEnd = event.markets
    .filter((m) => m.end_date_iso)
    .sort(
      (a, b) => new Date(a.end_date_iso).getTime() - new Date(b.end_date_iso).getTime()
    )[0]?.end_date_iso

  // Event-level image with fallback to first market image
  const eventImage = event.image || event.icon || firstMarket?.image || ''

  const handleClick = () => {
    router.push(paths.dashboard.polymarket.event(event.id))
  }

  /** Short label for a sub-market option */
  const getOptionLabel = (market: typeof firstMarket) => market.group_item_title || market.question

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
          {eventImage && (
            <Box
              component='img'
              src={eventImage}
              alt={event.title}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                objectFit: 'cover',
                flexShrink: 0,
                bgcolor: 'grey.200'
              }}
            />
          )}
          <Typography
            variant='subtitle2'
            sx={{
              flex: 1,
              minWidth: 0,
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
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            style={{ color: theme.palette.text.secondary }}
          />
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
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: theme.shadows[12]
        }
      }}
    >
      <Stack spacing={1.5} sx={{ p: 2.5, flex: 1, justifyContent: 'space-between' }}>
        {/* Header: inline image + title + arrow */}
        <Stack direction='row' alignItems='center' spacing={1.5}>
          {eventImage && (
            <Box
              component='img'
              src={eventImage}
              alt={event.title}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                objectFit: 'cover',
                flexShrink: 0,
                bgcolor: 'grey.200'
              }}
            />
          )}
          <Typography
            variant='subtitle1'
            sx={{
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
              minWidth: 0,
              whiteSpace: 'normal',
              lineHeight: 1.3,
              fontSize: '0.95rem'
            }}
          >
            {event.title}
          </Typography>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            style={{ color: theme.palette.text.secondary, flexShrink: 0 }}
          />
        </Stack>

        {/* Options list */}
        <Stack spacing={0.5}>
          {visibleOptions.map((market) => {
            const yesPrice = Number(market.outcome_prices?.[0] || 0)
            const yesPercent = Math.round(yesPrice * 100)
            const resolvedYes = isMarketResolvedYes(market)

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
                  {getOptionLabel(market)}
                </Typography>
                {market.closed ? (
                  <Stack direction='row' alignItems='center' spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Iconify
                      icon={resolvedYes ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                      width={14}
                      sx={{ color: resolvedYes ? 'success.main' : 'error.main' }}
                    />
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: resolvedYes ? 'success.main' : 'error.main'
                      }}
                    >
                      {resolvedYes ? t('common.yes') : t('common.no')}
                    </Typography>
                  </Stack>
                ) : (
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
                )}
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
              +{hiddenCount} {t('polymarket.more-options')}
            </Typography>
          )}
        </Stack>

        {/* Volume & End Date */}
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Iconify icon='solar:graph-up-bold' width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary'>
              ${fNumber(totalVolume)}
            </Typography>
          </Stack>
          {earliestEnd && (
            <Typography variant='caption' color='text.secondary'>
              {t('polymarket.ends')} {new Date(earliestEnd).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
