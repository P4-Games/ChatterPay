'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

import { useTranslate } from 'src/locales'

import { formatAdaWithUnit } from './staking-amount'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  submitting?: boolean
  /** Rewards the ledger has computed but not yet made withdrawable, in lovelace. */
  pendingRewardsLovelace?: string | null
  onCancel: () => void
  onConfirm: () => void
}

// ----------------------------------------------------------------------

/**
 * The one thing the user has to understand before switching staking off.
 *
 * Turning it off is not the mirror image of turning it on. Joining is reversible by leaving; leaving
 * is reversible only by coming back here and saying so, because the decision is recorded and it
 * outranks everything the system would otherwise do on the user's behalf — including the pass that
 * enrols wallets automatically as soon as they hold enough. Somebody who leaves and later receives ada
 * will not be re-enrolled, and nothing on the outside will tell them that.
 *
 * So the consequence is stated in the confirmation rather than in a notice afterwards, and stated in
 * the terms the user thinks in: not "an opt-out will be recorded" but "you will not take part again,
 * even if you receive more ada". That sentence is a product requirement and is pinned by a test
 * against the locale files.
 *
 * Pending rewards get their own warning when there are any. They are ada the ledger has computed and
 * not yet released, and leaving before they are released forfeits them — which is the one loss here
 * that cannot be undone by coming back.
 */
export default function StakingDeactivateDialog({
  open,
  submitting = false,
  pendingRewardsLovelace = null,
  onCancel,
  onConfirm
}: Props): JSX.Element {
  const { t } = useTranslate()

  // Zero is not "some": a warning about rewards nobody has is noise that trains people to skip the
  // one that matters.
  const pending =
    pendingRewardsLovelace !== null && pendingRewardsLovelace !== '0'
      ? pendingRewardsLovelace
      : null

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ pb: 1, typography: 'subtitle1' }}>
        {t('staking.deactivate.title')}
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('staking.deactivate.body')}
          </Typography>

          <Typography
            variant='subtitle2'
            data-testid='staking-deactivate-warning'
            sx={{ color: 'error.main' }}
          >
            {t('staking.deactivate.noAutoRejoin')}
          </Typography>

          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {t('staking.deactivate.howToReturn')}
          </Typography>

          {pending && (
            <Alert
              severity='warning'
              variant='outlined'
              data-testid='staking-deactivate-pending'
              sx={{ py: 0.5, fontSize: '0.8125rem' }}
            >
              {t('staking.deactivate.pendingRewards', {
                amount: formatAdaWithUnit(pending)
              })}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          size='small'
          onClick={onCancel}
          disabled={submitting}
          data-testid='staking-deactivate-cancel'
        >
          {t('staking.deactivate.cancel')}
        </Button>
        <Button
          size='small'
          variant='contained'
          color='error'
          onClick={onConfirm}
          disabled={submitting}
          data-testid='staking-deactivate-confirm'
          sx={{ whiteSpace: 'nowrap' }}
        >
          {t('staking.deactivate.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
