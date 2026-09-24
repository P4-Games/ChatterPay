'use client'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { useTranslate } from 'src/locales'

import StakingConsent from './staking-consent'
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
 * Two flows exist and the deployment decides which, so this component chooses rather than showing
 * both. Where the terms must be accepted, joining is an act: the consent card collects it. Where
 * they need not be, enrolment is automatic and there is nothing to accept — a card offering to start
 * would offer a step that does not exist, and a user who did not press it would still be enrolled.
 *
 * Leaving is offered on what is true of the position rather than on `optedIn`. That flag records
 * whether somebody once switched staking on, and a wallet enrolled automatically has it false while
 * being registered, delegated and earning; gating the control on it would leave exactly those users
 * with no way out. What it is gated on instead is a registration that exists, a signer that can
 * unwind it, and no exit already in flight.
 *
 * A wallet that has already left is handled by the notices above this card, which carry the date and
 * the way back. Repeating it here would give the same decision two controls.
 */
export default function StakingMembership({
  staking,
  submitting = false,
  onJoin,
  onLeave
}: Props): JSX.Element | null {
  const { t } = useTranslate()

  if (staking.optOut !== null) return null

  if (LEAVING_STATES.includes(staking.state)) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant='h6' data-testid='staking-membership-leaving'>
              {t('staking.membership.leavingTitle')}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('staking.membership.leavingBody')}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
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

    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6' data-testid='staking-membership-active'>
              {t('staking.membership.activeTitle')}
            </Typography>

            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('staking.membership.pool', {
                pool: staking.poolId ?? t('staking.position.poolNone')
              })}
            </Typography>

            {deposit !== null && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('staking.membership.deposit', { amount: formatAdaWithUnit(deposit) })}
              </Typography>
            )}

            {/* Offered on the position, not on the consent flag: a wallet enrolled automatically has
                no consent on file and still has to be able to leave. Withheld only when this
                deployment could not sign the exit it would start. */}
            {staking.signable && (
              <Button
                variant='outlined'
                color='error'
                onClick={onLeave}
                disabled={submitting}
                data-testid='staking-membership-leave'
              >
                {t('staking.deactivate.confirm')}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  const refusal = staking.actions.register_and_delegate ?? null

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          {refusal === null && (
            <>
              <Typography variant='h6' data-testid='staking-membership-pending'>
                {t('staking.membership.pendingTitle')}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('staking.membership.pendingBody')}
              </Typography>
            </>
          )}

          {refusal === 'not_eligible' && (
            <>
              <Typography variant='h6' data-testid='staking-membership-below-minimum'>
                {t('staking.membership.belowMinimumTitle')}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('staking.membership.belowMinimumBody', {
                  minimum: formatAdaWithUnit(staking.minimumEnrolmentLovelace)
                })}
              </Typography>
            </>
          )}

          {refusal !== null && refusal !== 'not_eligible' && (
            <>
              <Typography variant='h6' data-testid='staking-membership-blocked'>
                {t('staking.membership.blockedTitle')}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t(`staking.refusals.${refusal}`, { defaultValue: refusal })}
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
