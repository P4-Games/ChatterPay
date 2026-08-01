'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import { useTheme } from '@mui/material/styles'

import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetChatterpointsSummary } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'

import type { ChatterpointsHistoryResult } from 'src/types/chatterpoints'

import ChatterpointsHero from '../chatterpoints-hero'
import ChatterpointsStats from '../chatterpoints-stats'
import ChatterpointsPrizes from '../chatterpoints-prizes'
import ChatterpointsActivity from '../chatterpoints-activity'

// ----------------------------------------------------------------------

const EMPTY_SUMMARY: ChatterpointsHistoryResult = {
  status: 'error',
  include: ['games', 'operations', 'social', 'prizes'],
  window: { from: '', to: '' },
  games: [],
  operations: [],
  social: [],
  prizes: [],
  totals: { games: 0, operations: 0, social: 0, grandTotal: 0 }
}

/**
 * Chatterpoints page: hero with grand total and category breakdown,
 * per-category tiles, activity ledger and cycle prizes. Shares the
 * gradient-bleed layout of the dashboard and polymarket pages.
 * @returns {JSX.Element} Chatterpoints view.
 */
export default function ChatterpointWidgetView() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  const {
    data: chatterpointsSummary,
    isLoading: isLoadingChatterpointSummary
  }: { data: ChatterpointsHistoryResult; isLoading: boolean } =
    useGetChatterpointsSummary(walletAddress)

  const loading = !walletAddress || isLoadingChatterpointSummary
  const summary: ChatterpointsHistoryResult = loading
    ? EMPTY_SUMMARY
    : (chatterpointsSummary ?? EMPTY_SUMMARY)

  return (
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
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 15, md: 20 } }}>
        <Stack spacing={4}>
          <ChatterpointsHero totals={summary.totals} loading={loading} />

          <ChatterpointsStats totals={summary.totals} loading={loading} />

          <Grid container spacing={3}>
            <Grid xs={12} md={7}>
              <ChatterpointsActivity summary={summary} loading={loading} />
            </Grid>
            <Grid xs={12} md={5}>
              <ChatterpointsPrizes prizes={summary.prizes ?? []} loading={loading} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
