'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'

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
 * on the status card, which reads the position.
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
  const { card, accent, outlined } = useStakingStyles()
  const [accepted, setAccepted] = useState(false)

  const termsChanged =
    staking.termsVersion !== null && staking.termsVersion !== staking.currentTermsVersion

  return (
    <Card sx={card}>
      <Stack spacing={1.5}>
        <Stack spacing={0.25}>
          <Typography variant='subtitle2'>{t('staking.consent.title')}</Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {t('staking.consent.description')}
          </Typography>
        </Stack>

        {termsChanged && (
          <Alert severity='info' variant='outlined' sx={{ py: 0.5, fontSize: '0.8125rem' }}>
            {t('staking.consent.newVersion', { version: staking.currentTermsVersion })}
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent='space-between'
        >
          <FormControlLabel
            sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }}
            control={
              <Checkbox
                size='small'
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
            variant='outlined'
            size='small'
            onClick={onAccept}
            startIcon={<Iconify icon='solar:play-circle-bold' width={16} />}
            // The checkbox is the consent. A button that works without it would be recording an
            // acceptance the user never gave.
            disabled={!accepted || submitting || !staking.signable}
            data-testid='staking-consent-accept'
            sx={{ ...outlined(accent), px: 2, py: 0.75, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {t('staking.consent.accept')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
