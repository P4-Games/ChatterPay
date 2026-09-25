'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Tooltip from '@mui/material/Tooltip'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'

import { TransactionRowActions } from 'src/sections/banking/banking-transaction-row-parts'

import { fDate, fTime } from 'src/utils/format-time'
import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit } from './staking-amount'
import StakingOperationDrawer from './staking-operation-drawer'

import type { StakingView, StakingOperationView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
  /** Where a transaction id links to, with a trailing slash. Absent hides the links. */
  explorerUrl?: string
}

// ----------------------------------------------------------------------

/**
 * What has been done to this position, and what is still in the air.
 *
 * The distinction this table exists to make is between an operation the chain has settled and one it
 * has not. An unsettled row is marked as informative and is never presented as a completed fact: on
 * Cardano a submitted transaction can still be dropped, and a history that shows "sent" as though it
 * meant "done" is a history that is briefly wrong in the direction that matters.
 *
 * The transaction id is not a column. A 64-character hash is unreadable at any width a table can
 * give it, so it was shown truncated and led nowhere useful; it lives in the detail panel, where
 * there is room for the whole thing, a control to copy it and a link to an explorer. The row's last
 * cell is the button that opens that panel, the same control the dashboard's own history uses.
 */
export default function StakingHistory({ staking, explorerUrl }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card } = useStakingStyles()
  const [detail, setDetail] = useState<StakingOperationView | null>(null)

  if (staking.operations.length === 0) {
    return (
      <Card sx={card}>
        <Typography variant='subtitle2'>{t('staking.history.title')}</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {t('staking.history.empty')}
        </Typography>
      </Card>
    )
  }

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1 }}>
        {t('staking.history.title')}
      </Typography>

      {/* Scrolls inside the card rather than widening the page. */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size='small' sx={{ '& td, & th': { px: 1, py: 0.75, border: 0 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                {t('staking.history.operation')}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.history.status')}</TableCell>
              <TableCell align='right' sx={{ color: 'text.secondary' }}>
                {t('staking.history.fee')}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.history.date')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {staking.operations.map((operation, index) => (
              <TableRow
                key={`${operation.txId ?? 'no-tx'}-${index}`}
                data-testid='staking-history-row'
              >
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {t(`staking.actions.${operation.kind}`, { defaultValue: operation.kind })}
                </TableCell>

                <TableCell>
                  <Stack direction='row' spacing={0.75} alignItems='center'>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {operation.status}
                    </Typography>
                    {!operation.settled && (
                      <Tooltip title={t('staking.history.informativeHint')}>
                        <Chip
                          size='small'
                          variant='outlined'
                          color='warning'
                          label={t('staking.history.informative')}
                          data-testid='staking-history-informative'
                          sx={{ height: 20, fontSize: '0.6875rem' }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>

                <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                  {operation.networkFeeLovelace
                    ? formatAdaWithUnit(operation.networkFeeLovelace)
                    : '—'}
                </TableCell>

                {/* Same shape as the dashboard's own history: the day, and the time under it. */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {operation.createdAt ? (
                    <>
                      <Typography variant='body2'>
                        {fDate(new Date(operation.createdAt), 'dd MMM yyyy')}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', display: 'block' }}
                      >
                        {fTime(new Date(operation.createdAt))}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell align='right'>
                  <TransactionRowActions dense onOpenDetails={() => setDetail(operation)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <StakingOperationDrawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        operation={detail}
        {...(explorerUrl === undefined ? {} : { explorerUrl })}
      />
    </Card>
  )
}
