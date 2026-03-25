'use client'

import { useState } from 'react'
import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { alpha, useTheme } from '@mui/material/styles'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'
import { useGetPolymarketEventsInfinite } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'

import { fNumber } from 'src/utils/format-number'

import PolymarketMarketCard from '../polymarket-market-card'

import type { IPolymarketEvent } from 'src/types/polymarket'

// ----------------------------------------------------------------------

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

// ----------------------------------------------------------------------

type Props = { eventId: string }

export default function PolymarketEventDetailView({ eventId }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const router = useRouter()
  const settings = useSettingsContext()
  const [aboutOpen, setAboutOpen] = useState(false)

  // Find the event from the cached events data
  const { events, isLoading } = useGetPolymarketEventsInfinite()
  const event: IPolymarketEvent | undefined = events.find((e) => e.id === eventId)

  const totalVolume = event?.markets.reduce((sum, m) => sum + (m.volume || 0), 0) || 0

  const earliestEnd = event?.markets
    .filter((m) => m.end_date_iso)
    .sort(
      (a, b) => new Date(a.end_date_iso).getTime() - new Date(b.end_date_iso).getTime()
    )[0]?.end_date_iso

  // Loading skeleton
  if (isLoading) {
    return (
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          flex: 1,
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          minHeight: '100vh',
          pb: 10
        }}
      >
        <Container
          maxWidth={settings.themeStretch ? false : 'xl'}
          sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
        >
          <Stack spacing={3}>
            <Skeleton variant='rounded' height={60} />
            <Skeleton variant='rounded' height={32} width={200} />
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant='rounded' height={340} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>
    )
  }

  // Not found
  if (!event) {
    return (
      <Box
        sx={{
          mt: -13,
          mx: { xs: 0, lg: -2 },
          flex: 1,
          background: isDark
            ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
            : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
          minHeight: '100vh'
        }}
      >
        <Container
          maxWidth={settings.themeStretch ? false : 'xl'}
          sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
        >
          <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
            <Typography variant='h6' color='text.secondary'>
              Event not found
            </Typography>
            <Button
              onClick={() => router.push(paths.dashboard.polymarket.root)}
              startIcon={<Iconify icon='eva:arrow-back-fill' />}
              sx={{ mt: 2 }}
            >
              {t('polymarket.back-to-markets')}
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        flex: 1,
        minHeight: '100vh',
        bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
          : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
        pb: { xs: 10, md: 15 },
        mb: { xs: -10, md: -15 }
      }}
    >
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
      >
        <Stack
          spacing={3}
          component={m.div}
          initial='initial'
          animate='animate'
          variants={staggerContainer}
        >
          {/* Header */}
          <Stack spacing={1.5} component={m.div} variants={fadeInUp} transition={{ duration: 0.4 }}>
            <Button
              onClick={() => router.push(paths.dashboard.polymarket.root)}
              startIcon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />}
              sx={{
                alignSelf: 'flex-start',
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.85rem',
                textTransform: 'none',
                px: 0,
                minWidth: 'auto',
                '&:hover': { bgcolor: 'transparent', color: 'text.primary' }
              }}
            >
              Back
            </Button>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent='space-between'
              spacing={2}
            >
              <Stack direction='row' alignItems='center' spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                {(event.image || event.icon || event.markets[0]?.image) && (
                  <Box
                    component='img'
                    src={event.image || event.icon || event.markets[0]?.image}
                    alt={event.title}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1.5,
                      objectFit: 'cover',
                      bgcolor: 'grey.200',
                      flexShrink: 0
                    }}
                  />
                )}
                <Typography
                  variant='h4'
                  sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: 22, md: 28 } }}
                >
                  {event.title}
                </Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={2} sx={{ flexShrink: 0 }}>
                <Typography variant='body2' color='text.secondary'>
                  Vol: <strong>${fNumber(totalVolume)}</strong>
                </Typography>
                {earliestEnd && (
                  <Typography variant='body2' color='text.secondary'>
                    Ends:{' '}
                    <strong>
                      {new Date(earliestEnd).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </strong>
                  </Typography>
                )}
                {event.description && (
                  <Button
                    size='small'
                    variant='outlined'
                    color='inherit'
                    startIcon={<HugeiconsIcon icon={InformationCircleIcon} size={16} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setAboutOpen(true)
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderColor: alpha(theme.palette.grey[500], 0.24),
                      borderRadius: 50,
                      px: 2
                    }}
                  >
                    About
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* About dialog */}
          {event.description && (
            <Dialog
              open={aboutOpen}
              onClose={() => setAboutOpen(false)}
              maxWidth='sm'
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <DialogTitle sx={{ fontWeight: 700 }}>About this event</DialogTitle>
              <DialogContent>
                <Typography variant='body2' sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {event.description}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                  onClick={() => setAboutOpen(false)}
                  variant='contained'
                  color='primary'
                  sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
                >
                  Got it
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Markets Grid */}
          <Box component={m.div} variants={fadeInUp} transition={{ duration: 0.4 }}>
            {(() => {
              const visibleMarkets = event.markets.filter((m) => {
                const hasVolume = (m.volume || 0) > 0
                const hasPrices = (m.outcome_prices || []).some((p) => Number(p) > 0)
                return hasVolume || hasPrices
              })

              return (
                <>
                  <Typography variant='h5' sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                    Predict on ({visibleMarkets.length})
                  </Typography>

                  <Grid container spacing={3}>
                    {visibleMarkets.map((market) => (
                      <Grid xs={12} sm={6} md={4} key={market.condition_id || market.slug}>
                        <PolymarketMarketCard market={market} inlineImage />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )
            })()}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
