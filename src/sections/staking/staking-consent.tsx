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
}

/**
 * Joining, where this deployment requires the terms to be accepted.
 *
 * Consent and the opt-in are two fields in the database and one decision in the product: a consent
 * with the switch off stakes nothing, and a switch on without a consent is exactly what the sweep
 * refuses to act on. So they are collected together, and the checkbox gates the button rather than
 * being a separate step the user can skip.
 *
 * The card is not rendered at all where the terms are not required, because there enrolment is
 * automatic and an offer to start would describe a step that does not exist.
 *
 * Leaving is not offered here. It belongs to the position rather than to the consent: a wallet
 * enrolled automatically carries no consent and still has to be able to leave, so the control lives
 * on the membership card, which reads the position.
 *
 * A change of terms is surfaced rather than silently accepted: the version the user agreed to is
 * compared with the one this deployment currently asks for, and a mismatch asks again.
 */
export default function StakingConsent({
  staking,
  submitting = false,
  onAccept
}: Props): JSX.Element {
  const { t } = useTranslate()
  const [accepted, setAccepted] = useState(false)

  const termsChanged =
    staking.termsVersion !== null && staking.termsVersion !== staking.currentTermsVersion

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
