'use client'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'

import { useTranslate } from 'src/locales'

import type { StakingView, StakingActionName } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  busy?: StakingActionName | null
  onAction: (action: StakingActionName) => void
}

/**
 * The order the actions are offered in, and the icon each one carries.
 *
 * Joining first, then the things that keep a position healthy, then the ways out. The two that move
 * the whole balance are last and drawn in the warning colour, because a destructive control beside a
 * routine one is a control that gets pressed by accident.
 */
const ORDER: { action: StakingActionName; icon: string }[] = [
  { action: 'register_and_delegate', icon: 'solar:play-circle-bold' },
  { action: 'delegate_vote', icon: 'solar:hand-stars-bold' },
  { action: 'redelegate_pool', icon: 'solar:refresh-circle-bold' },
  { action: 'withdraw_rewards', icon: 'solar:hand-money-bold' },
  { action: 'deregister', icon: 'solar:logout-2-bold' },
  { action: 'exit_and_send_max', icon: 'solar:square-arrow-right-up-bold' }
]

/** The ones that end participation. */
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
 *
 * Laid out as a wrapping row of icon buttons, the same way the dashboard offers deposit, withdraw and
 * swap. The controls are peers of those, and a column of full-width bars read as a form to work
 * through rather than as a set of things one may do.
 */
export default function StakingActions({ staking, busy = null, onAction }: Props): JSX.Element {
  const { t } = useTranslate()
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'
  const btnColor = isDark ? '#7EDBB8' : '#0D352C'

  const available = ORDER.filter(({ action }) => action in staking.actions)

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('staking.actions.title')}
        </Typography>

        <Stack direction='row' spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {available.map(({ action, icon }) => {
            const refusal = staking.actions[action] ?? null
            const leaving = LEAVING.includes(action)
            const disabled = refusal !== null || busy !== null
            const color = leaving ? theme.palette.error.main : btnColor

            const button = (
              <span style={{ display: 'inline-block' }}>
                <Button
                  variant='outlined'
                  startIcon={<Iconify icon={icon} />}
                  disabled={disabled}
                  onClick={() => onAction(action)}
                  data-testid={`staking-action-${action}`}
                  sx={{
                    px: 3,
                    py: 1.2,
                    color,
                    borderColor: color,
                    borderWidth: '0.5px',
                    '&:hover': {
                      borderColor: color,
                      bgcolor: alpha(color, 0.06),
                      borderWidth: '0.5px'
                    }
                  }}
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
