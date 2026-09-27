'use client'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import AlertTitle from '@mui/material/AlertTitle'

import { useTranslate } from 'src/locales'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
}

/** How an alert is drawn here: one line of title, one of body, no vertical bulk. */
const COMPACT = {
  py: 0.5,
  '& .MuiAlert-message': { py: 0.5 },
  '& .MuiAlertTitle-root': { mb: 0, fontSize: '0.8125rem', fontWeight: 600 },
  '& .MuiAlert-icon': { py: 0.75 },
  fontSize: '0.8125rem'
} as const

// ----------------------------------------------------------------------

/**
 * What is true of the wallet right now and constrains what can be done with it.
 *
 * Each of these corresponds to a state the backend can genuinely be in, and each one is shown because
 * the alternative is a disabled control with no explanation. They are deliberately separate alerts
 * rather than one combined message: several can be true at once, and collapsing them would hide
 * whichever one the user needed.
 *
 * What is *not* here is the position's own state — opted out, external, activation pending. That is a
 * standing fact about the wallet rather than a transient condition, so it is the status card's title,
 * where it also carries the one control that changes it. Saying it in both places would give one
 * decision two homes.
 */
export default function StakingNotices({ staking }: Props): JSX.Element {
  const { t } = useTranslate()

  const pending = staking.operations.find((operation) => !operation.settled)
  const rewardsBlocked =
    staking.registered &&
    (staking.governanceDelegation === null || staking.governanceDelegation.kind === 'none')

  return (
    <Stack spacing={1.5}>
      {staking.balance.availability === 'unavailable' && (
        <Alert severity='warning' variant='outlined' sx={COMPACT}>
          <AlertTitle>{t('staking.notices.balanceUnavailableTitle')}</AlertTitle>
          {t('staking.notices.balanceUnavailableBody')}
        </Alert>
      )}

      {staking.balance.availability === 'stale' && (
        <Alert severity='warning' variant='outlined' sx={COMPACT}>
          <AlertTitle>{t('staking.notices.snapshotStaleTitle')}</AlertTitle>
          {t('staking.notices.snapshotStaleBody', {
            date: staking.balance.asOf
              ? new Date(staking.balance.asOf).toLocaleString()
              : t('staking.summary.never')
          })}
        </Alert>
      )}

      {rewardsBlocked && (
        <Alert severity='info' variant='outlined' sx={COMPACT}>
          <AlertTitle>{t('staking.notices.rewardsBlockedTitle')}</AlertTitle>
          {t('staking.notices.rewardsBlockedBody')}
        </Alert>
      )}

      {pending && (
        <Alert severity='info' variant='outlined' sx={COMPACT}>
          <AlertTitle>{t('staking.notices.pendingTitle')}</AlertTitle>
          {t('staking.notices.pendingBody', {
            operation: t(`staking.actions.${pending.kind}`)
          })}
        </Alert>
      )}
    </Stack>
  )
}
