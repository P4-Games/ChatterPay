'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'
import { STAKING_ACTION_ICONS } from './staking-operation-icons'

import { hasOperationInFlight } from 'src/app/api/hooks/use-staking'

import type { StakingView, StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  /** The operations this group may offer, in the order they are rendered. */
  actions: readonly StakingActionName[]
  /** Whether the group also carries the control that stops staking. */
  includeStop?: boolean
  busy?: StakingActionName | null
  onAction: (action: StakingActionName) => void
  /** Opens the confirmation for stopping staking. */
  onLeave?: () => void
  /**
   * Smaller buttons with no reason under them, for a card header. The card then renders
   * {@link StakingActionReasons} in its body, so a refusal is still explained.
   */
  compact?: boolean
  testId?: string
}

/** States in which the position is being unwound and nothing else may be started. */
const LEAVING_STATES = ['exit_pending', 'exit_submitted']

/**
 * Refusals that mean the action does not apply to this wallet at all.
 *
 * A control for one of these describes a state the user can already see, so it is not rendered. Every
 * other refusal is one the user may be able to act on, so it is shown with its reason.
 *
 * `opted_out` is here because the membership card already carries the one control that lifts it.
 * Rendering the refused action as well would show two controls for the same decision, one of them
 * disabled until the opt-out is withdrawn.
 */
const NOT_APPLICABLE = [
  'already_registered',
  'not_registered',
  'not_available',
  'already_delegated',
  'opted_out'
]

// ----------------------------------------------------------------------

/**
 * Whether the position is an ordinary one the user can stop from this screen: registered, signed for
 * by this deployment, not opted out and not already leaving.
 *
 * @param staking - The position.
 * @returns `true` when the stop control applies.
 */
export function canStopStaking(staking: StakingView): boolean {
  return (
    staking.registered &&
    staking.signable &&
    staking.optOut === null &&
    !LEAVING_STATES.includes(staking.state)
  )
}

/**
 * The operations out of `actions` that get a control on this wallet.
 *
 * Starting staking applies only to a wallet that is not registered; for a registered one the control
 * would describe what is already true. An action the backend never mentioned, or refused as not
 * applicable, gets no control either.
 *
 * @param staking - The position.
 * @param actions - The candidates.
 * @returns The candidates that apply, in their original order.
 */
export function offeredActions(
  staking: StakingView,
  actions: readonly StakingActionName[]
): StakingActionName[] {
  return actions.filter((action) => {
    if (action === 'register_and_delegate' && staking.registered) return false
    if (!(action in staking.actions)) return false
    const refusal = staking.actions[action] ?? null
    return refusal === null || !NOT_APPLICABLE.includes(refusal)
  })
}

// ----------------------------------------------------------------------

/**
 * The controls for a set of staking operations, rendered inside the card the operation belongs to:
 * withdrawing with the rewards, starting, changing the pool and stopping with the position.
 *
 * Only staking operations are offered. Delegating the vote belongs to the governance tab, and moving
 * the whole balance out is a transfer.
 *
 * A refused control carries the backend's reason as a short line under it, never in the label or a
 * tooltip: a disabled control takes no pointer events and a phone has no hover.
 *
 * Renders nothing when no control applies, so the hosting card shows no empty row.
 */
export default function StakingActions({
  staking,
  actions,
  includeStop = false,
  busy = null,
  onAction,
  onLeave,
  compact = false,
  testId = 'staking-actions'
}: Props): JSX.Element | null {
  const { t } = useTranslate()
  const { accent, theme } = useStakingStyles()

  const offered = offeredActions(staking, actions)
  const stoppable = includeStop && onLeave !== undefined && canStopStaking(staking)
  // Stopping is not in `actions`, so the backend's in-flight refusal does not reach it on its own.
  const inFlight = hasOperationInFlight(staking)

  if (offered.length === 0 && !stoppable) return null

  const width = compact ? 'auto' : { xs: '100%', sm: 'auto' }

  const buttonSx = (color: string) => ({
    height: compact ? 30 : 36,
    px: compact ? 1.5 : 2,
    width,
    whiteSpace: 'nowrap',
    color,
    borderColor: color,
    borderWidth: '0.5px',
    '&:hover': { borderColor: color, borderWidth: '0.5px' }
  })

  return (
    <Box
      data-testid={testId}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: compact ? 'flex-end' : 'flex-start',
        gap: compact ? 1 : 1.5
      }}
    >
      {offered.map((action) => {
        const refusal = staking.actions[action] ?? null
        return (
          <Box key={action} sx={{ width }}>
            <Button
              variant='outlined'
              size={compact ? 'small' : 'medium'}
              startIcon={<Iconify icon={STAKING_ACTION_ICONS[action]} width={compact ? 16 : 18} />}
              disabled={refusal !== null || busy !== null}
              onClick={() => onAction(action)}
              data-testid={`staking-action-${action}`}
              sx={buttonSx(accent)}
            >
              {t(`staking.actions.${action}`)}
            </Button>

            {refusal !== null && !compact && (
              <Typography
                variant='caption'
                data-testid={`staking-action-reason-${action}`}
                sx={{ display: 'block', mt: 0.5, color: 'text.disabled', lineHeight: 1.4 }}
              >
                {t(`staking.refusals.${refusal}`, { defaultValue: refusal })}
              </Typography>
            )}
          </Box>
        )
      })}

      {stoppable && (
        <Box sx={{ width }}>
          <Button
            variant='outlined'
            size={compact ? 'small' : 'medium'}
            startIcon={<Iconify icon='solar:logout-2-bold' width={compact ? 16 : 18} />}
            disabled={busy !== null || inFlight}
            onClick={onLeave}
            data-testid='staking-action-stop'
            sx={buttonSx(theme.palette.error.main)}
          >
            {t('staking.deactivate.confirm')}
          </Button>
        </Box>
      )}
    </Box>
  )
}

// ----------------------------------------------------------------------

/**
 * Why each refused control in a compact group is disabled, one line per refusal.
 *
 * The compact group has no room under its buttons, so the card that hosts it renders this in its body.
 * Renders nothing when every offered action is allowed.
 */
export function StakingActionReasons({
  staking,
  actions
}: {
  staking: StakingView
  actions: readonly StakingActionName[]
}): JSX.Element | null {
  const { t } = useTranslate()

  const refused = offeredActions(staking, actions).filter(
    (action) => (staking.actions[action] ?? null) !== null
  )

  if (refused.length === 0) return null

  return (
    <Box>
      {refused.map((action) => {
        const refusal = staking.actions[action] as string
        return (
          <Typography
            key={action}
            variant='caption'
            data-testid={`staking-action-reason-${action}`}
            sx={{ display: 'block', color: 'text.disabled', lineHeight: 1.4 }}
          >
            {t(`staking.refusals.${refusal}`, { defaultValue: refusal })}
          </Typography>
        )
      })}
    </Box>
  )
}
