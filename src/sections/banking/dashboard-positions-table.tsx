'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import ButtonGroup from '@mui/material/ButtonGroup'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { POLYMARKET_REFRESH } from 'src/config-global'
import {
  polymarketCancelOrder,
  polymarketPurchase,
  useGetPolymarketTradesSWR,
  useGetPolymarketClosedPositionsSWR
} from 'src/app/api/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useSWRConfig } from 'swr'

import Iconify from 'src/components/iconify'
import { fNumber } from 'src/utils/format-number'
import { toEpochMs } from 'src/utils/format-time'

import type { IPolymarketOrder, IPolymarketPosition } from 'src/types/polymarket'

import { usePolymarketActivity } from './polymarket-activity-context'

// ----------------------------------------------------------------------

const STEP_LABELS: Record<string, string> = {
  submitting: 'Submitting',
  account_creation: 'Creating account',
  bridge: 'Bridging funds',
  order_placement: 'Placing order',
  done: 'Complete'
}

type Props = {
  positions: IPolymarketPosition[]
  orders: IPolymarketOrder[]
  isLoading: boolean
}

export default function DashboardPositionsTable({ positions, orders, isLoading }: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const { t } = useTranslate()
  const theme = useTheme()

  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [partialSellAnchor, setPartialSellAnchor] = useState<HTMLElement | null>(null)
  const [partialSellPos, setPartialSellPos] = useState<IPolymarketPosition | null>(null)
  const [partialSellAmount, setPartialSellAmount] = useState('')

  // Optimistic order tracking lives in a dashboard-level context, so progress
  // (and polling) survives closing this drawer and page reloads.
  const { pendingOps, sellingPosKeys, startSell, attachPurchaseId, completeOp, failOp } =
    usePolymarketActivity()

  // In-flight buy/sell orders to show in the Open Orders section.
  const activePurchases = useMemo(
    () => pendingOps.filter((op) => op.status === 'processing' && op.kind !== 'claim'),
    [pendingOps]
  )

  // Fetch trade history and closed positions
  const { data: trades = [] } = useGetPolymarketTradesSWR(POLYMARKET_REFRESH.HISTORY_MS)
  const { data: closedPositions = [], isLoading: isClosedLoading } =
    useGetPolymarketClosedPositionsSWR(POLYMARKET_REFRESH.HISTORY_MS)

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const result = await polymarketCancelOrder(orderId)
      if (result.ok) {
        mutate(
          (key: any) =>
            Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders')
        )
      }
    } catch {
      // Silently fail
    } finally {
      setCancellingId(null)
    }
  }

  const handleSellPosition = async (pos: IPolymarketPosition, overrideSize?: number) => {
    const posKey = (pos.market?.condition_id || pos.conditionId) + pos.outcome

    const token = pos.market?.tokens?.find((tk: any) => tk.outcome === pos.outcome)
    const tokenId = pos.asset || pos.token_id || token?.token_id

    if (!tokenId) {
      enqueueSnackbar('Token ID not found', { variant: 'error' })
      return
    }

    const sellSize = overrideSize ?? Math.floor(pos.size * 1e6) / 1e6
    const sellPrice = pos.current_price ?? pos.curPrice ?? 0
    const marketTitle = pos.title || pos.market_title || pos.market?.question || '—'
    const marketSlug = pos.slug || pos.market_slug || pos.market?.slug

    // Optimistically register the order — the position row moves to Open Orders
    // immediately and is tracked by the context (survives drawer close / reload).
    const opId = startSell({
      posKey,
      marketTitle,
      marketSlug,
      outcome: pos.outcome,
      size: sellSize,
      price: sellPrice
    })

    try {
      const res = await polymarketPurchase({
        token_id: tokenId,
        side: 'SELL',
        size: sellSize,
        price: sellPrice,
        bridge_amount: '0'
      })
      if (res.ok) {
        const purchaseId = res.data?.purchase_id
        if (purchaseId) {
          attachPurchaseId(opId, purchaseId)
        } else {
          // No id to poll — resolve optimistically and revalidate.
          completeOp(opId)
        }
      } else {
        failOp(opId, res.message || 'Error executing sell')
        enqueueSnackbar(res.message || 'Error executing sell', { variant: 'error' })
      }
    } catch {
      failOp(opId, 'Error executing sell')
      enqueueSnackbar('Error executing sell', { variant: 'error' })
    }
  }

  const handlePartialSell = () => {
    if (!partialSellPos) return
    const amount = parseFloat(partialSellAmount)
    if (!amount || amount <= 0 || amount > partialSellPos.size) return
    setPartialSellAnchor(null)
    handleSellPosition(partialSellPos, Math.floor(amount * 1e6) / 1e6)
    setPartialSellPos(null)
    setPartialSellAmount('')
  }

  const filteredPositions = positions.filter(
    (p) => !sellingPosKeys.has((p.market?.condition_id || p.conditionId) + p.outcome)
  )

  // Build a lookup map from condition_id to position data for enriching trades
  const positionByConditionId = useMemo(() => {
    const map = new Map<string, IPolymarketPosition>()
    for (const p of [...positions, ...closedPositions]) {
      const cid = p.market?.condition_id || p.conditionId
      if (cid && !map.has(cid)) map.set(cid, p)
    }
    return map
  }, [positions, closedPositions])

  // Aggregate BUY trade sizes per conditionId+outcome for computing closed position sizes
  const tradeSizeByKey = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of trades) {
      if (t.side !== 'BUY') continue
      const cid = t.conditionId || t.condition_id || ''
      const outcome = t.outcome || ''
      const key = `${cid}:${outcome}`
      map.set(key, (map.get(key) || 0) + (t.size || 0))
    }
    return map
  }, [trades])

  if (isLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      {/* Header with toggle */}
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='h5' fontWeight={700}>
          My Positions
        </Typography>

        {/* Active / Closed Toggle */}
        <Box
          sx={{
            display: 'flex',
            p: 0.5,
            borderRadius: 50,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
            bgcolor: alpha(theme.palette.grey[500], 0.04)
          }}
        >
          {(['active', 'closed'] as const).map((tab) => (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 50,
                cursor: 'pointer',
                typography: 'subtitle2',
                fontWeight: 600,
                transition: 'all 0.2s',
                ...(activeTab === tab
                  ? {
                      bgcolor: 'background.paper',
                      boxShadow: theme.customShadows.z1,
                      color: 'text.primary'
                    }
                  : {
                      color: 'text.secondary'
                    })
              }}
            >
              {tab === 'active' ? 'Active' : 'Closed'}
            </Box>
          ))}
        </Box>
      </Stack>

      {/* Positions Table */}
      {activeTab === 'active' ? (
        <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
          {filteredPositions.length === 0 ? (
            <Stack alignItems='center' spacing={1.5} sx={{ py: 6 }}>
              <Iconify
                icon='solar:graph-up-bold-duotone'
                width={48}
                sx={{ color: 'text.disabled', mb: 2 }}
              />
              <Typography variant='body2' color='text.secondary'>
                {t('polymarket.no-positions')}
              </Typography>
            </Stack>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Market</TableCell>
                    <TableCell align='right'>Avg Price</TableCell>
                    <TableCell align='right'>Current</TableCell>
                    <TableCell align='right'>Value</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPositions.map((pos, idx) => {
                    const posKey = (pos.market?.condition_id || pos.conditionId) + pos.outcome
                    const avgPrice = pos.avg_price ?? pos.avgPrice ?? 0
                    const currentPrice = pos.current_price ?? pos.curPrice ?? 0
                    const pnlVal = pos.pnl ?? pos.cashPnl ?? 0
                    const pnlRounded =
                      (Math.floor(Math.abs(pnlVal) * 1e2) / 1e2) * (pnlVal < 0 ? -1 : 1)
                    const valueUsd = pos.size * currentPrice

                    return (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Stack direction='row' alignItems='center' spacing={2}>
                            {pos.icon || pos.market?.image ? (
                              <Box
                                component='img'
                                src={pos.icon || pos.market?.image}
                                alt=''
                                loading='lazy'
                                decoding='async'
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Iconify
                                  icon='solar:chart-bold'
                                  width={20}
                                  sx={{ color: 'text.secondary' }}
                                />
                              </Box>
                            )}
                            <Stack spacing={0.5}>
                              <Link
                                href={
                                  pos.slug || pos.market_slug || pos.market?.slug
                                    ? `/dashboard/polymarket/${pos.slug || pos.market_slug || pos.market?.slug}`
                                    : '#'
                                }
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <Typography
                                  variant='subtitle2'
                                  sx={{ '&:hover': { textDecoration: 'underline' }, maxWidth: 400 }}
                                >
                                  {pos.title || pos.market_title || pos.market?.question || '—'}
                                </Typography>
                              </Link>
                              <Stack direction='row' alignItems='center' spacing={1}>
                                <Chip
                                  label={pos.outcome}
                                  size='small'
                                  sx={{
                                    fontWeight: 600,
                                    height: 22,
                                    bgcolor: alpha(
                                      pos.outcome?.toLowerCase() === 'yes'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                      0.1
                                    ),
                                    color:
                                      pos.outcome?.toLowerCase() === 'yes'
                                        ? theme.palette.success.dark
                                        : theme.palette.error.dark
                                  }}
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {fNumber(pos.size)} shares
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell align='right'>
                          <Typography variant='body2'>{Math.round(avgPrice * 100)}¢</Typography>
                        </TableCell>

                        <TableCell align='right'>
                          <Typography variant='body2'>{Math.round(currentPrice * 100)}¢</Typography>
                        </TableCell>

                        <TableCell align='right'>
                          <Stack alignItems='flex-end'>
                            <Typography variant='subtitle2' fontWeight={700}>
                              ${fNumber(valueUsd)} USD
                            </Typography>
                            {(() => {
                              // Compute the % from the cost basis instead of trusting the API's
                              // percent field, whose units are ambiguous (percent vs. fraction).
                              const costBasis = pos.initialValue ?? avgPrice * pos.size
                              const pctRounded =
                                costBasis > 0 ? Math.round((pnlVal / costBasis) * 10000) / 100 : 0
                              return (
                                <Typography
                                  variant='caption'
                                  fontWeight={600}
                                  color={pnlVal >= 0 ? 'success.main' : 'error.main'}
                                >
                                  {pnlRounded === 0
                                    ? '$0.00'
                                    : `${pnlVal > 0 ? '+' : '-'}$${fNumber(Math.abs(pnlRounded))} (${pctRounded > 0 ? '+' : ''}${fNumber(pctRounded)}%)`}
                                </Typography>
                              )
                            })()}
                          </Stack>
                        </TableCell>

                        <TableCell align='right'>
                          {currentPrice >= 1 ? (
                            <Button
                              size='small'
                              color='success'
                              variant='contained'
                              disabled={sellingPosKeys.has(posKey)}
                              onClick={() => handleSellPosition(pos)}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {sellingPosKeys.has(posKey) ? (
                                <CircularProgress size={14} color='inherit' />
                              ) : (
                                t('polymarket.claim-amount', { amount: fNumber(valueUsd) })
                              )}
                            </Button>
                          ) : (
                            <ButtonGroup
                              size='small'
                              color='error'
                              variant='contained'
                              disabled={sellingPosKeys.has(posKey)}
                            >
                              <Button
                                onClick={() => handleSellPosition(pos)}
                                sx={{ whiteSpace: 'nowrap', minWidth: 76 }}
                              >
                                {sellingPosKeys.has(posKey) ? (
                                  <CircularProgress size={14} color='inherit' />
                                ) : (
                                  t('polymarket.sell-all')
                                )}
                              </Button>
                              <Button
                                sx={{ px: 0.5, minWidth: 28 }}
                                onClick={(e) => {
                                  setPartialSellPos(pos)
                                  setPartialSellAmount(String(Math.floor(pos.size * 1e6) / 1e6))
                                  setPartialSellAnchor(e.currentTarget)
                                }}
                              >
                                <Iconify icon='eva:chevron-down-fill' width={16} />
                              </Button>
                            </ButtonGroup>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Open Orders Section */}
          {(activePurchases.length > 0 || orders.length > 0) && (
            <>
              <Divider />
              <Stack sx={{ px: 3, py: 2.5 }}>
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Typography variant='h6' fontWeight={700}>
                    {t('polymarket.open-orders')}
                  </Typography>
                  <Chip
                    label={activePurchases.length + orders.length}
                    size='small'
                    sx={{
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.warning.main, 0.16),
                      color: 'warning.main'
                    }}
                  />
                </Stack>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('polymarket.market')}</TableCell>
                      <TableCell>{t('polymarket.side')}</TableCell>
                      <TableCell>{t('polymarket.outcome')}</TableCell>
                      <TableCell align='right'>{t('polymarket.size')}</TableCell>
                      <TableCell align='right'>{t('polymarket.price')}</TableCell>
                      <TableCell align='right'>{t('polymarket.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activePurchases.map((ap) => (
                      <TableRow
                        key={ap.id}
                        sx={{
                          '@keyframes softPulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 }
                          },
                          animation: 'softPulse 2s ease-in-out infinite'
                        }}
                      >
                        <TableCell>
                          <Typography variant='subtitle2' noWrap sx={{ maxWidth: 200 }}>
                            {ap.marketTitle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ap.side}
                            size='small'
                            sx={{
                              fontWeight: 600,
                              bgcolor: alpha(
                                ap.side === 'BUY'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                                0.1
                              ),
                              color:
                                ap.side === 'BUY'
                                  ? theme.palette.success.dark
                                  : theme.palette.error.dark
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{ap.outcome}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600}>
                            {fNumber(ap.size ?? 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2'>
                            {Math.round((ap.price ?? 0) * 100)}¢
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Chip
                            icon={
                              <CircularProgress size={12} sx={{ color: 'inherit !important' }} />
                            }
                            label={STEP_LABELS[ap.step] || ap.step}
                            size='small'
                            sx={{
                              fontWeight: 600,
                              bgcolor: theme.palette.text.primary,
                              color: theme.palette.background.paper,
                              '& .MuiChip-icon': { color: 'inherit' },
                              pointerEvents: 'none'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant='subtitle2' noWrap sx={{ maxWidth: 200 }}>
                            {order.market?.question || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.side}
                            size='small'
                            sx={{
                              fontWeight: 600,
                              bgcolor: alpha(
                                order.side === 'BUY'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                                0.1
                              ),
                              color:
                                order.side === 'BUY'
                                  ? theme.palette.success.dark
                                  : theme.palette.error.dark
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{order.outcome}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600}>
                            {fNumber(order.size)}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2'>{Math.round(order.price * 100)}¢</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Button
                            size='small'
                            color='error'
                            variant='soft'
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            startIcon={
                              cancellingId === order.id ? (
                                <CircularProgress size={14} color='inherit' />
                              ) : (
                                <Iconify icon='solar:close-circle-bold' width={16} />
                              )
                            }
                          >
                            {t('polymarket.cancel')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Card>
      ) : (
        /* Closed positions tab */
        <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
          {isClosedLoading ? (
            <Stack alignItems='center' sx={{ py: 6 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : closedPositions.length === 0 ? (
            <Stack alignItems='center' spacing={1.5} sx={{ py: 8 }}>
              <Iconify
                icon='solar:archive-bold-duotone'
                width={48}
                sx={{ color: 'text.disabled', mb: 2 }}
              />
              <Typography variant='body2' color='text.secondary'>
                No closed positions
              </Typography>
            </Stack>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Market</TableCell>
                    <TableCell align='right'>Avg Price</TableCell>
                    <TableCell align='right'>Size</TableCell>
                    <TableCell align='right'>P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {closedPositions.map((pos, idx) => {
                    const avgPrice = pos.avg_price ?? pos.avgPrice ?? 0
                    const pnlVal = pos.pnl ?? pos.cashPnl ?? 0
                    // Compute size: use pos.size if non-zero, then initialValue, then derive from trades
                    const cid = pos.market?.condition_id || pos.conditionId || ''
                    const tradeKey = `${cid}:${pos.outcome || ''}`
                    const derivedSize = tradeSizeByKey.get(tradeKey) || 0
                    const displaySize = pos.size || pos.initialValue || derivedSize

                    return (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Stack direction='row' alignItems='center' spacing={2}>
                            {pos.icon || pos.market?.image ? (
                              <Box
                                component='img'
                                src={pos.icon || pos.market?.image}
                                alt=''
                                loading='lazy'
                                decoding='async'
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Iconify
                                  icon='solar:chart-bold'
                                  width={18}
                                  sx={{ color: 'text.disabled' }}
                                />
                              </Box>
                            )}
                            <Stack spacing={0.25}>
                              <Typography variant='subtitle2' sx={{ maxWidth: 300 }}>
                                {pos.title || pos.market_title || pos.market?.question || '—'}
                              </Typography>
                              <Chip
                                label={pos.outcome}
                                size='small'
                                sx={{
                                  fontWeight: 600,
                                  height: 20,
                                  width: 'fit-content',
                                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                                  color: 'text.secondary'
                                }}
                              />
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2'>{Math.round(avgPrice * 100)}¢</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600}>
                            {displaySize ? fNumber(displaySize) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography
                            variant='body2'
                            fontWeight={700}
                            color={pnlVal >= 0 ? 'success.main' : 'error.main'}
                          >
                            {pnlVal === 0
                              ? '$0.00'
                              : `${pnlVal > 0 ? '+' : '-'}$${fNumber(Math.abs(pnlVal))}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Trade History */}
      {trades.length > 0 && (
        <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ px: 3, py: 2.5 }}
          >
            <Typography variant='h6' fontWeight={700}>
              Trade History
            </Typography>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Side</TableCell>
                  <TableCell>Market</TableCell>
                  <TableCell align='right'>Size</TableCell>
                  <TableCell align='right'>Price</TableCell>
                  <TableCell align='right'>Date</TableCell>
                  <TableCell align='center' sx={{ width: 48 }}>
                    TX
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map((trade, idx) => {
                  const date = new Date(toEpochMs(trade.timestamp))
                  const dateStr = date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })
                  const timeStr = date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  // Use actual API fields (title, slug, conditionId) with normalized aliases as fallback
                  const tradeConditionId = trade.conditionId || trade.condition_id
                  const matchedPos = tradeConditionId
                    ? positionByConditionId.get(tradeConditionId)
                    : undefined
                  const marketTitle =
                    trade.title ||
                    trade.market_title ||
                    matchedPos?.title ||
                    matchedPos?.market_title ||
                    matchedPos?.market?.question ||
                    '—'
                  const marketSlug =
                    trade.slug ||
                    trade.market_slug ||
                    matchedPos?.slug ||
                    matchedPos?.market_slug ||
                    matchedPos?.market?.slug ||
                    ''
                  const txHash = trade.transactionHash || trade.tx_hash || trade.bridge_tx_hash

                  return (
                    <TableRow key={trade.transactionHash || trade.id || idx} hover>
                      <TableCell>
                        <Chip
                          label={trade.side}
                          size='small'
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha(
                              trade.side === 'BUY'
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              0.1
                            ),
                            color:
                              trade.side === 'BUY'
                                ? theme.palette.success.dark
                                : theme.palette.error.dark
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={marketSlug ? `/dashboard/polymarket/${marketSlug}` : '#'}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Typography
                            variant='body2'
                            noWrap
                            sx={{ maxWidth: 200, '&:hover': { textDecoration: 'underline' } }}
                          >
                            {marketTitle}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' fontWeight={600}>
                          {fNumber(trade.size)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2'>{Math.round(trade.price * 100)}¢</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Stack alignItems='flex-end'>
                          <Typography variant='caption' fontWeight={600}>
                            {dateStr}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {timeStr}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align='center'>
                        {txHash ? (
                          <Tooltip title='View transaction'>
                            <a
                              href={`https://polygonscan.com/tx/${txHash}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{ color: 'inherit' }}
                            >
                              <Iconify
                                icon='solar:link-round-bold'
                                width={18}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'primary.main' }
                                }}
                              />
                            </a>
                          </Tooltip>
                        ) : (
                          <Iconify
                            icon='solar:link-broken-bold'
                            width={18}
                            sx={{ color: 'text.disabled' }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Popover
        open={Boolean(partialSellAnchor)}
        anchorEl={partialSellAnchor}
        onClose={() => {
          setPartialSellAnchor(null)
          setPartialSellPos(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack sx={{ p: 2, width: 220 }} spacing={1.5}>
          <Typography variant='subtitle2'>{t('polymarket.partial-sell')}</Typography>
          <TextField
            label={t('polymarket.amount')}
            type='number'
            size='small'
            value={partialSellAmount}
            onChange={(e) => setPartialSellAmount(e.target.value)}
            inputProps={{ min: 0.000001, max: partialSellPos?.size, step: 0.01 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Typography variant='caption' color='text.secondary'>
                    / {partialSellPos ? Math.floor(partialSellPos.size * 1e6) / 1e6 : 0}
                  </Typography>
                </InputAdornment>
              )
            }}
            helperText={
              partialSellAmount && Number(partialSellAmount) > 0 && partialSellPos
                ? `≈ $${(Number(partialSellAmount) * (partialSellPos.current_price ?? partialSellPos.curPrice ?? 0)).toFixed(2)}`
                : ' '
            }
          />
          <Button
            fullWidth
            size='small'
            color='error'
            variant='contained'
            disabled={
              !partialSellAmount ||
              Number(partialSellAmount) <= 0 ||
              Number(partialSellAmount) > (partialSellPos?.size ?? 0)
            }
            onClick={handlePartialSell}
          >
            {t('polymarket.sell-x-shares', { amount: partialSellAmount })}
          </Button>
        </Stack>
      </Popover>
    </Stack>
  )
}
