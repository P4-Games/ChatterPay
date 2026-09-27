'use client'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import { fDateTime } from 'src/utils/format-time'
import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'

import type { GovernanceView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  governance: GovernanceView | null
}

/**
 * Who recorded an event, for the actors a user can tell apart. Other actors, such as the reconciliation
 * job, are internal and the row shows no attribution for them.
 */
const ACTOR_KEYS: Record<string, string> = {
  web: 'governance.history.actorUser',
  chain: 'governance.history.actorChain'
}

// ----------------------------------------------------------------------

/**
 * The credential's vote delegations, newest as the backend orders them.
 *
 * Shared by both layouts of the governance page, so the summary and the detailed view list the same
 * rows in the same shape.
 */
export default function GovernanceHistory({ governance }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card } = useStakingStyles()

  const events = governance?.events ?? []

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: events.length === 0 ? 0.5 : 1 }}>
        {t('governance.history.title')}
      </Typography>

      {events.length === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
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
              sx={{ py: 1.25 }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {t(`governance.current.${event.kind}`, {
                    defaultValue: event.kind,
                    drep: (event.drepIdCip129 ?? '').slice(0, 12) || '—'
                  })}
                </Typography>
                {ACTOR_KEYS[event.actor] && (
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {t(ACTOR_KEYS[event.actor])}
                  </Typography>
                )}
              </Stack>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {fDateTime(new Date(event.requestedAt))}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  )
}
