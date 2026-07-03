import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { Link, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Card, { type CardProps } from '@mui/material/Card'
import ListItemText from '@mui/material/ListItemText'
import Badge, { badgeClasses } from '@mui/material/Badge'
import TableContainer from '@mui/material/TableContainer'

import { useResponsive } from 'src/hooks/use-responsive'
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard'
import { useSnackbar } from 'src/components/snackbar'

import { fNumber } from 'src/utils/format-number'
import { fDate, fTime } from 'src/utils/format-time'
import { maskAddress } from 'src/utils/format-address'

import { useTranslate } from 'src/locales'
import { EXPLORER_L2_URL } from 'src/config-global'
import { paths } from 'src/routes/paths'

const POLYGON_EXPLORER_URL = 'https://polygonscan.com'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Dollar01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import CustomPopover, { usePopover } from 'src/components/custom-popover'
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom
} from 'src/components/table'

import type { ITransaction } from 'src/types/wallet'
import type { IPolymarketPurchaseStatus } from 'src/types/polymarket'
import Avvvatars from 'avvvatars-react'

import DashboardDrawer from 'src/sections/banking/dashboard-drawer'
import { polymarketPurchaseStatus } from 'src/app/api/hooks/use-polymarket'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  isLoading: boolean
  tableData: ITransaction[]
  tableLabels: any
  userWallet: string
  tokenLogos?: Record<string, string>
  hideValues?: boolean
}

export default function BankingRecentTransitions({
  title,
  subheader,
  tableLabels,
  isLoading,
  tableData,
  userWallet,
  tokenLogos = {},
  hideValues = false,
  ...other
}: Props) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const table = useTable()

  // Cap how many rows we mount at once — the history can be very long and
  // rendering every row is the main source of memory pressure on this page.
  const [showAll, setShowAll] = useState(false)
  const MAX_VISIBLE = 20
  const visibleData = showAll ? tableData : (tableData || []).slice(0, MAX_VISIBLE)
  const hasMore = (tableData?.length || 0) > MAX_VISIBLE

  const denseHeight = table.dense ? 56 : 56 + 20
  const notFound = !tableData || !tableData.length

  // ----------------------------------------------------------------------

  const renderTitle = (
    <CardHeader title={title} subheader={subheader} sx={{ mb: 2, px: 3, pt: 3, pb: 0 }} />
  )

  const renderConent = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} sx={{ '& th': { px: 3 } }} />}

          <TableBody>
            {!notFound &&
              visibleData.map((row) => (
                <BankingRecentTransitionsRow
                  key={row.id}
                  userWallet={userWallet}
                  row={row}
                  mdUp={mdUp}
                  hideValues={hideValues}
                  tokenLogos={tokenLogos}
                />
              ))}

            <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(
                table.page,
                table.rowsPerPage,
                (tableData && tableData.length) || 0
              )}
            />

            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )

  const renderContentSkeleton = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} sx={{ '& th': { px: 3 } }} />}

          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell sx={{ pl: 3, py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant='circular' width={48} height={48} sx={{ mr: 2 }} />
                    <Skeleton variant='text' width={160} />
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant='text' width={100} />
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  <Skeleton variant='text' width={140} />
                </TableCell>

                <TableCell align='right' sx={{ pr: 3, py: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1
                    }}
                  >
                    <Skeleton variant='circular' width={32} height={32} />
                    <Skeleton variant='circular' width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )
  const renderActions = hasMore && (
    <Box sx={{ p: 2, textAlign: 'right' }}>
      <Button
        size='small'
        color='inherit'
        onClick={() => setShowAll((prev) => !prev)}
        endIcon={
          <Iconify
            icon={showAll ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            width={18}
            sx={{ ml: -0.5 }}
          />
        }
      >
        {showAll ? t('transactions.table-view-less') : t('transactions.table-view-all')}
      </Button>
    </Box>
  )

  return (
    <Card {...other}>
      {renderTitle}

      {isLoading ? renderContentSkeleton : renderConent}

      {hasMore && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {renderActions}
        </>
      )}
    </Card>
  )
}

// ----------------------------------------------------------------------

type BankingRecentTransitionsRowProps = {
  userWallet: string
  row: ITransaction
  mdUp: boolean
  hideValues: boolean
  tokenLogos: Record<string, string>
}

function isPolymarketTrx(type: string): boolean {
  return type.toLowerCase().startsWith('polymarket')
}

const POLYMARKET_TYPE_MAP: Record<string, 'buy' | 'sell' | 'bridge' | 'claim' | 'withdraw'> = {
  polymarket_buy: 'buy',
  polymarket_sell: 'sell',
  polymarket_claim: 'claim',
  // polymarket_bridge is no longer a standalone record; bridge data is embedded in polymarket_buy
  polymarket_withdraw: 'withdraw',
  polymarket_deposit: 'bridge'
}

function getPolymarketSide(data: ITransaction): 'buy' | 'sell' | 'bridge' | 'claim' | 'withdraw' {
  const type = data.type.toLowerCase()
  const mapped = POLYMARKET_TYPE_MAP[type]
  if (mapped) return mapped

  const notes = (data.user_notes || '').toUpperCase()
  if (notes.includes('SELL')) return 'sell'
  return 'buy'
}

function getContactData(
  userWallet: string,
  data: ITransaction,
  mdUp: boolean
): { contactName: string; contactIdentifier: string; calculatedAmount: string } {
  let contactName: string = ''
  let contactIdentifier: string = ''
  let calculatedAmount: string = ''

  const trxReceive: boolean = userWallet === data.wallet_to

  if (isPolymarketTrx(data.type)) {
    contactIdentifier = ''
    calculatedAmount = fNumber(
      data.polymarket_bridge_amount !== undefined ? data.polymarket_bridge_amount : data.amount
    )
  } else if (data.type.toLowerCase() === 'swap') {
    contactName = (trxReceive ? data.contact_to_name : data.contact_from_name) || ''
    contactIdentifier = (trxReceive ? data.contact_to_phone : data.contact_from_phone) || ''
    calculatedAmount = fNumber(data.amount)
  } else {
    // 'transfer' or 'deposit'
    contactName = (trxReceive ? data.contact_from_name : data.contact_to_name) || ''
    contactIdentifier = (trxReceive ? data.contact_from_phone : data.contact_to_phone) || ''
    // Subtract fee when sending, not when receiving
    calculatedAmount = fNumber(data.amount - (!trxReceive ? data.fee || 0 : 0))
  }

  // case: Identifier is a wallet
  if (contactIdentifier.startsWith('0x')) {
    contactIdentifier = maskAddress(contactIdentifier)
  }

  // hide contact name in mobile
  if (!mdUp) {
    contactName = ''
  }

  return { contactName, contactIdentifier, calculatedAmount }
}

function formatMarketSlug(slug?: string) {
  if (!slug) return 'Market'
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ----------------------------------------------------------------------

type PolymarketPurchaseDrawerProps = {
  open: boolean
  onClose: () => void
  purchaseId: string
  transaction: ITransaction
}

function stepStatusColor(s: string): 'success' | 'error' | 'warning' | 'default' {
  if (s === 'completed') return 'success'
  if (s === 'failed') return 'error'
  if (s === 'pending' || s === 'in_progress') return 'warning'
  return 'default'
}

function stepIconColor(s: string): string {
  if (s === 'completed' || s === 'skipped') return 'success.main'
  if (s === 'failed') return 'error.main'
  if (s === 'pending' || s === 'in_progress') return 'warning.main'
  return 'text.disabled'
}

function stepIcon(s: string): string {
  if (s === 'completed' || s === 'skipped') return 'eva:checkmark-circle-2-fill'
  if (s === 'failed') return 'eva:close-circle-fill'
  return 'eva:clock-outline'
}

function formatStepName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function PolymarketPurchaseDrawer({
  open,
  onClose,
  purchaseId,
  transaction
}: PolymarketPurchaseDrawerProps) {
  const { t } = useTranslate()
  const [details, setDetails] = useState<IPolymarketPurchaseStatus | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (!open || !purchaseId) return
    setIsFetching(true)
    setDetails(null)
    polymarketPurchaseStatus(purchaseId)
      .then((res) => {
        if (res.ok && res.data) setDetails(res.data)
      })
      .finally(() => setIsFetching(false))
  }, [open, purchaseId])

  const txStatus = (details?.status || transaction.status || '').toLowerCase()
  const isCompleted = txStatus === 'completed'
  const isFailed = txStatus === 'failed' || txStatus === 'cancelled'
  const isSell = transaction.type.toLowerCase().includes('sell')

  const statusLabelColor: 'success' | 'error' | 'warning' = isCompleted
    ? 'success'
    : isFailed
      ? 'error'
      : 'warning'

  const marketName = formatMarketSlug(transaction.polymarket_market_slug)
  const txDate = new Date(transaction.date)
  const marketLink = transaction.polymarket_market_slug
    ? paths.dashboard.polymarket.detail(transaction.polymarket_market_slug)
    : null

  return (
    <DashboardDrawer
      open={open}
      onClose={onClose}
      title={
        isSell
          ? t('transactions.polymarket-order-details')
          : t('transactions.polymarket-purchase-details')
      }
    >
      {isFetching ? (
        <Stack spacing={2}>
          <Skeleton variant='rounded' height={40} />
          <Skeleton variant='rounded' height={80} />
          <Skeleton variant='rounded' height={80} />
          <Skeleton variant='rounded' height={120} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='subtitle2' color='text.secondary'>
              {t('transactions.polymarket-status')}
            </Typography>
            <Label color={statusLabelColor} variant='soft'>
              {txStatus}
            </Label>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Market & date */}
          <Stack spacing={1.5}>
            <Box>
              <Typography variant='caption' color='text.secondary' display='block'>
                {t('transactions.polymarket-market')}
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {marketName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box flex={1}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  {t('transactions.polymarket-date')}
                </Typography>
                <Typography variant='body2'>{fDate(txDate, 'dd MMM yyyy')}</Typography>
              </Box>
              <Box flex={1}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  {t('transactions.polymarket-time')}
                </Typography>
                <Typography variant='body2'>{fTime(txDate)}</Typography>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Amounts */}
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box flex={1}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  {t('transactions.polymarket-predicted-amount')}
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {fNumber(transaction.amount)} {transaction.token}
                </Typography>
              </Box>
              {details?.side && (
                <Box flex={1}>
                  <Typography variant='caption' color='text.secondary' display='block'>
                    {t('transactions.polymarket-side')}
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {details.side}
                  </Typography>
                </Box>
              )}
            </Box>

            {(() => {
              const shares = transaction.polymarket_size ?? details?.size
              const price = details?.price
              return shares !== undefined || price !== undefined ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {price !== undefined && (
                    <Box flex={1}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {t('transactions.polymarket-price-per-share')}
                      </Typography>
                      <Typography variant='body2'>${fNumber(price)}</Typography>
                    </Box>
                  )}
                  {shares !== undefined && (
                    <Box flex={1}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        {t('transactions.polymarket-shares')}
                      </Typography>
                      <Typography variant='body2'>{fNumber(shares)}</Typography>
                    </Box>
                  )}
                </Box>
              ) : null
            })()}
          </Stack>

          {/* Bridge & Order detail — only on unified polymarket_buy/sell records */}
          {(transaction.polymarket_bridge_tx_hash ||
            transaction.polymarket_bridge_amount ||
            transaction.polymarket_order_id) && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
                  {t('transactions.polymarket-bridge-order-detail') || 'Bridge & Order'}
                </Typography>
                <Stack spacing={1.5}>
                  {/* Bridge row */}
                  {(transaction.polymarket_bridge_tx_hash ||
                    transaction.polymarket_bridge_amount) && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Iconify icon='eva:swap-outline' width={16} sx={{ color: 'info.main' }} />
                        <Typography variant='caption' color='text.secondary' fontWeight={600}>
                          {isSell
                            ? t('transactions.polymarket-bridge-step-out') ||
                              'Bridge (Polygon → Scroll)'
                            : t('transactions.polymarket-bridge-step-in') ||
                              'Bridge (Scroll → Polygon)'}
                        </Typography>
                      </Box>
                      {transaction.polymarket_bridge_amount != null && (
                        <Typography variant='body2'>
                          {fNumber(transaction.polymarket_bridge_amount)}{' '}
                          {transaction.polymarket_bridge_token || transaction.token}
                        </Typography>
                      )}
                      {transaction.polymarket_bridge_tx_hash && (
                        <Link
                          href={`${EXPLORER_L2_URL}/tx/${transaction.polymarket_bridge_tx_hash}`}
                          target='_blank'
                          rel='noopener'
                          underline='always'
                        >
                          <Typography variant='caption'>
                            {transaction.polymarket_bridge_tx_hash.slice(0, 10)}…
                            {transaction.polymarket_bridge_tx_hash.slice(-6)}
                          </Typography>
                        </Link>
                      )}
                    </Box>
                  )}

                  {/* CLOB order row */}
                  {transaction.polymarket_order_id && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Iconify
                          icon='eva:checkmark-circle-2-fill'
                          width={16}
                          sx={{ color: 'success.main' }}
                        />
                        <Typography variant='caption' color='text.secondary' fontWeight={600}>
                          {t('transactions.polymarket-order-step') || 'CLOB Order'}
                        </Typography>
                      </Box>
                      <Typography
                        variant='caption'
                        sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                      >
                        {transaction.polymarket_order_id}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Steps */}
          {details?.steps && details.steps.length > 0 && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
                  {t('transactions.polymarket-steps')}
                </Typography>
                <Stack spacing={1}>
                  {(() => {
                    let foundFailed = false
                    return details.steps.map((step, idx) => {
                      if (foundFailed) return null
                      if (step.status === 'failed') foundFailed = true
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            bgcolor: 'background.neutral'
                          }}
                        >
                          <Iconify
                            icon={stepIcon(step.status)}
                            width={18}
                            sx={{ color: stepIconColor(step.status), flexShrink: 0 }}
                          />
                          <Typography variant='body2' flex={1}>
                            {formatStepName(step.name)}
                          </Typography>
                          <Label color={stepStatusColor(step.status)} variant='soft'>
                            {step.status}
                          </Label>
                        </Box>
                      )
                    })
                  })()}
                </Stack>
              </Box>
            </>
          )}

          {/* Error */}
          {(details?.error || transaction.user_notes) && isFailed && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Box>
                <Typography variant='subtitle2' color='error.main' sx={{ mb: 0.5 }}>
                  {t('transactions.polymarket-error-detail')}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{
                    display: 'block',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    bgcolor: 'background.neutral',
                    p: 1.5,
                    borderRadius: 1
                  }}
                >
                  {details?.error || transaction.user_notes}
                </Typography>
              </Box>
            </>
          )}

          {/* Market link */}
          {marketLink && (
            <Link href={marketLink} underline='always'>
              <Typography variant='caption'>{t('transactions.polymarket-view-event')}</Typography>
            </Link>
          )}
        </Stack>
      )}
    </DashboardDrawer>
  )
}

// ----------------------------------------------------------------------

function BankingRecentTransitionsRow({
  userWallet,
  row,
  mdUp,
  hideValues,
  tokenLogos
}: BankingRecentTransitionsRowProps) {
  const theme = useTheme()
  const { t } = useTranslate()
  const lightMode = theme.palette.mode === 'light'
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
  const marketLink = row.polymarket_market_slug
    ? paths.dashboard.polymarket.detail(row.polymarket_market_slug)
    : null

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

  let badgeColor: 'success' | 'error' | 'info' = trxReceive ? 'success' : 'error'
  const badgeIcon = ''
  let badgeIconNode: React.ReactNode = trxReceive ? (
    <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' strokeWidth={2} />
  ) : (
    <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} color='white' strokeWidth={2} />
  )

  if (isPolymarket) {
    if (polymarketSide === 'bridge' || polymarketSide === 'withdraw') {
      badgeColor = trxReceive ? 'success' : 'error'
      badgeIconNode = trxReceive ? (
        <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' />
      ) : (
        <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} color='white' />
      )
    } else if (polymarketSide === 'claim') {
      badgeColor = 'success'
      badgeIconNode = <HugeiconsIcon icon={ArrowDownLeft01Icon} size={14} color='white' />
    } else {
      badgeColor = polymarketSide === 'sell' ? 'error' : 'success'
      badgeIconNode = <HugeiconsIcon icon={Dollar01Icon} size={14} color='white' strokeWidth={2} />
    }
  }

  if (isFailed) {
    badgeColor = 'error'
    badgeIconNode = <HugeiconsIcon icon={Cancel01Icon} size={14} color='white' strokeWidth={2} />
  }

  const renderAvatar = (
    <Box sx={{ position: 'relative', mr: 2 }}>
      <Badge
        overlap='circular'
        color={badgeColor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          isPending ? (
            <CircularProgress size={12} sx={{ color: 'inherit' }} />
          ) : (
            (badgeIconNode ?? <Iconify icon={badgeIcon} width={16} />)
          )
        }
        sx={{
          [`& .${badgeClasses.badge}`]: {
            p: 0,
            width: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      >
        {isPolymarket ? (
          <Avatar
            src='/assets/icons/polymarket/logo.svg'
            alt='Polymarket'
            sx={{ width: 48, height: 48 }}
          />
        ) : (
          <Avvvatars
            value={contactName || (trxReceive ? row.wallet_from : row.wallet_to || '')}
            style={contactName ? 'character' : 'shape'}
            size={48}
          />
        )}
      </Badge>
    </Box>
  )

  const renderContentDesktop = (
    <TableRow sx={{ opacity: isPending ? 0.6 : isFailed ? 0.5 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        {renderAvatar}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          {hasPurchaseDetails && (
            <Tooltip
              title={
                polymarketSide === 'sell'
                  ? t('transactions.polymarket-order-details')
                  : t('transactions.polymarket-purchase-details')
              }
            >
              <IconButton size='small' onClick={() => setPurchaseDrawerOpen(true)}>
                <Iconify icon='eva:info-outline' />
              </IconButton>
            </Tooltip>
          )}
          {isRealHash && (
            <Tooltip title='View on Explorer'>
              <Link href={trxLink} target='_blank' rel='noopener'>
                <IconButton size='small'>
                  <Iconify icon='eva:external-link-outline' />
                </IconButton>
              </Link>
            </Tooltip>
          )}
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  )

  const renderContentMobile = (
    <TableRow sx={{ opacity: isPending ? 0.6 : isFailed ? 0.5 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        <Box sx={{ position: 'relative', mr: 1.5 }}>
          <Badge
            overlap='circular'
            color={badgeColor}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isPending ? (
                <CircularProgress size={12} sx={{ color: 'inherit' }} />
              ) : (
                (badgeIconNode ?? <Iconify icon={badgeIcon} width={16} />)
              )
            }
            sx={{
              [`& .${badgeClasses.badge}`]: {
                p: 0,
                width: 20
              }
            }}
          >
            {isPolymarket ? (
              <Avatar
                src='/assets/icons/polymarket/logo.svg'
                alt='Polymarket'
                sx={{ width: 40, height: 40 }}
              />
            ) : (
              <Avvvatars
                value={contactName || (trxReceive ? row.wallet_from : row.wallet_to || '')}
                style={contactName ? 'character' : 'shape'}
                size={40}
              />
            )}
          </Badge>
        </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          {hasPurchaseDetails && (
            <Tooltip
              title={
                polymarketSide === 'sell'
                  ? t('transactions.polymarket-order-details')
                  : t('transactions.polymarket-purchase-details')
              }
            >
              <IconButton size='small' onClick={() => setPurchaseDrawerOpen(true)}>
                <Iconify icon='eva:info-outline' />
              </IconButton>
            </Tooltip>
          )}
          {isRealHash && (
            <Tooltip title='View on Explorer'>
              <Link href={trxLink} target='_blank' rel='noopener'>
                <IconButton size='small'>
                  <Iconify icon='eva:external-link-outline' />
                </IconButton>
              </Link>
            </Tooltip>
          )}
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            size='small'
          >
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </Box>
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
