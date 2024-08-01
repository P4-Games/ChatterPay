'use client'

import { useState, useEffect } from 'react'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'

import { useTranslate } from 'src/locales'
import { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletBalance, useGetWalletTransactions } from 'src/app/api/_hooks'

import { useSettingsContext } from 'src/components/settings'

import { IBalances, ITransaction } from 'src/types/wallet'

import BankingBalances from '../banking-balances'
import BankingRecentTransitions from '../banking-recent-transitions'

// ----------------------------------------------------------------------

export default function OverviewBankingView() {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()

  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

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
              isLoadingBalances ? { balances: [], totals: { usd: 0, ars: 0, brl: 0 } } : balances
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
