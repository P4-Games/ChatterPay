'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'

import type { StakingView, StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  busy?: StakingActionName | null
  onAction: (action: StakingActionName) => void
}

/** What keeps a position healthy, in the order it is offered. */
const ROUTINE: { action: StakingActionName; icon: string }[] = [
  { action: 'register_and_delegate', icon: 'solar:play-circle-bold' },
  { action: 'delegate_vote', icon: 'solar:hand-stars-bold' },
  { action: 'redelegate_pool', icon: 'solar:refresh-circle-bold' },
  { action: 'withdraw_rewards', icon: 'solar:hand-money-bold' }
]

/**
 * Leaving with the balance.
 *
 * Grouped apart rather than coloured like a warning. Stopping staking lives on the status card and
 * is the single way out of participation; this one also moves every lovelace to an address, so it is
 * separated by position and by a label naming the group — which survives a colourblind viewer and a
 * greyscale screenshot in a way a red border does not.
 */
const LEAVING: { action: StakingActionName; icon: string }[] = [
  { action: 'exit_and_send_max', icon: 'solar:square-arrow-right-up-bold' }
]

/**
 * Refusals that mean the action does not apply to this wallet at all.
 *
 * A control for one of these is noise: "start staking — already registered" describes a state the
 * user can already see, and a line of explanation under every inapplicable button is how a card
 * becomes a wall of text. Every other refusal is one the user may be able to act on, so it is shown
 * with its reason.
 */
const NOT_APPLICABLE = [
  'already_registered',
  'not_registered',
  'not_available',
  'already_delegated'
]

// ----------------------------------------------------------------------

/**
 * What the user can do, and why they cannot do the rest.
 *
 * The backend answers with a refusal per action rather than a list of what is permitted, and that
 * shape is kept all the way to the screen: a control that is offered but refused carries the reason
 * as a short line under it. "Delegate your voting power first" is something a user can act on; a
 * greyed-out button with no explanation is something they file a support ticket about.
 *
 * The reason is never folded into the label, because a label whose length depends on the wallet is
 * what makes a row of buttons ragged, and it is not hidden in a tooltip either, since a disabled
 * control takes no pointer events and a phone has no hover.
 *
 * Buttons are sized by their content and wrap. Equal cells across a wide screen produce controls
 * several times wider than their labels, which reads as a form to work through rather than as a set
 * of things one may do. They do stretch on a phone, where full width is the ordinary shape.
 *
 * Deregistration is deliberately absent. It is the same decision as switching staking off, and it is
 * offered once, on the status card, so that the voluntary exit has a single entry point.
 */
export default function StakingActions({
  staking,
  busy = null,
  onAction
}: Props): JSX.Element | null {
  const { t } = useTranslate()
  const { card, accent } = useStakingStyles()

  /**
   * Whether an action is worth a control for this wallet.
   *
   * @param entry - The action and its icon.
   * @returns Whether to render it.
   */
  const offered = (entry: { action: StakingActionName }): boolean => {
    if (!(entry.action in staking.actions)) return false
    const refusal = staking.actions[entry.action] ?? null
    return refusal === null || !NOT_APPLICABLE.includes(refusal)
  }

  const routine = ROUTINE.filter(offered)
  const leaving = LEAVING.filter(offered)

  if (routine.length === 0 && leaving.length === 0) return null

  /**
   * One control, with its reason when it has one.
   *
   * @param entry - The action and the icon it carries.
   * @returns The control.
   */
  const control = (entry: { action: StakingActionName; icon: string }): JSX.Element => {
    const refusal = staking.actions[entry.action] ?? null

    return (
      <Box key={entry.action} sx={{ width: { xs: '100%', sm: 'auto' } }}>
        <Button
          variant='outlined'
          startIcon={<Iconify icon={entry.icon} width={18} />}
          disabled={refusal !== null || busy !== null}
          onClick={() => onAction(entry.action)}
          data-testid={`staking-action-${entry.action}`}
          sx={{
            height: 42,
            px: 2,
            width: { xs: '100%', sm: 'auto' },
            whiteSpace: 'nowrap',
            color: accent,
            borderColor: accent,
            borderWidth: '0.5px',
            '&:hover': { borderColor: accent, borderWidth: '0.5px' }
          }}
        >
          {t(`staking.actions.${entry.action}`)}
        </Button>

        {refusal !== null && (
          <Typography
            variant='caption'
            data-testid={`staking-action-reason-${entry.action}`}
            sx={{ display: 'block', mt: 0.5, color: 'text.disabled', lineHeight: 1.4 }}
          >
            {t(`staking.refusals.${refusal}`, { defaultValue: refusal })}
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
        {t('staking.actions.title')}
      </Typography>

      {routine.length > 0 && (
        <Box
          data-testid='staking-actions-grid'
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1.5 }}
        >
          {routine.map(control)}
        </Box>
      )}

      {leaving.length > 0 && (
        <>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              mt: routine.length > 0 ? 2.5 : 0,
              mb: 1,
              color: 'text.secondary'
            }}
          >
            {t('staking.actions.leavingGroup')}
          </Typography>

          <Box
            data-testid='staking-actions-leaving'
            sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1.5 }}
          >
            {leaving.map(control)}
          </Box>
        </>
      )}
    </Card>
  )
}
