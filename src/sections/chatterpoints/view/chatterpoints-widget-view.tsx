'use client'

import { useState, useEffect } from 'react'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'

import { useTranslate } from 'src/locales'
import { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetChatterpointsSummary } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'

import { IAccount } from 'src/types/account'
import { ChatterpointsHistoryResult } from 'src/types/chatterpoints'

import ChatterpointWidget from '../chatterpoints-widget'

// ----------------------------------------------------------------------

export default function ChatterpointWidgetView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [contextUser] = useState<IAccount | null>(null)

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  useEffect(() => {
    if (contextUser && contextUser.wallet) {
      setWalletAddress(contextUser.wallet)
    }
  }, [contextUser])

  const {
    data: chatterpointsSummary,
    isLoading: isLoadingChatterpointSummary
  }: { data: ChatterpointsHistoryResult; isLoading: boolean } =
    useGetChatterpointsSummary(walletAddress)

  const safeChatterpointsSummary: ChatterpointsHistoryResult =
    !walletAddress || isLoadingChatterpointSummary
      ? {
          status: 'error',
          include: ['games', 'operations', 'social', 'prizes'],
          window: {
            from: '2025-08-30T02:01:47.237Z',
            to: '2025-09-29T02:01:47.237Z'
          },
          games: [],
          operations: [],
          social: [],
          prizes: [],
          totals: {
            games: 0,
            operations: 0,
            social: 0,
            grandTotal: 0
          }
        }
      : chatterpointsSummary

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <ChatterpointWidget title={t('balances.title')} tableData={safeChatterpointsSummary} />
        </Grid>
      </Grid>
    </Container>
  )
}
