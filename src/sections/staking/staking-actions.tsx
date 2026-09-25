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
 * shape is kept all the way to the screen: a disabled control carries the reason it is disabled as a
 * line under it. "Delegate your voting power first" is something a user can act on; a greyed-out
 * button with no explanation is something they file a support ticket about. The reason is never folded
 * into the label — a label that changes length per wallet is what breaks the grid — and it is not
 * hidden in a tooltip either, since a disabled control takes no pointer events on a phone.
 *
 * An action the backend did not mention at all is not rendered. That happens when a deployment does
 * not offer it, and inventing a disabled control for it would imply it exists somewhere.
 *
 * Laid out as a grid of equal cells — three per row on a desktop, two on a tablet, one on a phone —
 * so the set reads as things one may do rather than as a form to work through.
 */
export default function StakingActions({ staking, busy = null, onAction }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card, accent, theme } = useStakingStyles()

  const available = ORDER.filter(({ action }) => action in staking.actions)

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
        {t('staking.actions.title')}
      </Typography>

      <Box
        data-testid='staking-actions-grid'
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))'
          }
        }}
      >
        {available.map(({ action, icon }) => {
          const refusal = staking.actions[action] ?? null
          const leaving = LEAVING.includes(action)
          const disabled = refusal !== null || busy !== null
          const color = leaving ? theme.palette.error.main : accent

          return (
            <Box key={action} sx={{ minWidth: 0 }}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<Iconify icon={icon} width={18} />}
                disabled={disabled}
                onClick={() => onAction(action)}
                data-testid={`staking-action-${action}`}
                sx={{
                  height: 44,
                  px: 2,
                  justifyContent: 'flex-start',
                  color,
                  borderColor: color,
                  borderWidth: '0.5px',
                  '&:hover': { borderColor: color, borderWidth: '0.5px' },
                  '& .MuiButton-startIcon': { flexShrink: 0 }
                }}
              >
                <Box
                  component='span'
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t(`staking.actions.${action}`)}
                </Box>
              </Button>

              {refusal !== null && (
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
      </Box>
    </Card>
  )
}
