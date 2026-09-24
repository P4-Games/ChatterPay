'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

import { useTranslate } from 'src/locales'

import type { StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  action: StakingActionName | null
  submitting?: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: (pin: string) => void
}

/**
 * Asks for the PIN against a named operation.
 *
 * The operation is in the prompt on purpose. A PIN dialog that says only "enter your PIN" trains
 * people to type it whenever something asks, which is exactly the habit that makes a stolen session
 * useful; one that says *which* operation it authorises gives the user something to disagree with.
 *
 * The backend enforces the same binding, so this is not decoration: what comes back from the
 * authorisation is a grant that names this action, and presenting it for another one is refused.
 *
 * The PIN is held in component state for as long as the dialog is open and is never stored anywhere
 * else. Clearing it on close matters because this dialog is reopened for the next action.
 */
export default function StakingPinDialog({
  open,
  action,
  submitting = false,
  error = null,
  onCancel,
  onConfirm
}: Props): JSX.Element {
  const { t } = useTranslate()
  const [pin, setPin] = useState('')

  const close = (): void => {
    setPin('')
    onCancel()
  }

  const confirm = (): void => {
    if (pin.trim() === '') return
    onConfirm(pin)
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='xs'>
      <DialogTitle>{t('staking.pin.title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('staking.pin.description', {
              operation: action ? t(`staking.actions.${action}`) : ''
            })}
          </Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          <TextField
            autoFocus
            fullWidth
            type='password'
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') confirm()
            }}
            label={t('staking.pin.label')}
            inputProps={{
              // A PIN is digits, and the numeric keypad is what a phone should offer for it.
              inputMode: 'numeric',
              autoComplete: 'one-time-code',
              'data-testid': 'staking-pin-input'
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={close} color='inherit' disabled={submitting}>
          {t('staking.actions.cancel')}
        </Button>
        <Button
          onClick={confirm}
          variant='contained'
          disabled={submitting || pin.trim() === ''}
          data-testid='staking-pin-submit'
        >
          {t('staking.pin.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
