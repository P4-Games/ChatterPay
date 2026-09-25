'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit } from './staking-amount'

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

/**
 * The delegations offered, and which of them this deployment can actually carry out.
 *
 * `wired` is not a style flag. The action request carries an action name and nothing else — there is
 * no field naming a governance target — so abstaining is the only delegation the backend can be asked
 * for from here. The other two are listed because they exist on Cardano and a user comparing options
 * needs to see them, and each says plainly that it cannot be chosen here rather than failing on press.
 */
const OPTIONS: { kind: 'always_abstain' | 'always_no_confidence' | 'drep'; wired: boolean }[] = [
  { kind: 'always_abstain', wired: true },
  { kind: 'always_no_confidence', wired: false },
  { kind: 'drep', wired: false }
]

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
 * The options are rows rather than cards: they are alternatives to compare, each with one line of
 * description and one control, and a full-width bar per option makes three choices look like three
 * separate decisions.
 */
export default function GovernanceDelegation({
  staking,
  governance,
  submitting = false,
  onDelegate
}: Props): JSX.Element {
  const { t } = useTranslate()
  const { card, accent, divider, outlined } = useStakingStyles()
  const [drep, setDrep] = useState('')

  const delegation = staking.governanceDelegation
  const kind = delegation?.kind ?? 'none'
  const refusal = staking.actions.delegate_vote ?? null

  const current =
    kind === 'drep'
      ? t('governance.current.drep', {
          drep: (delegation?.idCip129 ?? '').slice(0, ID_PREFIX) || '—'
        })
      : t(`governance.current.${kind}`, { defaultValue: t('governance.current.none') })

  // The stake that backs the vote. Absent when the balance could not be read, and absent is shown as
  // absent rather than as zero.
  const power =
    staking.balance.availability === 'unavailable'
      ? '—'
      : formatAdaWithUnit(staking.balance.totalAdaLovelace)

  const dreps = governance?.dreps ?? []
  const events = governance?.events ?? []

  return (
    <Stack spacing={2}>
      <Card sx={card}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1.5}>
          <Typography variant='subtitle2'>{t('governance.current.title')}</Typography>
          <Chip
            size='small'
            label={current}
            color={kind === 'none' || kind === 'not_registered' ? 'default' : 'success'}
            variant='outlined'
            data-testid='governance-current'
            sx={{ height: 24, fontSize: '0.75rem', maxWidth: '60%' }}
          />
        </Stack>

        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          spacing={2}
          sx={{ mt: 1.25 }}
        >
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {t('staking.position.vote')}
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600 }} data-testid='governance-power'>
            {power}
          </Typography>
        </Stack>

        <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mt: 1.25 }}>
          {t('governance.readOnlyNotice')}
        </Typography>
      </Card>

      <Card sx={card}>
        <Typography variant='subtitle2'>{t('governance.options.title')}</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
          {t('governance.options.description')}
        </Typography>

        <Box sx={{ mt: 1 }}>
          {OPTIONS.map((option, index) => {
            const isDrep = option.kind === 'drep'
            // A row that cannot be carried out here says so; a row that can defers to the backend's
            // own refusal for this wallet.
            const reason = option.wired
              ? refusal && t(`staking.refusals.${refusal}`, { defaultValue: refusal })
              : t('governance.options.unavailable')
            const disabled =
              submitting ||
              !option.wired ||
              refusal !== null ||
              (isDrep && (drep === '' || dreps.length === 0))

            return (
              <Stack
                key={option.kind}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent='space-between'
                data-testid={`governance-option-${option.kind}`}
                sx={{ py: 1.5, borderTop: index === 0 ? 'none' : divider }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography variant='subtitle2'>
                    {t(`governance.options.${option.kind}`)}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {t(`governance.options.${option.kind}Hint`)}
                  </Typography>

                  {isDrep &&
                    (dreps.length === 0 ? (
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {t('governance.options.empty')}
                      </Typography>
                    ) : (
                      <TextField
                        select
                        size='small'
                        value={drep}
                        onChange={(event) => setDrep(event.target.value)}
                        label={t('governance.options.drepLabel')}
                        data-testid='governance-drep-select'
                        sx={{ mt: 0.5, maxWidth: { sm: 260 } }}
                      >
                        {dreps.map((entry) => (
                          <MenuItem key={entry.id} value={entry.id}>
                            {`${(entry.idCip129 ?? entry.id).slice(0, ID_PREFIX)}…`}
                          </MenuItem>
                        ))}
                      </TextField>
                    ))}

                  {reason && (
                    <Typography
                      variant='caption'
                      data-testid={`governance-reason-${option.kind}`}
                      sx={{ color: 'text.disabled' }}
                    >
                      {reason}
                    </Typography>
                  )}
                </Stack>

                <Button
                  variant='outlined'
                  size='small'
                  onClick={onDelegate}
                  disabled={disabled}
                  data-testid={
                    option.kind === 'always_abstain'
                      ? 'governance-delegate'
                      : `governance-delegate-${option.kind}`
                  }
                  sx={{
                    ...outlined(accent),
                    px: 2,
                    py: 0.75,
                    flexShrink: 0,
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('governance.options.delegate')}
                </Button>
              </Stack>
            )
          })}
        </Box>
      </Card>

      <Card sx={card}>
        <Typography variant='subtitle2' sx={{ mb: events.length === 0 ? 0.5 : 1 }}>
          {t('governance.history.title')}
        </Typography>

        {events.length === 0 ? (
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {t('governance.history.empty')}
          </Typography>
        ) : (
          <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {events.map((event, index) => (
              <Stack
                key={`${event.requestedAt}-${index}`}
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                spacing={2}
                data-testid='governance-history-row'
                sx={{ py: 0.75 }}
              >
                <Typography variant='caption'>
                  {t(`governance.current.${event.kind}`, { defaultValue: event.kind })}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  {new Date(event.requestedAt).toLocaleDateString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  )
}
