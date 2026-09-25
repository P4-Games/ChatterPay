'use client'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import StakingConsent from './staking-consent'
import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit } from './staking-amount'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  submitting?: boolean
  onJoin: () => void
  onLeave: () => void
}

/** States in which the position is being unwound and nothing else may be started. */
const LEAVING_STATES = ['exit_pending', 'exit_submitted']

// ----------------------------------------------------------------------

/**
 * Where this wallet stands with staking, and the one control that changes it.
 *
 * Every case is a title and a line: what the position is now, and what follows from it. The card
 * carries at most one control, because each of these states has at most one thing the user can do
 * about it — and a state with nothing to do is still worth a sentence, since otherwise the actions
 * below read as arbitrarily disabled.
 *
 * Two enrolment flows exist and the deployment decides which, so this component chooses rather than
 * showing both. Where the terms must be accepted, joining is an act: the consent card collects it.
 * Where they need not be, enrolment is automatic and there is nothing to accept — a card offering to
 * start would offer a step that does not exist, and a user who did not press it would still be
 * enrolled.
 *
 * Leaving is offered on what is true of the position rather than on `optedIn`. That flag records
 * whether somebody once switched staking on, and a wallet enrolled automatically has it false while
 * being registered, delegated and earning; gating the control on it would leave exactly those users
 * with no way out. What it is gated on instead is a registration that exists, a signer that can
 * unwind it, and no exit already in flight.
 */
export default function StakingMembership({
  staking,
  submitting = false,
  onJoin,
  onLeave
}: Props): JSX.Element | null {
  const { t } = useTranslate()
  const { card, accent, theme } = useStakingStyles()

  /**
   * One state, rendered the same way every time.
   *
   * @param testId - What identifies this state on screen and in the tests.
   * @param title - The state.
   * @param body - What follows from it.
   * @param meta - The position's own figures, where there are any to show.
   * @param control - The one thing the user can do, where there is one.
   */
  const status = (
    testId: string,
    title: string,
    body: string,
    meta?: string,
    control?: JSX.Element
  ): JSX.Element => (
    <Card sx={card}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent='space-between'
      >
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant='subtitle2' data-testid={testId}>
            {title}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {body}
          </Typography>
          {meta !== undefined && (
            <Typography variant='caption' sx={{ color: 'text.disabled', wordBreak: 'break-all' }}>
              {meta}
            </Typography>
          )}
        </Stack>
        {control}
      </Stack>
    </Card>
  )

  /**
   * A compact control for the card, in the dashboard's outlined geometry.
   *
   * @param testId - What identifies it.
   * @param label - Its label, on one line.
   * @param icon - Its start icon.
   * @param onClick - What it does.
   * @param color - Its colour. Destructive controls pass the error colour.
   */
  const control = (
    testId: string,
    label: string,
    icon: string,
    onClick: () => void,
    color: string
  ): JSX.Element => (
    <Button
      variant='outlined'
      size='small'
      onClick={onClick}
      disabled={submitting}
      startIcon={<Iconify icon={icon} width={16} />}
      data-testid={testId}
      sx={{
        flexShrink: 0,
        px: 2,
        py: 0.75,
        whiteSpace: 'nowrap',
        color,
        borderColor: color,
        borderWidth: '0.5px',
        '&:hover': { borderColor: color, borderWidth: '0.5px' }
      }}
    >
      {label}
    </Button>
  )

  // A recorded opt-out outranks everything the system would otherwise do, including the pass that
  // enrols wallets automatically, so it is the state the card reports before any other.
  if (staking.optOut !== null) {
    return status(
      'staking-membership-opted-out',
      t('staking.notices.optedOutTitle'),
      t('staking.notices.optedOutBody', {
        date: new Date(staking.optOut.at).toLocaleDateString()
      }),
      undefined,
      control(
        'staking-membership-reactivate',
        t('staking.notices.optedOutRejoin'),
        'solar:play-circle-bold',
        onJoin,
        accent
      )
    )
  }

  if (LEAVING_STATES.includes(staking.state)) {
    return status(
      'staking-membership-leaving',
      t('staking.membership.leavingTitle'),
      t('staking.membership.leavingBody')
    )
  }

  const termsChanged =
    staking.termsVersion !== null && staking.termsVersion !== staking.currentTermsVersion

  if (staking.consentRequired && (!staking.optedIn || termsChanged)) {
    return <StakingConsent staking={staking} submitting={submitting} onAccept={onJoin} />
  }

  if (staking.registered) {
    const deposit =
      staking.balance.availability === 'unavailable'
        ? null
        : staking.balance.userOwnedRefundableDepositLovelace

    const pool = t('staking.membership.pool', {
      pool: staking.poolId ?? t('staking.position.poolNone')
    })
    const meta =
      deposit === null
        ? pool
        : `${pool} · ${t('staking.membership.deposit', { amount: formatAdaWithUnit(deposit) })}`

    // Read-only is a state of its own rather than an active position with a missing button: the
    // wallet was registered somewhere this deployment holds no keys for, and saying so is what
    // explains every refused action below.
    if (!staking.signable) {
      return status(
        'staking-membership-external',
        t('staking.notices.notSignableTitle'),
        t('staking.notices.notSignableBody'),
        meta
      )
    }

    // Offered on the position, not on the consent flag: a wallet enrolled automatically has no
    // consent on file and still has to be able to leave.
    return status(
      'staking-membership-active',
      t('staking.membership.activeTitle'),
      meta,
      undefined,
      control(
        'staking-membership-leave',
        t('staking.deactivate.confirm'),
        'solar:logout-2-bold',
        onLeave,
        theme.palette.error.main
      )
    )
  }

  const refusal = staking.actions.register_and_delegate ?? null

  if (refusal === null) {
    return status(
      'staking-membership-pending',
      t('staking.membership.pendingTitle'),
      t('staking.membership.pendingBody')
    )
  }

  if (refusal === 'not_eligible') {
    return status(
      'staking-membership-below-minimum',
      t('staking.membership.belowMinimumTitle'),
      t('staking.membership.belowMinimumBody', {
        minimum: formatAdaWithUnit(staking.minimumEnrolmentLovelace)
      })
    )
  }

  return status(
    'staking-membership-blocked',
    t('staking.membership.blockedTitle'),
    t(`staking.refusals.${refusal}`, { defaultValue: refusal })
  )
}
