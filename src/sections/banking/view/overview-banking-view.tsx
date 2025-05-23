'use client'

import { useState, useEffect } from 'react'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'

import { useTranslate } from 'src/locales'
import { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletBalance, useGetWalletTransactions } from 'src/app/api/hooks'

import { useSettingsContext } from 'src/components/settings'

import { IAccount } from 'src/types/account'
import { IBalances, ITransaction } from 'src/types/wallet'

import BankingBalances from '../banking-balances'
import BankingRecentTransitions from '../banking-recent-transitions'

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [contextUser, setContextUser] = useState<IAccount | null>(null)

  useEffect(() => {
    if (!user) return
    // @ts-ignore
    setContextUser(user)
  }, [user])

  useEffect(() => {
    if (contextUser && contextUser.wallet) {
      setWalletAddress(contextUser.wallet)
    }
  }, [contextUser])

  const { data: balances, isLoading: isLoadingBalances }: { data: IBalances; isLoading: boolean } =
    // 'none' => // avoid slow context-user load issues
    useGetWalletBalance(walletAddress || 'none')

  const {
    data: transactions,
    isLoading: isLoadingTrxs // 'none' => // avoid slow context-user load issues
  }: { data: ITransaction[]; isLoading: boolean } = useGetWalletTransactions(
    walletAddress || 'none'
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <BankingBalances
            title={t('balances.title')}
            tableData={
              isLoadingBalances
                ? { wallet: '', balances: [], totals: { usd: 0, ars: 0, brl: 0, uyu: 0 } }
                : balances
            }
          />
        </Grid>

        <Grid xs={12} md={12}>
          <Stack spacing={3}>
            <BankingRecentTransitions
              title={t('transactions.title')}
              isLoading={isLoadingTrxs}
              tableData={isLoadingTrxs ? [] : transactions}
              tableLabels={[
                { id: 'description', label: t('transactions.table-transaction') },
                { id: 'amount', label: t('transactions.table-amount') },
                { id: 'amount', label: t('transactions.table-type') },
                { id: 'date', label: t('transactions.table-date') },
                { id: 'status', label: t('transactions.table-status') },
                { id: '' }
              ]}
              userWallet={walletAddress || ''}
            />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}
