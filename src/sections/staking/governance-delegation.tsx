'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Radio from '@mui/material/Radio'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import RadioGroup from '@mui/material/RadioGroup'

import { useTranslate } from 'src/locales'

import GovernanceHistory from './governance-history'
import StakingRichText from './staking-rich-text'
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
 * A DRep identifier cut to its start and end, which is what an explorer search needs to confirm it.
 *
 * @param id - The CIP-129 identifier.
 * @returns The abbreviation.
 */
const shortId = (id: string): string => `${id.slice(0, ID_PREFIX)}…${id.slice(-6)}`

/**
 * The three delegations Cardano offers a delegator, in the order they are presented.
 *
 * The order is the order of the ledger's own variants and carries no recommendation.
 */
const OPTIONS: readonly GovernanceTargetKind[] = ['always_abstain', 'always_no_confidence', 'drep']

const isOption = (kind: string): kind is GovernanceTargetKind =>
  (OPTIONS as readonly string[]).includes(kind)

// ----------------------------------------------------------------------

/**
 * Where the user's voting power goes, and the control that changes it.
 *
 * In Conway a stake credential that has never delegated its voting power cannot withdraw rewards: the
 * ledger refuses the transaction. That is why the abstain option is described both as the neutral choice
 * and as the one that makes rewards withdrawable.
 *
 * The three targets are one choice, so they are presented as a single-choice list with one button that
 * sends whatever is selected. The list starts on the delegation the credential already has, so the
 * button stays disabled until the user picks something different. The representative selector starts
 * empty and lists the representatives in the order the chain gave them: a default representative would
 * be an opinion about how somebody else's stake should vote.
 *
 * The figure on the first card is the wallet's balance. Voting power is the stake the network records
 * against the credential at each epoch snapshot, which the backend does not report, so the card names
 * the figure as the balance and explains how voting power relates to it.
 */
export default function GovernanceDelegation({
  staking,
  governance,
  submitting = false,
  onDelegate
}: Props): JSX.Element {
  const { t } = useTranslate()
  const { card, accent, divider } = useStakingStyles()

  const delegation = staking.governanceDelegation
  const kind = delegation?.kind ?? 'none'
  const refusal = staking.actions.delegate_vote ?? null

  const [selected, setSelected] = useState<GovernanceTargetKind | ''>(isOption(kind) ? kind : '')
  const [drep, setDrep] = useState('')

  const dreps = governance?.dreps ?? []

  /**
   * The published name of a listed DRep, or its abbreviated identifier when it published none or is
   * not in the list.
   */
  const drepLabel = (id: string): string =>
    dreps.find((entry) => entry.idCip129 === id)?.name ?? shortId(id)

  const current =
    kind === 'drep'
      ? t('governance.current.drep', {
          drep: delegation?.idCip129 ? drepLabel(delegation.idCip129) : '—'
        })
      : t(`governance.current.${kind}`, { defaultValue: t('governance.current.none') })

  // Absent when the balance could not be read, and shown as absent rather than as zero, the same rule
  // the rest of staking follows.
  const walletStake =
    staking.balance.availability === 'unavailable'
      ? '—'
      : formatAdaWithUnit(staking.balance.totalAdaLovelace)

  // A delegation to where the vote already goes costs a network fee and changes nothing, and the backend
  // refuses it. For a representative the comparison is against the identifier picked in the selector.
  const alreadyHere =
    selected === 'drep'
      ? kind === 'drep' && drep !== '' && delegation?.idCip129 === drep
      : selected !== '' && kind === selected
  const needsDrep = selected === 'drep' && drep === ''

  // One line next to the button, for what stands in the way: the backend's refusal first, because it
  // applies to every option, then what is true of the selection only.
  const reason =
    (refusal !== null && t(`staking.refusals.${refusal}`, { defaultValue: refusal })) ||
    (alreadyHere && t('governance.options.alreadyHere')) ||
    (needsDrep && dreps.length > 0 && t('governance.options.drepRequired')) ||
    null

  const disabled = submitting || refusal !== null || selected === '' || alreadyHere || needsDrep

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
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('governance.current.stakeLabel')}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 600 }} data-testid='governance-power'>
            {walletStake}
          </Typography>
        </Stack>

        <Typography
          variant='caption'
          data-testid='governance-power-notice'
          sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
        >
          <StakingRichText text={t('governance.current.stakeNotice')} />
        </Typography>

        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 1.25 }}>
          {t('governance.readOnlyNotice')}
        </Typography>
      </Card>

      <Card sx={card}>
        <Typography variant='subtitle2'>{t('governance.options.title')}</Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.25 }}>
          {t('governance.options.description')}
        </Typography>

        <RadioGroup
          value={selected}
          onChange={(event) => setSelected(event.target.value as GovernanceTargetKind)}
          sx={{ mt: 1.5, gap: 1 }}
        >
          {OPTIONS.map((option) => {
            const active = selected === option
            return (
              <Box
                key={option}
                data-testid={`governance-option-${option}`}
                onClick={() => setSelected(option)}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: active ? `1px solid ${accent}` : divider,
                  bgcolor: active ? alpha(accent, 0.06) : 'transparent',
                  transition: 'border-color 120ms, background-color 120ms'
                }}
              >
                <Stack direction='row' spacing={1} alignItems='flex-start'>
                  <Radio
                    value={option}
                    size='small'
                    inputProps={{ 'aria-label': t(`governance.options.${option}`) }}
                    data-testid={`governance-radio-${option}`}
                    sx={{ p: 0.25, mt: 0.125, color: accent, '&.Mui-checked': { color: accent } }}
                  />
                  <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant='subtitle2'>{t(`governance.options.${option}`)}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      <StakingRichText text={t(`governance.options.${option}Hint`)} />
                    </Typography>

                    {option === 'drep' && active && (
                      // Stops the click from reaching the row: opening the menu is not a new selection.
                      <Stack
                        spacing={0.75}
                        sx={{ pt: 0.5 }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {dreps.length === 0 ? (
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                            {t('governance.options.empty')}
                          </Typography>
                        ) : (
                          <TextField
                            select
                            size='small'
                            value={drep}
                            onChange={(event) => setDrep(event.target.value)}
                            label={t('governance.options.drepSelect')}
                            data-testid='governance-drep-select'
                            SelectProps={{ renderValue: (value) => drepLabel(String(value)) }}
                            sx={{ maxWidth: { sm: 360 } }}
                          >
                            {/* The name is chosen by whoever registered the DRep, so the identifier
                                stays under it: two DReps can publish the same name. */}
                            {dreps.map((entry) => (
                              <MenuItem
                                key={entry.idCip129}
                                value={entry.idCip129}
                                data-testid='governance-drep-option'
                              >
                                <Stack spacing={0} sx={{ minWidth: 0 }}>
                                  <Typography variant='body2' noWrap>
                                    {entry.name ?? shortId(entry.idCip129)}
                                  </Typography>
                                  {entry.name && (
                                    <Typography
                                      variant='caption'
                                      noWrap
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      {shortId(entry.idCip129)}
                                    </Typography>
                                  )}
                                </Stack>
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                        <Typography
                          variant='caption'
                          data-testid='governance-drep-notice'
                          sx={{ color: 'text.secondary' }}
                        >
                          {t('governance.options.drepNotice')}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Box>
            )
          })}
        </RadioGroup>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent='flex-end'
          sx={{ mt: 2 }}
        >
          {reason && (
            <Typography
              variant='caption'
              data-testid='governance-reason'
              sx={{ color: 'text.secondary', textAlign: { sm: 'right' } }}
            >
              {reason}
            </Typography>
          )}
          <Button
            variant='contained'
            // The target travels with the press. Everything downstream — the assertion, the PIN grant,
            // the certificate — is bound to this exact value.
            onClick={() => {
              if (selected === '') return
              onDelegate(selected === 'drep' ? { kind: 'drep', drepId: drep } : { kind: selected })
            }}
            disabled={disabled}
            data-testid='governance-delegate'
            sx={{ flexShrink: 0, minWidth: 140 }}
          >
            {t('governance.options.delegate')}
          </Button>
        </Stack>
      </Card>

      <GovernanceHistory governance={governance} />
    </Stack>
  )
}
