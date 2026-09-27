'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

import { useTranslate } from 'src/locales'
import { fDateTime } from 'src/utils/format-time'
import { SECURITY_PIN_LENGTH } from 'src/config-global'
import FormProvider, { RHFCode } from 'src/components/hook-form'

import type { StakingActionName, StakingPinRefusal } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/**
 * A refused staking call: the backend's refusal code and, for a refused PIN, what the security service
 * reported about it.
 */
export type StakingFailure = {
  code: string
  pin?: StakingPinRefusal
}

type Props = {
  open: boolean
  action: StakingActionName | null
  submitting?: boolean
  error?: StakingFailure | null
  onCancel: () => void
  onConfirm: (pin: string) => void
}

type PinFormValues = {
  pin: string
}

/**
 * The refusal codes this dialog can explain, and the message for each.
 *
 * What reaches `error` is the backend's own refusal code, which is what keeps one failure from reading
 * like another. The codes below are the ones the user resolves themselves, so they are shown as a
 * sentence; anything else is shown as it arrived, because a diagnosable refusal such as a governance
 * block is more use to the person reading it than a generic apology.
 */
const MESSAGE_OF: Record<string, string> = {
  SECURITY_PIN_NOT_SET: 'staking.pin.notSet',
  SECURITY_PIN_BLOCKED: 'staking.pin.blocked',
  SECURITY_PIN_REJECTED: 'staking.pin.rejected',
  SECURITY_PIN_REQUIRED: 'staking.pin.required',
  // The gate refused and did not say which situation it was, which happens when it could not be read.
  security_gate: 'staking.pin.gate'
}

/**
 * Turns a refusal into the sentence the user reads.
 *
 * A wrong PIN says how many attempts are left and a blocked one says until when, when the backend
 * reported it: the same two figures the bot shows after a failed verification.
 *
 * @returns The formatter.
 */
export function useStakingFailureMessage(): (failure: StakingFailure) => string {
  const { t } = useTranslate()

  return (failure: StakingFailure): string => {
    const remaining = failure.pin?.remainingAttempts ?? null
    const blockedUntil = failure.pin?.blockedUntil ?? null

    if (failure.code === 'SECURITY_PIN_REJECTED' && remaining !== null) {
      return t('staking.pin.rejectedAttempts', { count: remaining })
    }
    if (failure.code === 'SECURITY_PIN_BLOCKED' && blockedUntil !== null) {
      return t('staking.pin.blockedUntil', { time: fDateTime(blockedUntil) })
    }

    const key = MESSAGE_OF[failure.code]
    return key === undefined ? failure.code : t(key)
  }
}

/**
 * Whether the position reports the user's PIN as blocked right now.
 *
 * @param blockedUntil - The expiry the backend reported, or `null`/absent.
 * @returns `true` while the block has not lifted.
 */
export function isPinBlocked(blockedUntil: string | null | undefined): boolean {
  if (!blockedUntil) return false
  const until = new Date(blockedUntil).getTime()
  return Number.isFinite(until) && until > Date.now()
}

/**
 * Asks for the PIN against a named operation.
 *
 * The input is the one the profile uses to set the PIN: one box per digit, `SECURITY_PIN_LENGTH` of
 * them, digits only. A PIN of any other shape cannot be the user's, so it is refused here instead of
 * being sent and counted as a failed attempt.
 *
 * The operation is in the prompt on purpose. A PIN dialog that says only "enter your PIN" trains
 * people to type it whenever something asks, which is exactly the habit that makes a stolen session
 * useful; one that says *which* operation it authorises gives the user something to disagree with.
 *
 * The backend enforces the same binding, so this is not decoration: what comes back from the
 * authorisation is a grant that names this action, and presenting it for another one is refused.
 *
 * The PIN is held in form state for as long as the dialog is open and is never stored anywhere else.
 * Clearing it on every opening matters because this dialog is reopened for the next action.
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
  const message = useStakingFailureMessage()

  const pinLength = SECURITY_PIN_LENGTH

  const schema: Yup.ObjectSchema<PinFormValues> = useMemo(
    () =>
      Yup.object({
        pin: Yup.string()
          .matches(
            new RegExp(`^\\d{${pinLength}}$`),
            t('security.pin.validation.exactLength').replace('{length}', String(pinLength))
          )
          .required(t('common.required'))
      }),
    [pinLength, t]
  )

  const methods = useForm<PinFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { pin: '' }
  })
  const { reset, watch, handleSubmit } = methods
  const pin = watch('pin')

  // Cleared on every opening, not only on cancel: after a confirmed operation the parent closes the
  // dialog without going through `close`, and the next action would otherwise find the previous PIN
  // already typed in.
  useEffect(() => {
    if (open) reset({ pin: '' })
  }, [open, reset])

  // A refusal empties the boxes and puts the cursor back on the first one, so a wrong PIN is typed
  // again rather than erased digit by digit. Each refusal is a new object, so a second wrong PIN clears
  // them again.
  const boxes = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || error === null) return
    reset({ pin: '' })
    boxes.current?.querySelector('input')?.focus()
  }, [open, error, reset])

  const close = (): void => {
    reset({ pin: '' })
    onCancel()
  }

  const confirm = handleSubmit((values) => {
    if (submitting) return
    onConfirm(values.pin)
  })

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='xs'>
      <FormProvider methods={methods} onSubmit={confirm}>
        <DialogTitle>{t('staking.pin.title')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('staking.pin.description', {
                operation: action ? t(`staking.actions.${action}`) : ''
              })}
            </Typography>

            {error && <Alert severity='error'>{message(error)}</Alert>}

            <Stack spacing={1.5} ref={boxes} data-testid='staking-pin-input'>
              <Typography variant='body2' color='text.secondary'>
                {t('security.pin.label')}
              </Typography>
              <RHFCode
                name='pin'
                length={pinLength}
                // No placeholder: each box holds one digit, and the profile's "{length} digits" does
                // not fit in one.
                TextFieldsProps={{
                  type: 'password',
                  disabled: submitting,
                  inputProps: { inputMode: 'numeric', pattern: '[0-9]*' }
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={close} color='inherit' disabled={submitting}>
            {t('staking.actions.cancel')}
          </Button>
          <LoadingButton
            type='submit'
            variant='contained'
            loading={submitting}
            disabled={submitting || pin.length !== pinLength}
            data-testid='staking-pin-submit'
          >
            {t('staking.pin.submit')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  )
}
