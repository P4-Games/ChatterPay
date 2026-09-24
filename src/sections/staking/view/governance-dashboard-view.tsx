'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useAuthContext } from 'src/auth/hooks'
import { useTranslate } from 'src/locales'
import { useSettingsContext } from 'src/components/settings'
import {
  authorizeStakingAction,
  requestStakingAction,
  useGetWalletBalance,
  useGovernance,
  useStakingState
} from 'src/app/api/hooks'

import GovernanceDelegation from '../governance-delegation'
import StakingPinDialog from '../staking-pin-dialog'
import StakingTabs from '../staking-tabs'

import type { AuthUserType } from 'src/auth/types'

// ----------------------------------------------------------------------

/**
 * The governance page.
 *
 * It offers exactly one mutation — delegating the voting power to abstain — and it is here rather than
 * on the staking page because of what it unblocks. In Conway a credential that has never delegated its
 * vote cannot withdraw rewards at all, so this is the page a user is sent to when their rewards look
 * stuck, and the copy says so.
 *
 * Registering a DRep and casting votes directly are not offered. Those kinds exist in the backend so
 * the shape is settled and are refused while their flag is off; nothing here routes to them.
 */
export default function GovernanceDashboardView(): JSX.Element {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()

  const { data: balances } = useGetWalletBalance(user?.wallet)

  const cardanoAddress = useMemo<string | undefined>(
    () =>
      ((balances as { wallets?: string[] } | undefined)?.wallets ?? []).find(
        (address) => address.startsWith('addr1') || address.startsWith('addr_test1')
      ),
    [balances]
  )

  const { data, isLoading, error } = useStakingState(cardanoAddress)
  const { data: governance } = useGovernance(cardanoAddress)
  const staking = data?.staking

  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /**
   * Delegates the vote, authorising it with the PIN first.
   *
   * Same two-step shape as every other staking mutation: the PIN buys a grant that names this action,
   * and the request carries the grant rather than the PIN.
   */
  const delegate = async (pin: string): Promise<void> => {
    if (!cardanoAddress) return
    setBusy(true)
    setFailure(null)

    const authorised = await authorizeStakingAction(cardanoAddress, 'delegate_vote', pin, null)
    if (!authorised.ok) {
      setFailure(authorised.message)
      setBusy(false)
      return
    }

    const started = await requestStakingAction(cardanoAddress, 'delegate_vote', {
      pinGrant: String(authorised.data.grant ?? '')
    })
    if (!started.ok) {
      setFailure(started.message)
      setBusy(false)
      return
    }

    const txId = started.data.txId
    setNotice(
      typeof txId === 'string' && txId !== ''
        ? t('staking.actions.startedWithTx', { tx: `${txId.slice(0, 10)}…` })
        : t('staking.actions.started')
    )
    setAsking(false)
    setBusy(false)
  }

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems='center' sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      </Container>
    )
  }

  if (error || !staking) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Alert severity='info' sx={{ mt: 3 }}>
          {t('staking.unavailable')}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Typography variant='h4' sx={{ mb: 1 }}>
        {t('governance.title')}
      </Typography>
      <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
        {t('governance.description')}
      </Typography>

      <StakingTabs />

      {notice && (
        <Alert severity='success' sx={{ mb: 3 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <GovernanceDelegation
        staking={staking}
        governance={governance ?? null}
        submitting={busy}
        onDelegate={() => {
          setFailure(null)
          setAsking(true)
        }}
      />

      <StakingPinDialog
        open={asking}
        action='delegate_vote'
        submitting={busy}
        error={failure}
        onCancel={() => setAsking(false)}
        onConfirm={(pin) => void delegate(pin)}
      />
    </Container>
  )
}
