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

import type {
  StakingView,
  GovernanceView,
  GovernanceTarget,
  GovernanceTargetKind
} from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  governance: GovernanceView | null
  submitting?: boolean
  onDelegate: (target: GovernanceTarget) => void
}

/** How much of a DRep identifier is enough to recognise one. */
const ID_PREFIX = 12

/**
 * The three delegations Cardano offers a delegator, in the order they are presented.
 *
 * All three are requestable. The order is the order of the ledger's own variants and carries no
 * recommendation: the first row is not a suggestion, and none of the representatives in the third row
 * is either.
 */
const OPTIONS: readonly GovernanceTargetKind[] = ['always_abstain', 'always_no_confidence', 'drep']

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
 *
 * Two things this screen deliberately does not claim.
 *
 * **The figure in the first card is the wallet's balance, not on-chain voting power.** Those are
 * different numbers. Voting power is the stake recorded against the credential in the governance
 * snapshot of an epoch, and the backend does not report it: the staking read carries a wallet balance
 * assembled from outputs, a refundable deposit and rewards. Labelling that as voting power would tell
 * the user a figure the chain never agreed to, so it is labelled as what it is.
 *
 * **No representative is recommended or pre-selected.** The selector starts empty and stays empty until
 * the user picks, the list is shown in the order the chain gave it, and the row says in words that
 * ChatterPay does not recommend one. A default selection in a governance control is an opinion about
 * how somebody else's stake should vote.
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

  // The wallet's balance. Absent when it could not be read, and absent is shown as absent rather than
  // as zero — the same rule the rest of staking follows.
  const walletStake =
    staking.balance.availability === 'unavailable'
      ? '—'
      : formatAdaWithUnit(staking.balance.totalAdaLovelace)

  const dreps = governance?.dreps ?? []
  const events = governance?.events ?? []

  /**
   * Whether a row is the delegation the credential already has.
   *
   * A delegation to where the vote already goes costs a network fee and changes nothing, and the
   * backend refuses it — so the row says so instead of offering a transaction that does nothing. For a
   * representative the comparison is against the identifier currently selected, because that is what
   * the row would ask for.
   *
   * @param option - The row.
   * @returns `true` when pressing it would change nothing.
   */
  const alreadyHere = (option: GovernanceTargetKind): boolean => {
    if (option !== 'drep') return kind === option
    return kind === 'drep' && drep !== '' && delegation?.idCip129 === drep
  }

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
            {t('governance.current.stakeLabel')}
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600 }} data-testid='governance-power'>
            {walletStake}
          </Typography>
        </Stack>

        <Typography
          variant='caption'
          data-testid='governance-power-notice'
          sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}
        >
          {t('governance.current.stakeNotice')}
        </Typography>

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
            const isDrep = option === 'drep'
            const needsChoice = isDrep && drep === ''
            // One line under the row, and which one depends on what stands in the way: the backend's
            // own refusal for this wallet first, because it applies to every row, then the two things
            // that are true of one row only.
            const reason =
              (refusal !== null && t(`staking.refusals.${refusal}`, { defaultValue: refusal })) ||
              (alreadyHere(option) && t('governance.options.alreadyHere')) ||
              (needsChoice && dreps.length > 0 && t('governance.options.drepRequired')) ||
              null
            const disabled = submitting || refusal !== null || alreadyHere(option) || needsChoice

            return (
              <Stack
                key={option}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent='space-between'
                data-testid={`governance-option-${option}`}
                sx={{ py: 1.5, borderTop: index === 0 ? 'none' : divider }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography variant='subtitle2'>{t(`governance.options.${option}`)}</Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {t(`governance.options.${option}Hint`)}
                  </Typography>

                  {isDrep && (
                    <Typography
                      variant='caption'
                      data-testid='governance-drep-notice'
                      sx={{ color: 'text.disabled' }}
                    >
                      {t('governance.options.drepNotice')}
                    </Typography>
                  )}

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
                          <MenuItem key={entry.idCip129} value={entry.idCip129}>
                            {`${entry.idCip129.slice(0, ID_PREFIX)}…`}
                          </MenuItem>
                        ))}
                      </TextField>
                    ))}

                  {reason && (
                    <Typography
                      variant='caption'
                      data-testid={`governance-reason-${option}`}
                      sx={{ color: 'text.disabled' }}
                    >
                      {reason}
                    </Typography>
                  )}
                </Stack>

                <Button
                  variant='outlined'
                  size='small'
                  // The target travels with the press. Everything downstream — the assertion, the PIN
                  // grant, the certificate — is bound to this exact value, so the button cannot mean
                  // one delegation while the request carries another.
                  onClick={() =>
                    onDelegate(isDrep ? { kind: 'drep', drepId: drep } : { kind: option })
                  }
                  disabled={disabled}
                  data-testid={
                    option === 'always_abstain'
                      ? 'governance-delegate'
                      : `governance-delegate-${option}`
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
