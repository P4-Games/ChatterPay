'use client'

import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { useTranslate } from 'src/locales'

import type { StakingView, GovernanceView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  governance: GovernanceView | null
  submitting?: boolean
  onDelegate: () => void
}

/** How much of a DRep identifier is enough to recognise one. */
const ID_PREFIX = 12

// ----------------------------------------------------------------------

/**
 * Where the user's voting power goes, and why they should care.
 *
 * Governance looks optional and is not. In Conway a stake credential that has never delegated its
 * voting power cannot withdraw rewards at all — the ledger refuses the transaction — so a user who
 * ignores this page finds their rewards unreachable for a reason that has nothing to do with staking.
 * That is why the abstain option is described as the neutral choice *and* as the one that unlocks
 * withdrawals: it is both, and only saying the first leaves the user no reason to act.
 *
 * Registering as a DRep and voting directly are not offered. Those kinds exist in the backend so the
 * shape is settled, they are refused while their flag is off, and nothing here routes to them.
 */
export default function GovernanceDelegation({
  staking,
  governance,
  submitting = false,
  onDelegate
}: Props): JSX.Element {
  const { t } = useTranslate()

  const delegation = staking.governanceDelegation
  const kind = delegation?.kind ?? 'none'
  const refusal = staking.actions.delegate_vote ?? null

  const current =
    kind === 'drep'
      ? t('governance.current.drep', {
          drep: (delegation?.idCip129 ?? '').slice(0, ID_PREFIX) || '—'
        })
      : t(`governance.current.${kind}`, { defaultValue: t('governance.current.none') })

  return (
    <Stack spacing={3}>
      <Alert severity='info' variant='outlined'>
        {t('governance.readOnlyNotice')}
      </Alert>

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {t('governance.current.title')}
          </Typography>

          <Chip
            label={current}
            color={kind === 'none' || kind === 'not_registered' ? 'default' : 'success'}
            variant='outlined'
            data-testid='governance-current'
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6'>{t('governance.options.title')}</Typography>

            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('governance.options.description')}
            </Typography>

            <Stack spacing={1}>
              <Typography variant='subtitle2'>{t('governance.options.always_abstain')}</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {t('governance.options.always_abstainHint')}
              </Typography>
            </Stack>

            <Button
              variant='contained'
              onClick={onDelegate}
              disabled={refusal !== null || submitting}
              data-testid='governance-delegate'
            >
              {t('governance.options.delegate')}
            </Button>

            {refusal !== null && (
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {t(`staking.refusals.${refusal}`, { defaultValue: refusal })}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {t('governance.history.title')}
          </Typography>

          {!governance || governance.events.length === 0 ? (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('governance.history.empty')}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {governance.events.map((event, index) => (
                <Stack
                  key={`${event.requestedAt}-${index}`}
                  direction='row'
                  justifyContent='space-between'
                  data-testid='governance-history-row'
                >
                  <Typography variant='body2'>
                    {t(`governance.current.${event.kind}`, { defaultValue: event.kind })}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {new Date(event.requestedAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
