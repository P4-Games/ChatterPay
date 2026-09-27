'use client'

import { useState } from 'react'

import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useTranslate } from 'src/locales'
import { fDateTime } from 'src/utils/format-time'
import { useSettingsContext } from 'src/components/settings'
import {
  authorizeStakingAction,
  requestStakingAction,
  setStakingConsent,
  useStakingState,
  type StakingActionName
} from 'src/app/api/hooks'

import StakingActions, { canStopStaking, StakingActionReasons } from '../staking-actions'
import StakingMembership from '../staking-membership'
import StakingPageShell from '../staking-page-shell'
import StakingDeactivateDialog from '../staking-deactivate-dialog'
import StakingHistory from '../staking-history'
import StakingNotices from '../staking-notices'
import StakingPinDialog from '../staking-pin-dialog'
import StakingRewards from '../staking-rewards'
import StakingRichText from '../staking-rich-text'
import { formatAdaWithUnit, isPositive } from '../staking-amount'
import { useCardanoAddress } from '../use-cardano-address'
import { useStakingMode } from '../use-staking-mode'
import { KeyValuePanel, MetricCard, NoticeCard, StakingModeToggle } from '../ui'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/** How much of a bech32 identifier is enough to recognise it. */
const ID_PREFIX = 12

/** The operations offered next to the position, in each layout. Stopping is added separately. */
const POSITION_ACTIONS: readonly StakingActionName[] = ['register_and_delegate']
const POSITION_ACTIONS_DETAILED: readonly StakingActionName[] = [
  'register_and_delegate',
  'redelegate_pool'
]

/** The operations offered next to the rewards. */
const REWARD_ACTIONS: readonly StakingActionName[] = ['withdraw_rewards']

/**
 * The chip colour for each state. Anything not listed is neutral, which is also what a state added
 * after this build gets.
 */
const STATE_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  exit_pending: 'warning',
  exit_submitted: 'warning',
  reconcile_required: 'warning',
  manual_review: 'error'
}

// ----------------------------------------------------------------------

/**
 * The staking page.
 *
 * Two layouts over the same data and the same flows. The summary answers the three questions most users
 * come with — how much ADA they hold, whether staking is on, what it has earned — and offers the routine
 * actions. The detailed layout adds every figure the backend reports and changing the pool.
 *
 * Only staking operations are offered here. Vote delegation lives on the governance tab.
 *
 * Every action runs in three steps: choose it, authorise it with the PIN, then send it. The middle step
 * is what makes the PIN specific to an operation: what comes back from it is a grant that names this
 * action, so it cannot be carried to another one, and the action request carries that grant rather than
 * the PIN.
 */
export default function StakingDashboardView(): JSX.Element {
  const { t } = useTranslate()
  const settings = useSettingsContext()
  const [mode, setMode] = useStakingMode()

  const { address: cardanoAddress, loading: addressLoading } = useCardanoAddress()
  const { data, isLoading, error } = useStakingState(cardanoAddress)
  const staking = data?.staking

  const [busy, setBusy] = useState<StakingActionName | null>(null)
  const [pending, setPending] = useState<StakingActionName | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Leaving is confirmed before it is recorded, because the consequence the user has to weigh is not
  // the one the button says: staking will not resume on its own afterwards.
  const [deactivating, setDeactivating] = useState(false)

  const reset = (): void => {
    setPending(null)
    setBusy(null)
  }

  /**
   * Authorises an action with the PIN, then sends it.
   *
   * A failure between the two calls leaves nothing started and costs the user one more PIN entry rather
   * than an operation they did not intend.
   */
  const run = async (action: StakingActionName, pin: string): Promise<void> => {
    if (!cardanoAddress) return
    setBusy(action)
    setFailure(null)

    const authorised = await authorizeStakingAction(cardanoAddress, action, pin)
    if (!authorised.ok) {
      setFailure(authorised.message)
      setBusy(null)
      return
    }

    const started = await requestStakingAction(cardanoAddress, action, {
      pinGrant: String(authorised.data.grant ?? '')
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

  if (addressLoading || isLoading) {
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

  const flows = {
    busy,
    onAction: (action: StakingActionName) => {
      setFailure(null)
      setPending(action)
    },
    onJoin: () => void changeConsent(true),
    onLeave: () => setDeactivating(true)
  }

  return (
    <StakingPageShell
      title={t('staking.title')}
      subtitle={t('staking.description')}
      action={<StakingModeToggle mode={mode} onChange={setMode} />}
    >
      {notice && (
        <Alert severity='success' onClose={() => setNotice(null)} sx={{ py: 0.5 }}>
          {notice}
        </Alert>
      )}

      <StakingNotices staking={staking} />

      {mode === 'simple' ? (
        <StakingSimpleView staking={staking} {...flows} />
      ) : (
        <StakingAdvancedView staking={staking} {...flows} />
      )}

      <StakingPinDialog
        open={pending !== null}
        action={pending}
        submitting={busy !== null}
        error={failure}
        onCancel={reset}
        onConfirm={(pin) => {
          if (pending) void run(pending, pin)
        }}
      />

      <StakingDeactivateDialog
        open={deactivating}
        submitting={busy !== null}
        // Absent when the balance could not be read: a warning about rewards that could not be read
        // would be inventing a figure.
        pendingRewardsLovelace={
          staking.balance.availability === 'unavailable'
            ? null
            : staking.balance.pendingRewardsLovelace
        }
        onCancel={() => setDeactivating(false)}
        onConfirm={() => {
          setDeactivating(false)
          // A registered wallet leaves by deregistering, which returns the deposit. A wallet that was
          // never registered has nothing to undo on chain, and switching the preference off is the
          // whole of leaving for it.
          if (staking.registered) {
            setFailure(null)
            setPending('deregister')
            return
          }
          void changeConsent(false)
        }}
      />
    </StakingPageShell>
  )
}

// ----------------------------------------------------------------------

type SectionProps = {
  staking: StakingView
  busy: StakingActionName | null
  onAction: (action: StakingActionName) => void
  onJoin: () => void
  onLeave: () => void
}

/**
 * An amount from the balance, or a dash when the balance could not be read.
 *
 * A dash rather than zero: zero is a statement about the wallet, and an unreadable balance says nothing
 * about it.
 */
const amountReader = (staking: StakingView) => {
  const { balance } = staking
  return (
    key:
      | 'totalAdaLovelace'
      | 'utxoLovelace'
      | 'userOwnedRefundableDepositLovelace'
      | 'withdrawableRewardsLovelace'
      | 'pendingRewardsLovelace'
  ): string => (balance.availability === 'unavailable' ? '—' : formatAdaWithUnit(balance[key]))
}

/**
 * The card that names a position the user cannot simply stop — opted out, leaving, awaiting consent,
 * not yet registered, or held by another signer — together with its one control.
 *
 * An ordinary active position has no such card: its stop control sits in the header of the card that
 * shows the position, and rendering both would offer the same decision twice.
 */
function StakingMembershipCard({
  staking,
  busy,
  onJoin,
  onLeave
}: SectionProps): JSX.Element | null {
  if (canStopStaking(staking)) return null
  return (
    <StakingMembership
      staking={staking}
      submitting={busy !== null}
      onJoin={onJoin}
      onLeave={onLeave}
    />
  )
}

/**
 * A compact group of controls for a card header, and the line in the card body that explains a refusal.
 *
 * @param props - The page's flows.
 * @param actions - The operations the card offers.
 * @param includeStop - Whether the card also offers stopping staking.
 * @returns The header controls and the refusal line. Each renders nothing when it has nothing to show.
 */
function cardControls(
  { staking, busy, onAction, onLeave }: SectionProps,
  actions: readonly StakingActionName[],
  includeStop = false
): { header: JSX.Element; reasons: JSX.Element } {
  return {
    header: (
      <StakingActions
        compact
        staking={staking}
        actions={actions}
        includeStop={includeStop}
        busy={busy}
        onAction={onAction}
        onLeave={onLeave}
      />
    ),
    reasons: <StakingActionReasons staking={staking} actions={actions} />
  }
}

// ----------------------------------------------------------------------

function StakingSimpleView(props: SectionProps): JSX.Element {
  const { staking } = props
  const { t } = useTranslate()
  const amount = amountReader(staking)

  const active = staking.state === 'active'
  const pendingRewards =
    staking.balance.availability !== 'unavailable' &&
    isPositive(staking.balance.pendingRewardsLovelace)
  const hasDeposit =
    staking.balance.availability !== 'unavailable' &&
    isPositive(staking.balance.userOwnedRefundableDepositLovelace)

  const position = cardControls(props, POSITION_ACTIONS, true)
  const rewards = cardControls(props, REWARD_ACTIONS)

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {/* The total, deposit included: a transfer can send all of it, and the backend stops staking
              and recovers the deposit as part of that transfer. */}
          <MetricCard
            testId='staking-available'
            title={t('staking.cards.available.title')}
            value={amount('totalAdaLovelace')}
            description={
              hasDeposit
                ? t('staking.cards.available.description', {
                    deposit: amount('userOwnedRefundableDepositLovelace')
                  })
                : undefined
            }
            tooltip={t('staking.cards.available.hint')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            testId='staking-status'
            title={t('staking.cards.status.title')}
            value={t(`staking.state.${staking.state}`, { defaultValue: staking.state })}
            headerAction={position.header}
            description={
              active ? t('staking.cards.status.active') : t('staking.cards.status.inactive')
            }
            action={position.reasons}
            tooltip={t('staking.cards.status.hint')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            testId='staking-rewards'
            title={t('staking.cards.rewards.title')}
            value={amount('withdrawableRewardsLovelace')}
            headerAction={rewards.header}
            action={rewards.reasons}
            description={
              <StakingRichText
                text={
                  pendingRewards
                    ? t('staking.cards.rewards.pending', {
                        amount: amount('pendingRewardsLovelace')
                      })
                    : t('staking.cards.rewards.none')
                }
              />
            }
            tooltip={t('staking.cards.rewards.hint')}
          />
        </Grid>
      </Grid>

      <StakingMembershipCard {...props} />

      <NoticeCard
        title={t('staking.info.title')}
        body={<StakingRichText text={t('staking.info.body')} />}
      />

      <StakingHistory staking={staking} />
    </Stack>
  )
}

function StakingAdvancedView(props: SectionProps): JSX.Element {
  const { staking } = props
  const { t } = useTranslate()
  const amount = amountReader(staking)

  const delegation = staking.governanceDelegation
  const vote =
    delegation === null || delegation.kind === 'none'
      ? t('staking.position.voteNone')
      : t(`governance.current.${delegation.kind}`, {
          defaultValue: delegation.kind,
          drep: (delegation.idCip129 ?? '').slice(0, ID_PREFIX) || '—'
        })

  const origin = {
    chatterpay: t('staking.position.originChatterpay'),
    external: t('staking.position.originExternal'),
    unknown: t('staking.position.originUnknown')
  }[staking.registrationOrigin]

  const position = cardControls(props, POSITION_ACTIONS_DETAILED, true)
  const rewards = cardControls(props, REWARD_ACTIONS)

  return (
    <Stack spacing={2}>
      <StakingMembershipCard {...props} />

      {/* Two columns of rows: the position on the left, the amounts on the right. */}
      <KeyValuePanel
        testId='staking-details'
        title={t('staking.details.title')}
        columns={2}
        chip={
          <Chip
            size='small'
            variant='outlined'
            label={t(`staking.state.${staking.state}`, { defaultValue: staking.state })}
            color={STATE_COLORS[staking.state] ?? 'default'}
            sx={{ height: 24, fontSize: '0.75rem' }}
          />
        }
        headerAction={position.header}
        footer={position.reasons}
        rows={[
          {
            label: t('staking.position.pool'),
            value:
              staking.poolId === null
                ? t('staking.position.poolNone')
                : `${staking.poolId.slice(0, 10)}…${staking.poolId.slice(-6)}`,
            tooltip: t('staking.details.poolHint')
          },
          { label: t('staking.position.vote'), value: vote },
          { label: t('staking.position.origin'), value: origin },
          {
            label: t('staking.details.lastSync'),
            value: staking.lastSyncAt
              ? fDateTime(new Date(staking.lastSyncAt))
              : t('staking.summary.never')
          },
          {
            label: t('staking.summary.total'),
            value: amount('totalAdaLovelace'),
            tooltip: t('staking.cards.available.hint')
          },
          {
            label: t('staking.summary.deposit'),
            value: amount('userOwnedRefundableDepositLovelace'),
            tooltip: t('staking.summary.depositHint')
          },
          {
            label: t('staking.summary.rewards'),
            value: amount('withdrawableRewardsLovelace')
          },
          {
            label: t('staking.summary.pending'),
            value: amount('pendingRewardsLovelace'),
            tooltip: t('staking.summary.pendingHint')
          }
        ]}
      />

      <StakingRewards staking={staking} action={rewards.header} footer={rewards.reasons} />

      <StakingHistory staking={staking} />
    </Stack>
  )
}
