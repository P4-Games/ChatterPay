'use client'

import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Grid from '@mui/material/Unstable_Grid2'
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'
import { useGetPolymarketMarket, polymarketAccountStatus } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'

import { fNumber } from 'src/utils/format-number'

import type { IPolymarketMarket, IPolymarketAccountStatus } from 'src/types/polymarket'

import PolymarketTradeModule from '../polymarket-trade-module'
import PolymarketAccountSetup from '../polymarket-account-setup'

// ----------------------------------------------------------------------

type Props = {
  slug: string
}

export default function PolymarketDetailView({ slug }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const router = useRouter()
  const settings = useSettingsContext()

  const { data, isLoading } = useGetPolymarketMarket(slug)
  const market: IPolymarketMarket | null = data?.data || null

  const [accountState, setAccountState] = useState<IPolymarketAccountStatus | null>(null)
  const [accountLoading, setAccountLoading] = useState(true)

  const fetchAccountStatus = useCallback(async () => {
    setAccountLoading(true)
    try {
      const result = await polymarketAccountStatus()
      if (result.ok && result.data) {
        setAccountState(result.data)
      }
    } catch {
      // Silently fail
    } finally {
      setAccountLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccountStatus()
  }, [fetchAccountStatus])

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Skeleton variant='rounded' height={60} />
          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Skeleton variant='rounded' height={400} />
            </Grid>
            <Grid xs={12} md={4}>
              <Skeleton variant='rounded' height={400} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    )
  }

  if (!market) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
          <Typography variant='h6' color='text.secondary'>
            {t('polymarket.market-not-found')}
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
    )
  }

  const yesPrice = Number(market.outcome_prices?.[0] || 0)
  const noPrice = Number(market.outcome_prices?.[1] || 0)
  const yesPercent = Math.round(yesPrice * 100)
  const noPercent = Math.round(noPrice * 100)

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {/* Back button + title */}
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton onClick={() => router.push(paths.dashboard.polymarket.root)}>
            <Iconify icon='eva:arrow-back-fill' />
          </IconButton>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            {t('polymarket.market-detail')}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Left: Market Info */}
          <Grid xs={12} md={8}>
            <Stack spacing={3}>
              {/* Hero Card */}
              <Card sx={{ overflow: 'hidden' }}>
                {market.image && (
                  <Box
                    component='img'
                    src={market.image}
                    alt={market.question}
                    sx={{
                      width: '100%',
                      height: { xs: 180, md: 260 },
                      objectFit: 'cover'
                    }}
                  />
                )}
                <Stack spacing={2.5} sx={{ p: 3 }}>
                  {market.category && (
                    <Chip
                      label={market.category}
                      size='small'
                      sx={{
                        alignSelf: 'flex-start',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.dark,
                        fontWeight: 600
                      }}
                    />
                  )}
                  <Typography variant='h4' sx={{ fontWeight: 800 }}>
                    {market.question}
                  </Typography>
                  {market.description && (
                    <Typography variant='body2' color='text.secondary'>
                      {market.description}
                    </Typography>
                  )}
                </Stack>
              </Card>

              {/* Price Bars */}
              <Card sx={{ p: 3 }}>
                <Typography variant='subtitle1' sx={{ mb: 2.5, fontWeight: 700 }}>
                  {t('polymarket.current-prices')}
                </Typography>

                <Stack spacing={2.5}>
                  {/* Yes */}
                  <Box>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mb: 1 }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: theme.palette.success.main
                          }}
                        />
                        <Typography variant='subtitle2'>
                          {market.outcomes?.[0] || 'Yes'}
                        </Typography>
                      </Stack>
                      <Typography variant='h5' fontWeight={800} color='success.main'>
                        {yesPercent}¢
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant='determinate'
                      value={yesPercent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.success.main, 0.12),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: theme.palette.success.main
                        }
                      }}
                    />
                  </Box>

                  {/* No */}
                  <Box>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mb: 1 }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: theme.palette.error.main
                          }}
                        />
                        <Typography variant='subtitle2'>
                          {market.outcomes?.[1] || 'No'}
                        </Typography>
                      </Stack>
                      <Typography variant='h5' fontWeight={800} color='error.main'>
                        {noPercent}¢
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant='determinate'
                      value={noPercent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.error.main, 0.12),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: theme.palette.error.main
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Card>

              {/* Stats */}
              <Card sx={{ p: 3 }}>
                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 700 }}>
                  {t('polymarket.market-stats')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('polymarket.volume')}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        ${fNumber(market.volume)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('polymarket.volume-24h')}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        ${fNumber(market.volume_24hr)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('polymarket.liquidity')}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        ${fNumber(market.liquidity)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        {t('polymarket.end-date')}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {market.end_date_iso
                          ? new Date(market.end_date_iso).toLocaleDateString()
                          : '—'}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </Stack>
          </Grid>

          {/* Right: Trade Module */}
          <Grid xs={12} md={4}>
            <Stack spacing={3}>
              {!accountLoading && (
                <PolymarketAccountSetup
                  accountStatus={accountState}
                  onAccountUpdated={fetchAccountStatus}
                />
              )}
              <PolymarketTradeModule market={market} accountStatus={accountState} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}
