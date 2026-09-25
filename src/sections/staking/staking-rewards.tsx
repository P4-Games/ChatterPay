'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit } from './staking-amount'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
}

/**
 * Every reward credit ever observed, newest first.
 *
 * This is a record of what was earned, not a balance. The same ada may have been withdrawn and spent
 * long ago, so nothing here is summed into a total — the withdrawable figure lives in the summary
 * card, which reads it from the reward account rather than from this history.
 */
export default function StakingRewards({ staking }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card } = useStakingStyles()

  if (staking.rewards.length === 0) {
    return (
      <Card sx={card}>
        <Typography variant='subtitle2'>{t('staking.rewards.title')}</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {t('staking.rewards.empty')}
        </Typography>
      </Card>
    )
  }

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1 }}>
        {t('staking.rewards.title')}
      </Typography>

      {/* Scrolls inside the card rather than widening the page, which is what keeps a phone from
          panning the whole screen sideways to read a column. */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size='small' sx={{ '& td, & th': { px: 1, py: 0.75, border: 0 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.rewards.epoch')}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.rewards.source')}</TableCell>
              <TableCell align='right' sx={{ color: 'text.secondary' }}>
                {t('staking.rewards.amount')}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staking.rewards.map((reward) => (
              <TableRow
                key={`${reward.epoch}-${reward.sourceType ?? 'unknown'}`}
                data-testid='staking-reward-row'
              >
                <TableCell>{reward.epoch}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{reward.sourceType ?? '—'}</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {formatAdaWithUnit(reward.lovelace)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  )
}
