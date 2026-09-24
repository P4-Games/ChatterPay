'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'

import { useTranslate } from 'src/locales'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  submitting?: boolean
  onAccept: () => void
  onDecline: () => void
}

/**
 * Joining and leaving, as one control.
 *
 * Consent and the opt-in are two fields in the database and one decision in the product: a consent
 * with the switch off stakes nothing, and a switch on without a consent is exactly what the sweep
 * refuses to act on. So they are collected together, and the checkbox gates the button rather than
 * being a separate step the user can skip.
 *
 * Leaving does **not** withdraw the consent. The record stays, because a position already on chain
 * does not disappear when a switch moves and the record is what says which terms it was opened under.
 * What leaving does write is the decision to be out, which is what stops the daily sweep from
 * enrolling the wallet again the next time a balance and a consent line up.
 *
 * A change of terms is surfaced rather than silently accepted: the version the user agreed to is
 * compared with the one this deployment currently asks for, and a mismatch asks again.
 */
export default function StakingConsent({
  staking,
  submitting = false,
  onAccept,
  onDecline
}: Props): JSX.Element {
  const { t } = useTranslate()
  const [accepted, setAccepted] = useState(false)

  const termsChanged =
    staking.termsVersion !== null && staking.termsVersion !== staking.currentTermsVersion

  if (staking.optedIn && !termsChanged) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>{t('staking.consent.title')}</Typography>

            {staking.termsVersion && (
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('staking.consent.version', { version: staking.termsVersion })}
              </Typography>
            )}

            <Button
              variant='outlined'
              color='error'
              onClick={onDecline}
              disabled={submitting}
              data-testid='staking-consent-decline'
            >
              {t('staking.consent.decline')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='h6'>{t('staking.consent.title')}</Typography>

          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('staking.consent.description')}
          </Typography>

          {termsChanged && (
            <Alert severity='info'>
              {t('staking.consent.newVersion', { version: staking.currentTermsVersion })}
            </Alert>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                inputProps={
                  {
                    'data-testid': 'staking-consent-checkbox'
                  } as React.InputHTMLAttributes<HTMLInputElement>
                }
              />
            }
            label={t('staking.consent.terms')}
          />

          <Button
            variant='contained'
            onClick={onAccept}
            // The checkbox is the consent. A button that works without it would be recording an
            // acceptance the user never gave.
            disabled={!accepted || submitting || !staking.signable}
            data-testid='staking-consent-accept'
          >
            {t('staking.consent.accept')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
