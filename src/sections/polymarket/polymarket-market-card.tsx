'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
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

import { isMarketResolvedYes } from './polymarket-market-sort'

import type { IPolymarketMarket } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  market: IPolymarketMarket
  compact?: boolean
  inlineImage?: boolean
  /**
   * Replaces the market's own image (e.g. a team flag on sports events, where
   * market images are generic placeholders).
   */
  imageOverride?: string
}

export default function PolymarketMarketCard({
  market,
  compact = false,
  inlineImage = false,
  imageOverride
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const router = useRouter()

  const displayTitle = market.group_item_title || market.question
  const displayImage = imageOverride || market.image
  const yesPrice = Number(market.outcome_prices?.[0] || 0)
  const noPrice = Number(market.outcome_prices?.[1] || 0)
  const yesPercent = Math.round(yesPrice * 100)
  const noPercent = Math.round(noPrice * 100)
  const spreadPercent = 100 - yesPercent - noPercent
  const resolvedYes = isMarketResolvedYes(market)

  const handleClick = () => {
    router.push(paths.dashboard.polymarket.detail(market.slug))
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
          {displayImage && (
            <Box
              component='img'
              src={displayImage}
              alt={displayTitle}
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
              {displayTitle}
            </Typography>
          </Stack>
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
      {/* Image — hero banner (default) or hidden (inlineImage mode) */}
      {!inlineImage && displayImage && (
        <Box
          component='img'
          src={displayImage}
          alt={displayTitle}
          sx={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            bgcolor: 'grey.200',
            flexShrink: 0
          }}
        />
      )}

      <Stack spacing={2} sx={{ p: 2.5, flex: 1, justifyContent: 'space-between' }}>
        {/* Category — hide in inline mode (redundant on event detail) */}
        {!inlineImage && market.category && (
          <Chip
            label={market.category}
            size='small'
            sx={{
              alignSelf: 'flex-start',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.dark,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24
            }}
          />
        )}

        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          spacing={inlineImage ? 1.5 : 2}
        >
          {inlineImage && displayImage && (
            <Box
              component='img'
              src={displayImage}
              alt={displayTitle}
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
              minHeight: inlineImage ? 'auto' : 48,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
              minWidth: 0,
              whiteSpace: 'normal',
              ...(inlineImage && { lineHeight: 1.3, fontSize: '0.95rem' })
            }}
          >
            {displayTitle}
          </Typography>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            style={{ color: theme.palette.text.secondary, flexShrink: 0 }}
          />
        </Stack>

        {/* Resolved badge (closed market) or Yes / No bars (live market) */}
        {market.closed ? (
          <Stack
            direction='row'
            alignItems='center'
            spacing={1}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: alpha(
                resolvedYes ? theme.palette.success.main : theme.palette.error.main,
                0.08
              )
            }}
          >
            <Iconify
              icon={resolvedYes ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
              width={18}
              sx={{ color: resolvedYes ? 'success.main' : 'error.main' }}
            />
            <Typography
              variant='subtitle2'
              fontWeight={700}
              sx={{ color: resolvedYes ? 'success.main' : 'error.main' }}
            >
              {resolvedYes ? t('common.yes') : t('common.no')}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={0.75}>
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Typography variant='caption' fontWeight={700} color='success.main'>
                {t('common.yes')} {yesPercent}%
              </Typography>
              <Typography variant='caption' fontWeight={700} color='error.main'>
                {noPercent}% {t('common.no')}
              </Typography>
            </Stack>
            {/* Unified Yes / spread / No bar with slash-angled dividers */}
            <Box
              sx={{
                display: 'flex',
                height: 18,
                borderRadius: '5px',
                overflow: 'hidden',
                gap: '3px'
              }}
            >
              <Box
                sx={{
                  width: `${yesPercent}%`,
                  flexShrink: 0,
                  ml: '-8px',
                  bgcolor: alpha(theme.palette.success.main, 0.85),
                  transform: 'skewX(-16deg)',
                  boxShadow: `inset 0 2px 3px ${alpha(theme.palette.common.white, 0.25)}, inset 0 -2px 3px ${alpha(theme.palette.common.black, 0.15)}`
                }}
              />
              {spreadPercent > 0 && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    bgcolor: alpha(theme.palette.grey[500], 0.24),
                    transform: 'skewX(-16deg)',
                    boxShadow: `inset 0 2px 3px ${alpha(theme.palette.common.black, 0.08)}`
                  }}
                />
              )}
              <Box
                sx={{
                  width: `${noPercent}%`,
                  flexShrink: 0,
                  mr: '-8px',
                  bgcolor: alpha(theme.palette.error.main, 0.85),
                  transform: 'skewX(-16deg)',
                  boxShadow: `inset 0 2px 3px ${alpha(theme.palette.common.white, 0.25)}, inset 0 -2px 3px ${alpha(theme.palette.common.black, 0.15)}`,
                  ...(spreadPercent <= 0 && { ml: 'auto' })
                }}
              />
            </Box>
          </Stack>
        )}

        {/* Volume & End Date */}
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ pt: 0.5, mt: 'auto' }}
        >
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Iconify icon='solar:graph-up-bold' width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary'>
              ${fNumber(market.volume)}
            </Typography>
          </Stack>
          {market.end_date_iso && (
            <Typography variant='caption' color='text.secondary'>
              {t('polymarket.ends')} {new Date(market.end_date_iso).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
