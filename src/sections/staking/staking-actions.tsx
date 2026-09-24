'use client'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { useTranslate } from 'src/locales'

import type { StakingView, StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  busy?: StakingActionName | null
  onAction: (action: StakingActionName) => void
}

/**
 * The order the actions are offered in.
 *
 * Joining first, then the things that keep a position healthy, then the ways out. The two that move
 * the whole balance are last and visually separate, because a destructive control next to a routine
 * one is a control that gets pressed by accident.
 */
const ORDER: StakingActionName[] = [
  'register_and_delegate',
  'delegate_vote',
  'redelegate_pool',
  'withdraw_rewards',
  'deregister',
  'exit_and_send_max'
]

/** The ones that end participation. Shown in a warning colour and separated from the rest. */
const LEAVING: StakingActionName[] = ['deregister', 'exit_and_send_max']

// ----------------------------------------------------------------------

/**
 * What the user can do, and why they cannot do the rest.
 *
 * The backend answers with a refusal per action rather than a list of what is permitted, and that
 * shape is kept all the way to the screen: a disabled button carries the reason it is disabled in its
 * tooltip. "Delegate your voting power first" is something a user can act on; a greyed-out button with
 * no explanation is something they file a support ticket about.
 *
 * An action the backend did not mention at all is not rendered. That happens when a deployment does
 * not offer it, and inventing a disabled control for it would imply it exists somewhere.
 */
export default function StakingActions({ staking, busy = null, onAction }: Props): JSX.Element {
  const { t } = useTranslate()

  const available = ORDER.filter((action) => action in staking.actions)

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('staking.actions.title')}
        </Typography>

        <Stack spacing={1.5}>
          {available.map((action) => {
            const refusal = staking.actions[action] ?? null
            const leaving = LEAVING.includes(action)
            const disabled = refusal !== null || busy !== null

            const button = (
              <span style={{ display: 'block' }}>
                <Button
                  fullWidth
                  variant={leaving ? 'outlined' : 'contained'}
                  color={leaving ? 'error' : 'primary'}
                  disabled={disabled}
                  onClick={() => onAction(action)}
                  data-testid={`staking-action-${action}`}
                >
                  {t(`staking.actions.${action}`)}
                </Button>
              </span>
            )

            // The tooltip wraps a span because MUI cannot attach one to a disabled button, and the
            // reason is precisely what a disabled button needs to carry.
            return (
              <Tooltip
                key={action}
                title={refusal ? t(`staking.refusals.${refusal}`, { defaultValue: refusal }) : ''}
                placement='top'
              >
                {button}
              </Tooltip>
            )
          })}
        </Stack>
      </CardContent>
    </Card>
  )
}
