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

import Iconify from 'src/components/iconify'
import { TransactionRowActions } from 'src/sections/banking/banking-transaction-row-parts'

import { fDate, fTime } from 'src/utils/format-time'
import { useResponsive } from 'src/hooks/use-responsive'
import { useTranslate } from 'src/locales'
import { CARDANO_MAINNET_CHAIN_ID, CARDANO_PREPROD_CHAIN_ID } from 'src/config-chains'

import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit } from './staking-amount'
import { stakingOperationIcon } from './staking-operation-icons'
import StakingOperationDrawer from './staking-operation-drawer'

import type { StakingView, StakingOperationView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
}

/**
 * The chain an operation settled on, read off the wallet's own address.
 *
 * A staking operation is always Cardano, and which of the two networks it is is decided by the
 * address prefix rather than by the deployment's active chain: a position read on preprod has to
 * link to the preprod explorer even where the environment says otherwise.
 *
 * @param walletAddress - The staking wallet's address.
 * @returns The chain id the explorer link is built for.
 */
const chainIdFor = (walletAddress: string): number =>
  walletAddress.startsWith('addr_test1') ? CARDANO_PREPROD_CHAIN_ID : CARDANO_MAINNET_CHAIN_ID

/**
 * Column widths, declared once per layout and applied through a `colgroup`.
 *
 * The table is laid out `fixed`, so these are what both the header and every row measure against.
 * Letting the content size the columns is what drifted a heading away from the cell under it and
 * handed a one-word status a quarter of the table.
 */
const DESKTOP_WIDTHS = ['28%', '18%', '20%', '22%', '12%']
const MOBILE_WIDTHS = ['46%', '34%', '20%']

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
 * cell is the button that opens that panel, the same control the dashboard's own history uses — the
 * labelled button on a wide screen, the chevron on a narrow one, on the same breakpoint.
 *
 * Narrow screens collapse to three columns and drop the header, as the dashboard's history does.
 * Five columns squeezed into a phone either overflow sideways or leave each one too narrow to read,
 * so status travels under the operation and the time under the fee.
 */
export default function StakingHistory({ staking }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card, divider } = useStakingStyles()
  const mdUp = useResponsive('up', 'md')
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

  /** The operation, named and with the icon its action carries elsewhere on the page. */
  const operationCell = (operation: StakingOperationView): JSX.Element => (
    <Stack direction='row' spacing={0.75} alignItems='center' justifyContent='center'>
      <Iconify
        icon={stakingOperationIcon(operation.kind)}
        width={18}
        data-testid='staking-history-icon'
        sx={{ flexShrink: 0, color: 'text.secondary' }}
      />
      <Typography variant='body2' noWrap>
        {t(`staking.actions.${operation.kind}`, { defaultValue: operation.kind })}
      </Typography>
    </Stack>
  )

  /** Where the chain has got to, with the caveat when there is one. */
  const statusCell = (operation: StakingOperationView): JSX.Element => (
    <Stack direction='row' spacing={0.75} alignItems='center' justifyContent='center'>
      <Typography variant='caption' sx={{ color: 'text.secondary' }} noWrap>
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
  )

  // Tabular figures, so the digits of one row sit over the digits of the next. Centred amounts lose
  // the decimal point as an alignment guide, and fixed-width digits are what is left to keep the
  // column from looking ragged.
  const feeCell = (operation: StakingOperationView): JSX.Element => (
    <Typography variant='body2' sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      {operation.networkFeeLovelace ? formatAdaWithUnit(operation.networkFeeLovelace) : '—'}
    </Typography>
  )

  /** Same shape as the dashboard's own history: the day, and the time under it. */
  const dateCell = (operation: StakingOperationView): JSX.Element =>
    operation.createdAt ? (
      <Box sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant='body2' sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {fDate(new Date(operation.createdAt), 'dd MMM yyyy')}
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: 'text.secondary', display: 'block', fontVariantNumeric: 'tabular-nums' }}
        >
          {fTime(new Date(operation.createdAt))}
        </Typography>
      </Box>
    ) : (
      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
        —
      </Typography>
    )

  /**
   * The control that opens the detail panel.
   *
   * Centred by the cell around it rather than by touching the shared component: that button aligns
   * itself to the end of a box it sizes to its own content, so a centred wrapper is all it takes.
   */
  const actionCell = (operation: StakingOperationView): JSX.Element => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <TransactionRowActions dense={!mdUp} onOpenDetails={() => setDetail(operation)} />
    </Box>
  )

  const widths = mdUp ? DESKTOP_WIDTHS : MOBILE_WIDTHS

  return (
    <Card sx={card}>
      <Typography variant='subtitle2' sx={{ mb: 1 }}>
        {t('staking.history.title')}
      </Typography>

      <Table
        size='small'
        sx={{
          width: 1,
          tableLayout: 'fixed',
          '& td, & th': {
            px: 1,
            py: 1.25,
            border: 0,
            textAlign: 'center',
            verticalAlign: 'middle'
          },
          '& tbody tr:not(:last-of-type) td': { borderBottom: divider }
        }}
      >
        <colgroup>
          {widths.map((width) => (
            <col key={width} style={{ width }} />
          ))}
        </colgroup>

        {/* Dropped on a phone, as the dashboard's history drops its own: three columns carrying two
            values each are read by what they say, not by a heading a third of a screen wide. */}
        {mdUp && (
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                {t('staking.history.operation')}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.history.status')}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.history.fee')}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{t('staking.history.date')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
        )}

        <TableBody>
          {staking.operations.map((operation, index) => (
            <TableRow
              key={`${operation.txId ?? 'no-tx'}-${index}`}
              data-testid='staking-history-row'
              sx={{ height: mdUp ? 64 : 72 }}
            >
              {mdUp ? (
                <>
                  <TableCell>{operationCell(operation)}</TableCell>
                  <TableCell>{statusCell(operation)}</TableCell>
                  <TableCell>{feeCell(operation)}</TableCell>
                  <TableCell>{dateCell(operation)}</TableCell>
                  <TableCell>{actionCell(operation)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <Stack spacing={0.5} alignItems='center'>
                      {operationCell(operation)}
                      {statusCell(operation)}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} alignItems='center'>
                      {feeCell(operation)}
                      {dateCell(operation)}
                    </Stack>
                  </TableCell>
                  <TableCell>{actionCell(operation)}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <StakingOperationDrawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        operation={detail}
        chainId={chainIdFor(staking.walletAddress)}
      />
    </Card>
  )
}
