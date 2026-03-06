'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { fNumber, fPercent } from 'src/utils/format-number'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

import Iconify from 'src/components/iconify'

import type { IPolymarketMarket } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  market: IPolymarketMarket
  compact?: boolean
}

export default function PolymarketMarketCard({ market, compact = false }: Props) {
  const theme = useTheme()
  const router = useRouter()

  const yesPrice = Number(market.outcome_prices?.[0] || 0)
  const noPrice = Number(market.outcome_prices?.[1] || 0)
  const yesPercent = Math.round(yesPrice * 100)
  const noPercent = Math.round(noPrice * 100)

  const handleClick = () => {
    router.push(paths.dashboard.polymarket.detail(market.slug))
  }

  if (compact) {
    return (
      <Card
        onClick={handleClick}
        sx={{
          p: 2.5,
          cursor: 'pointer',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Stack direction='row' alignItems='center' spacing={2}>
          {market.image && (
            <Box
              component='img'
              src={market.image}
              alt={market.question}
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
              {market.question}
            </Typography>
          </Stack>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} style={{ color: theme.palette.text.secondary }} />
        </Stack>
      </Card>
    )
  }

  return (
    <Card
      onClick={handleClick}
      sx={{
        p: 0,
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[12]
        }
      }}
    >
      {/* Image */}
      {market.image && (
        <Box
          component='img'
          src={market.image}
          alt={market.question}
          sx={{
            width: '100%',
            height: 160,
            objectFit: 'cover',
            bgcolor: 'grey.200'
          }}
        />
      )}

      <Stack spacing={2} sx={{ p: 2.5 }}>
        {/* Category */}
        {market.category && (
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

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
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
            {market.question}
          </Typography>
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
        </Stack>

        {/* Yes / No bars */}
        <Stack spacing={1}>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack direction='row' alignItems='center' spacing={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main
                }}
              />
              <Typography variant='caption' fontWeight={600}>
                Yes
              </Typography>
            </Stack>
            <Typography variant='caption' fontWeight={700} color='success.main'>
              {yesPercent}¢
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={yesPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: theme.palette.success.main
              }
            }}
          />

          <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 0.5 }}>
            <Stack direction='row' alignItems='center' spacing={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.error.main
                }}
              />
              <Typography variant='caption' fontWeight={600}>
                No
              </Typography>
            </Stack>
            <Typography variant='caption' fontWeight={700} color='error.main'>
              {noPercent}¢
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={noPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: theme.palette.error.main
              }
            }}
          />
        </Stack>

        {/* Volume & End Date */}
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ pt: 0.5 }}>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Iconify icon='solar:graph-up-bold' width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary'>
              ${fNumber(market.volume)}
            </Typography>
          </Stack>
          {market.end_date_iso && (
            <Typography variant='caption' color='text.secondary'>
              Ends {new Date(market.end_date_iso).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
