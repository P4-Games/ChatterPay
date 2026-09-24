'use client'

import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Tooltip from '@mui/material/Tooltip'
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
  /** Where a transaction id links to, with a trailing slash. Absent hides the links. */
  explorerUrl?: string
}

/** How much of a transaction id is enough to recognise it without wrapping the column. */
const ID_PREFIX = 10

// ----------------------------------------------------------------------

/**
 * What has been done to this position, and what is still in the air.
 *
 * The distinction this table exists to make is between an operation the chain has settled and one it
 * has not. An unsettled row is marked as informative and is never presented as a completed fact: on
 * Cardano a submitted transaction can still be dropped, and a history that shows "sent" as though it
 * meant "done" is a history that is briefly wrong in the direction that matters.
 */
export default function StakingHistory({ staking, explorerUrl }: Props): JSX.Element {
  const { t } = useTranslate()

  if (staking.operations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h6'>{t('staking.history.title')}</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
            {t('staking.history.empty')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('staking.history.title')}
        </Typography>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>{t('staking.history.operation')}</TableCell>
              <TableCell>{t('staking.history.status')}</TableCell>
              <TableCell>{t('staking.history.transaction')}</TableCell>
              <TableCell align='right'>{t('staking.history.fee')}</TableCell>
              <TableCell align='right'>{t('staking.history.date')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staking.operations.map((operation, index) => (
              <TableRow
                key={`${operation.txId ?? 'no-tx'}-${index}`}
                data-testid='staking-history-row'
              >
                <TableCell>
                  {t(`staking.actions.${operation.kind}`, { defaultValue: operation.kind })}
                </TableCell>

                <TableCell>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='body2'>{operation.status}</Typography>
                    {!operation.settled && (
                      <Tooltip title={t('staking.history.informativeHint')}>
                        <Chip
                          size='small'
                          variant='outlined'
                          color='warning'
                          label={t('staking.history.informative')}
                          data-testid='staking-history-informative'
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  {operation.txId ? (
                    explorerUrl ? (
                      <Link
                        href={`${explorerUrl}${operation.txId}`}
                        target='_blank'
                        rel='noopener'
                        underline='hover'
                      >
                        {operation.txId.slice(0, ID_PREFIX)}…
                      </Link>
                    ) : (
                      <Typography variant='body2'>{operation.txId.slice(0, ID_PREFIX)}…</Typography>
                    )
                  ) : (
                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell align='right'>
                  {operation.networkFeeLovelace
                    ? formatAdaWithUnit(operation.networkFeeLovelace)
                    : '—'}
                </TableCell>

                <TableCell align='right'>
                  {operation.createdAt ? new Date(operation.createdAt).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
