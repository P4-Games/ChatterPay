import { useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import TableCell from '@mui/material/TableCell'
import ListItemText from '@mui/material/ListItemText'

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard'
import { useSnackbar } from 'src/components/snackbar'

import { fDate, fTime } from 'src/utils/format-time'

import { useTranslate } from 'src/locales'
import { EXPLORER_L2_URL } from 'src/config-global'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Dollar01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons'

import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'
import Avvvatars from 'avvvatars-react'

import PolymarketPurchaseDrawer from './polymarket-purchase-drawer'
import {
  isPolymarketTrx,
  getPolymarketSide,
  getContactData,
  formatMarketSlug,
  formatStepName
} from './banking-transaction-helpers'
import type { PolymarketSide } from './banking-transaction-helpers'
import { TransactionRowAvatar, TransactionRowActions } from './banking-transaction-row-parts'
import type { RowBadge } from './banking-transaction-row-parts'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

const POLYGON_EXPLORER_URL = 'https://polygonscan.com'

function getRowBadge(
  polymarketSide: PolymarketSide | null,
  trxReceive: boolean,
  isFailed: boolean
): RowBadge {
  if (isFailed) {
    return {
      color: 'error',
      icon: <HugeiconsIcon icon={Cancel01Icon} size={14} color='white' strokeWidth={2} />
    }
  }

  if (polymarketSide) {
    if (polymarketSide === 'bridge' || polymarketSide === 'withdraw') {
      return {
        color: trxReceive ? 'success' : 'error',
        icon: trxReceive ? (
          <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' />
        ) : (
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} color='white' />
        )
      }
    }
    if (polymarketSide === 'claim') {
      return {
        color: 'success',
        icon: <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' />
      }
    }
    return {
      color: polymarketSide === 'sell' ? 'error' : 'success',
      icon: <HugeiconsIcon icon={Dollar01Icon} size={14} color='white' strokeWidth={2} />
    }
  }

  return {
    color: trxReceive ? 'success' : 'error',
    icon: trxReceive ? (
      <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' strokeWidth={2} />
    ) : (
      <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} color='white' strokeWidth={2} />
    )
  }
}

type Props = {
  userWallet: string
  row: ITransaction
  mdUp: boolean
  hideValues: boolean
  tokenLogos: Record<string, string>
}

/**
 * One row of the recent-transactions table, with desktop and mobile layouts,
 * the more-menu popover and the Polymarket purchase-details drawer.
 * @param {Props} props - Row data and display options.
 * @returns {JSX.Element} The table row.
 */
export default function BankingRecentTransitionsRow({
  userWallet,
  row,
  mdUp,
  hideValues,
  tokenLogos
}: Props) {
  const { t } = useTranslate()
  const trxReceive: boolean = userWallet === row.wallet_to
  const isPolymarket = isPolymarketTrx(row.type)
  const polymarketSide = isPolymarket ? getPolymarketSide(row) : null
  const { contactName, contactIdentifier, calculatedAmount } = getContactData(userWallet, row, mdUp)

  const { enqueueSnackbar } = useSnackbar()
  const { copy } = useCopyToClipboard()

  let message: string
  let errorMessageToCopy: string | null = null

  const statusLower = (row.status || '').toLowerCase()
  const isPending =
    statusLower === 'pending' || statusLower === 'submitted' || statusLower === 'in_progress'
  const isFailed = statusLower === 'failed' || statusLower === 'cancelled'

  if (isPolymarket) {
    const formattedSlug = formatMarketSlug(row.polymarket_market_slug)
    const hasEnrichedNotes =
      row.user_notes && (row.user_notes.startsWith('BUY: ') || row.user_notes.startsWith('SELL: '))

    if (polymarketSide === 'claim' || polymarketSide === 'withdraw') {
      message = isFailed
        ? t('transactions.polymarket-claim-failed')
        : t('transactions.polymarket-claim-msg')
      if (isFailed) errorMessageToCopy = row.user_notes || 'Unknown error'
    } else if (isFailed && (polymarketSide === 'buy' || polymarketSide === 'sell')) {
      message =
        polymarketSide === 'buy'
          ? t('transactions.polymarket-failed-buy', { market: formattedSlug })
          : t('transactions.polymarket-failed-sell', { market: formattedSlug })

      errorMessageToCopy = row.user_notes || 'Unknown error'
    } else if ((polymarketSide === 'buy' || polymarketSide === 'sell') && !hasEnrichedNotes) {
      message =
        polymarketSide === 'buy'
          ? `${t('transactions.polymarket-buy')}: ${formattedSlug}`
          : `${t('transactions.polymarket-sell')}: ${formattedSlug}`
    } else if (row.user_notes) {
      message = row.user_notes
    } else {
      if (polymarketSide === 'sell') message = t('transactions.polymarket-sell')
      else if (polymarketSide === 'buy') message = t('transactions.polymarket-buy')
      else
        message = trxReceive
          ? t('transactions.polymarket-transfer-from')
          : t('transactions.polymarket-transfer-to')
    }
  } else {
    message = `${trxReceive ? t('transactions.receive-from') : t('transactions.sent-to')} ${contactName}`
  }

  // For unified polymarket_buy rows the bridge tx hash is the meaningful on-chain link
  const bridgeTxHash = row.polymarket_bridge_tx_hash
  const isRealHash =
    (bridgeTxHash && bridgeTxHash.startsWith('0x')) ||
    (row.trx_hash && row.trx_hash.startsWith('0x'))
  const explorerBase = row.chain_id === 534352 ? EXPLORER_L2_URL : POLYGON_EXPLORER_URL
  const trxLink =
    bridgeTxHash && bridgeTxHash.startsWith('0x')
      ? `${EXPLORER_L2_URL}/tx/${bridgeTxHash}`
      : `${explorerBase}/tx/${row.trx_hash}`

  // Live step label for optimistic (in-flight) records.
  const pendingStepLabel = row.polymarket_pending_step
    ? formatStepName(row.polymarket_pending_step)
    : null

  const popover = usePopover()
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false)

  const hasPurchaseDetails =
    isPolymarket &&
    (polymarketSide === 'buy' || polymarketSide === 'sell') &&
    !!row.polymarket_purchase_id

  const handleCopyError = () => {
    if (errorMessageToCopy) {
      copy(errorMessageToCopy)
      enqueueSnackbar(t('transactions.polymarket-error-copied') || 'Error copied!')
    }
  }

  // Mask amount if enabled
  const displayAmount = hideValues ? '***' : calculatedAmount

  const handleDownload = () => {
    popover.onClose()
    console.info('DOWNLOAD', row.id)
  }

  const handlePrint = () => {
    popover.onClose()
    console.info('PRINT', row.id)
  }

  const handleShare = () => {
    popover.onClose()
    console.info('SHARE', row.id)
  }

  const tokenLogo = tokenLogos[row.token]

  const renderTokenIcon = (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 1,
        flexShrink: 0
      }}
    >
      {tokenLogo ? (
        <Box
          component='img'
          src={tokenLogo}
          alt={row.token}
          loading='lazy'
          decoding='async'
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%'
          }}
        />
      ) : (
        <Avvvatars
          value={row.token}
          style='character'
          size={24}
          displayValue={row.token.substring(0, 2)}
        />
      )}
    </Box>
  )

  const badge = getRowBadge(polymarketSide, trxReceive, isFailed)

  const detailsTooltip = hasPurchaseDetails
    ? polymarketSide === 'sell'
      ? t('transactions.polymarket-order-details')
      : t('transactions.polymarket-purchase-details')
    : null

  const rowActions = (
    <TransactionRowActions
      detailsTooltip={detailsTooltip}
      onOpenDetails={() => setPurchaseDrawerOpen(true)}
      explorerLink={isRealHash ? trxLink : null}
      popoverOpen={popover.open !== null}
      onOpenPopover={popover.onOpen}
      dense={!mdUp}
    />
  )

  const renderContentDesktop = (
    <TableRow sx={{ opacity: isPending ? 0.6 : isFailed ? 0.5 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        <TransactionRowAvatar
          row={row}
          contactName={contactName}
          trxReceive={trxReceive}
          isPending={isPending}
          badge={badge}
          size={48}
        />
        <ListItemText
          primary={message}
          secondary={pendingStepLabel || contactIdentifier}
          secondaryTypographyProps={
            pendingStepLabel ? { color: 'warning.main', fontWeight: 600 } : undefined
          }
          sx={{ minWidth: 0 }}
        />
      </TableCell>

      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderTokenIcon}
          <Box>
            {displayAmount} {row.token}
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 2, whiteSpace: 'nowrap' }}>
        <Typography variant='body2'>{fDate(new Date(row.date), 'dd MMM yyyy')}</Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {fTime(new Date(row.date))}
        </Typography>
      </TableCell>

      <TableCell align='right' sx={{ py: 2, pr: 3 }}>
        {rowActions}
      </TableCell>
    </TableRow>
  )

  const renderContentMobile = (
    <TableRow sx={{ opacity: isPending ? 0.6 : isFailed ? 0.5 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        <TransactionRowAvatar
          row={row}
          contactName={contactName}
          trxReceive={trxReceive}
          isPending={isPending}
          badge={badge}
          size={40}
        />
        <ListItemText
          primary={message}
          secondary={
            <>
              {pendingStepLabel ? (
                <Box component='span' sx={{ color: 'warning.main', fontWeight: 600 }}>
                  {pendingStepLabel}
                </Box>
              ) : (
                contactIdentifier
              )}
              <Box component='span' sx={{ display: 'block', mt: 0.5 }}>
                {`${fDate(new Date(row.date))} ${fTime(new Date(row.date))}`}
              </Box>
            </>
          }
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
          sx={{ minWidth: 0, flex: 1 }}
        />
      </TableCell>

      <TableCell sx={{ textAlign: 'right', py: 2, whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {renderTokenIcon}
          <ListItemText
            primary={`${displayAmount} ${row.token}`}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </Box>
      </TableCell>

      <TableCell align='right' sx={{ py: 2, pr: 3 }}>
        {rowActions}
      </TableCell>
    </TableRow>
  )

  return (
    <>
      {mdUp ? renderContentDesktop : renderContentMobile}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow='right-top'
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleDownload}>
          <Iconify icon='eva:cloud-download-fill' />
          {t('transactions.table-download')}
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon='solar:printer-minimalistic-bold' />
          {t('transactions.table-print')}
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon='solar:share-bold' />
          {t('transactions.table-share')}
        </MenuItem>
      </CustomPopover>

      {hasPurchaseDetails && (
        <PolymarketPurchaseDrawer
          open={purchaseDrawerOpen}
          onClose={() => setPurchaseDrawerOpen(false)}
          purchaseId={row.polymarket_purchase_id!}
          transaction={row}
        />
      )}
    </>
  )
}
