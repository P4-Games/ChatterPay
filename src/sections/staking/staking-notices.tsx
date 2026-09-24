'use client'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import AlertTitle from '@mui/material/AlertTitle'

import { useTranslate } from 'src/locales'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  onRejoin?: () => void
  rejoining?: boolean
}

/**
 * The things the user has to be told before they look at a button and wonder why it does nothing.
 *
 * Each of these corresponds to a state the backend can genuinely be in, and each one is shown because
 * the alternative is a disabled control with no explanation. They are deliberately separate alerts
 * rather than one combined message: several can be true at once, and collapsing them would hide
 * whichever one the user needed.
 *
 * The order is by how much it constrains what the user can do. A wallet nobody here can sign for is
 * first, because nothing below it will ever be actionable.
 */
export default function StakingNotices({
  staking,
  onRejoin,
  rejoining = false
}: Props): JSX.Element {
  const { t } = useTranslate()

  const pending = staking.operations.find((operation) => !operation.settled)
  const rewardsBlocked =
    staking.registered &&
    (staking.governanceDelegation === null || staking.governanceDelegation.kind === 'none')

  return (
    <Stack spacing={2}>
      {!staking.signable && (
        <Alert severity='info' variant='outlined'>
          <AlertTitle>{t('staking.notices.notSignableTitle')}</AlertTitle>
          {t('staking.notices.notSignableBody')}
        </Alert>
      )}

      {staking.optOut !== null && (
        <Alert
          severity='warning'
          variant='outlined'
          action={
            onRejoin ? (
              <Button color='inherit' size='small' onClick={onRejoin} disabled={rejoining}>
                {t('staking.notices.optedOutRejoin')}
              </Button>
            ) : undefined
          }
        >
          <AlertTitle>{t('staking.notices.optedOutTitle')}</AlertTitle>
          {t('staking.notices.optedOutBody', {
            date: new Date(staking.optOut.at).toLocaleDateString()
          })}
        </Alert>
      )}

      {staking.balance.availability === 'unavailable' && (
        <Alert severity='warning' variant='outlined'>
          <AlertTitle>{t('staking.notices.balanceUnavailableTitle')}</AlertTitle>
          {t('staking.notices.balanceUnavailableBody')}
        </Alert>
      )}

      {staking.balance.availability === 'stale' && (
        <Alert severity='warning' variant='outlined'>
          <AlertTitle>{t('staking.notices.snapshotStaleTitle')}</AlertTitle>
          {t('staking.notices.snapshotStaleBody', {
            date: staking.balance.asOf
              ? new Date(staking.balance.asOf).toLocaleString()
              : t('staking.summary.never')
          })}
        </Alert>
      )}

      {rewardsBlocked && (
        <Alert severity='info' variant='outlined'>
          <AlertTitle>{t('staking.notices.rewardsBlockedTitle')}</AlertTitle>
          {t('staking.notices.rewardsBlockedBody')}
        </Alert>
      )}

      {pending && (
        <Alert severity='info' variant='outlined'>
          <AlertTitle>{t('staking.notices.pendingTitle')}</AlertTitle>
          {t('staking.notices.pendingBody', {
            operation: t(`staking.actions.${pending.kind}`)
          })}
        </Alert>
      )}
    </Stack>
  )
}
