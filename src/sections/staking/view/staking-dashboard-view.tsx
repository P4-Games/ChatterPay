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
  setStakingConsent,
  useGetWalletBalance,
  useStakingExitQuote,
  useStakingState,
  type StakingActionName
} from 'src/app/api/hooks'

import StakingActions from '../staking-actions'
import StakingMembership from '../staking-membership'
import StakingTabs from '../staking-tabs'
import StakingDeactivateDialog from '../staking-deactivate-dialog'
import StakingExitDialog from '../staking-exit-dialog'
import StakingHistory from '../staking-history'
import StakingNotices from '../staking-notices'
import StakingPinDialog from '../staking-pin-dialog'
import StakingRewards from '../staking-rewards'
import StakingSummary from '../staking-summary'
import { useStakingStyles } from '../staking-style'

import type { AuthUserType } from 'src/auth/types'

// ----------------------------------------------------------------------

/**
 * The staking page.
 *
 * Three sections, in the order the questions come: what the user holds, where the position stands, and
 * what can be done about it. Everything below them is history.
 *
 * The flow the actions implement is deliberately three steps rather than one: choose an action,
 * authorise it with the PIN, then send it. The middle step is what makes the PIN specific to an
 * operation — what comes back from it is a grant that names this action, so it cannot be carried to
 * another one — and it is why the action request carries a grant rather than a PIN.
 *
 * The wallet is never chosen here. It is read from the balances the backend returns for the
 * authenticated user, which is the same place the dashboard finds it, so this page cannot be pointed
 * at somebody else's address.
 */
export default function StakingDashboardView(): JSX.Element {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const { heading } = useStakingStyles()
  const { user }: { user: AuthUserType } = useAuthContext()

  const { data: balances } = useGetWalletBalance(user?.wallet)

  // The same rule the dashboard uses: a Cardano address is one with a Cardano prefix. The backend
  // derives it from the user's identity, so it exists before they have ever touched the chain.
  const cardanoAddress = useMemo<string | undefined>(
    () =>
      ((balances as { wallets?: string[] } | undefined)?.wallets ?? []).find(
        (address) => address.startsWith('addr1') || address.startsWith('addr_test1')
      ),
    [balances]
  )

  const { data, isLoading, error } = useStakingState(cardanoAddress)
  const staking = data?.staking

  const [busy, setBusy] = useState<StakingActionName | null>(null)
  const [pending, setPending] = useState<StakingActionName | null>(null)
  // An exit collects a destination before it collects the PIN, so the two dialogs are stages of one
  // flow rather than alternatives: the address is part of what the PIN authorises.
  const [stage, setStage] = useState<'exit' | 'pin' | null>(null)
  const [recipient, setRecipient] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Leaving is confirmed before it is recorded, because the consequence the user has to weigh is
  // not the one the button says: staking will not resume on its own afterwards.
  const [deactivating, setDeactivating] = useState(false)

  // Follows the address as it is typed, and only asks once there is one worth quoting.
  const { data: quote, isLoading: quoteLoading } = useStakingExitQuote(cardanoAddress, recipient)

  const reset = (): void => {
    setPending(null)
    setStage(null)
    setRecipient(null)
    setBusy(null)
  }

  /**
   * Starts an action: authorise with the PIN, then send.
   *
   * The two calls are separate on the wire as well as on screen. Authorising returns a grant bound to
   * this action, and only a request carrying that grant is accepted — so a failure between the two
   * leaves nothing started and costs the user one more PIN entry rather than an operation they did not
   * intend.
   */
  const run = async (action: StakingActionName, pin: string, to: string | null): Promise<void> => {
    if (!cardanoAddress) return
    setBusy(action)
    setFailure(null)

    const authorised = await authorizeStakingAction(cardanoAddress, action, pin, to)
    if (!authorised.ok) {
      setFailure(authorised.message)
      setBusy(null)
      return
    }

    const started = await requestStakingAction(cardanoAddress, action, {
      pinGrant: String(authorised.data.grant ?? ''),
      recipientAddress: to
    })

    if (!started.ok) {
      setFailure(started.message)
      setBusy(null)
      return
    }

    const txId = started.data.txId
    setNotice(
      typeof txId === 'string' && txId !== ''
        ? t('staking.actions.startedWithTx', { tx: `${txId.slice(0, 10)}…` })
        : t('staking.actions.started')
    )
    reset()
  }

  const changeConsent = async (accept: boolean): Promise<void> => {
    if (!cardanoAddress) return
    setBusy('register_and_delegate')
    const result = await setStakingConsent(cardanoAddress, accept)
    if (!result.ok) setFailure(result.message)
    setBusy(null)
  }

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack alignItems='center' sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
            {t('staking.loading')}
          </Typography>
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
        {t('staking.title')}
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
        {t('staking.description')}
      </Typography>

      <StakingTabs />

      <Stack spacing={2}>
        {notice && (
          <Alert severity='success' onClose={() => setNotice(null)} sx={{ py: 0.5 }}>
            {notice}
          </Alert>
        )}

        <StakingNotices staking={staking} />

        <StakingSummary staking={staking} />

        <StakingMembership
          staking={staking}
          submitting={busy !== null}
          onJoin={() => changeConsent(true)}
          onLeave={() => setDeactivating(true)}
        />

        <StakingActions
          staking={staking}
          busy={busy}
          onAction={(action) => {
            setFailure(null)
            setPending(action)
            setStage(action === 'exit_and_send_max' ? 'exit' : 'pin')
          }}
        />

        <StakingRewards staking={staking} />

        <StakingHistory staking={staking} />
      </Stack>

      <StakingPinDialog
        open={stage === 'pin' && pending !== null}
        action={pending}
        submitting={busy !== null}
        error={failure}
        onCancel={reset}
        onConfirm={(pin) => {
          if (pending) void run(pending, pin, recipient)
        }}
      />

      <StakingExitDialog
        open={stage === 'exit'}
        // From the backend, which assembles and balances the real transaction to answer. Until it does
        // there is nothing to confirm, which is what the dialog's disabled state is for.
        quote={quote ?? null}
        quoteLoading={quoteLoading}
        submitting={busy !== null}
        error={failure}
        onCancel={reset}
        onRecipientChange={setRecipient}
        onConfirm={(to) => {
          setRecipient(to)
          setStage('pin')
        }}
      />

      <StakingDeactivateDialog
        open={deactivating}
        submitting={busy !== null}
        // Absent when the balance could not be read, and that is the right value to pass: a warning
        // about rewards we could not ask about would be inventing a figure.
        pendingRewardsLovelace={
          staking.balance.availability === 'unavailable'
            ? null
            : staking.balance.pendingRewardsLovelace
        }
        onCancel={() => setDeactivating(false)}
        onConfirm={() => {
          setDeactivating(false)
          void changeConsent(false)
        }}
      />
    </Container>
  )
}
