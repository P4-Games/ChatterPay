'use client'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { useTranslate } from 'src/locales'

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
 * long ago, so nothing here is summed into a total — the withdrawable figure lives in the balance
 * panel, which reads it from the reward account rather than from this history.
 */
export default function StakingRewards({ staking }: Props): JSX.Element {
  const { t } = useTranslate()

  if (staking.rewards.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h6'>{t('staking.rewards.title')}</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            {t('staking.rewards.empty')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('staking.rewards.title')}
        </Typography>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>{t('staking.rewards.epoch')}</TableCell>
              <TableCell>{t('staking.rewards.source')}</TableCell>
              <TableCell align='right'>{t('staking.rewards.amount')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staking.rewards.map((reward) => (
              <TableRow
                key={`${reward.epoch}-${reward.sourceType ?? 'unknown'}`}
                data-testid='staking-reward-row'
              >
                <TableCell>{reward.epoch}</TableCell>
                <TableCell>{reward.sourceType ?? '—'}</TableCell>
                <TableCell align='right'>{formatAdaWithUnit(reward.lovelace)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
