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
import { useStakingStyles } from '../staking-style'

import type { AuthUserType } from 'src/auth/types'
import type { GovernanceTarget } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/**
 * The governance page.
 *
 * It offers one mutation — delegating the voting power — with the three targets Cardano defines, and it
 * is here rather than on the staking page because of what it unblocks. In Conway a credential that has
 * never delegated its vote cannot withdraw rewards at all, so this is the page a user is sent to when
 * their rewards look stuck, and the copy says so.
 *
 * The target the user pressed is held in state for exactly as long as the PIN dialog is open, and it is
 * the same value that is authorised and then requested. That matters more than it looks: the PIN buys a
 * grant bound by signature to one target, so authorising with one target and requesting with another is
 * refused by the backend rather than quietly delegating somewhere the user did not choose. Holding it in
 * one place is what keeps the two calls describing the same decision.
 *
 * Registering a DRep and casting votes directly are not offered. Those kinds exist in the backend so
 * the shape is settled and are refused while their flag is off; nothing here routes to them.
 */
export default function GovernanceDashboardView(): JSX.Element {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { heading } = useStakingStyles()
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

  // The target the user pressed, held until the PIN dialog closes. `null` means no dialog is open, so
  // there is no state in which a PIN could be confirmed without a target to spend it on.
  const [asking, setAsking] = useState<GovernanceTarget | null>(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  /**
   * Delegates the vote to one target, authorising it with the PIN first.
   *
   * Same two-step shape as every other staking mutation: the PIN buys a grant that names this action,
   * and the request carries the grant rather than the PIN. The target is passed to both calls from the
   * same variable, because the grant is bound to it — a grant obtained for abstaining cannot be spent
   * on a representative, and the backend says so rather than delegating to either.
   *
   * @param target - Where the voting power goes.
   * @param pin - The user's PIN, sent once.
   */
  const delegate = async (target: GovernanceTarget, pin: string): Promise<void> => {
    if (!cardanoAddress) return
    setBusy(true)
    setFailure(null)

    const authorised = await authorizeStakingAction(
      cardanoAddress,
      'delegate_vote',
      pin,
      null,
      target
    )
    if (!authorised.ok) {
      setFailure(authorised.message)
      setBusy(false)
      return
    }

    const started = await requestStakingAction(cardanoAddress, 'delegate_vote', {
      pinGrant: String(authorised.data.grant ?? ''),
      governanceTarget: target
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
    setAsking(null)
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
      <Typography
        sx={{
          color: heading,
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 'normal',
          letterSpacing: '-0.24px'
        }}
      >
        {t('governance.title')}
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
        {t('governance.description')}
      </Typography>

      <StakingTabs />

      {notice && (
        <Alert severity='success' sx={{ mb: 2, py: 0.5 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <GovernanceDelegation
        staking={staking}
        governance={governance ?? null}
        submitting={busy}
        onDelegate={(target) => {
          setFailure(null)
          setAsking(target)
        }}
      />

      <StakingPinDialog
        open={asking !== null}
        action='delegate_vote'
        submitting={busy}
        error={failure}
        onCancel={() => setAsking(null)}
        onConfirm={(pin) => {
          // Guarded rather than asserted: the dialog only opens with a target, and a confirmation
          // without one must do nothing rather than send a delegation with no destination.
          if (asking !== null) void delegate(asking, pin)
        }}
      />
    </Container>
  )
}
