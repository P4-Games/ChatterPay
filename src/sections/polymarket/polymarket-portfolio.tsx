'use client'

import { useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import ButtonGroup from '@mui/material/ButtonGroup'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import {
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR,
  useGetPolymarketTradesSWR,
  useGetWalletBalance,
  polymarketCancelOrder,
  polymarketPurchase,
  polymarketPurchaseStatus,
  polymarketBridgeWithdraw
} from 'src/app/api/hooks'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useSWRConfig } from 'swr'

import Iconify from 'src/components/iconify'

import { fNumber } from 'src/utils/format-number'

import type { IPolymarketPosition } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type ActivePurchase = {
  purchase_id: string
  side: 'BUY' | 'SELL'
  outcome: string
  size: number
  price: number
  market_title: string
  current_step: string
  status: string
}

const STEP_LABELS: Record<string, string> = {
  submitting: 'polymarket.submitting',
  account_creation: 'polymarket.creating-account',
  bridge: 'polymarket.bridging-funds',
  order_placement: 'polymarket.placing-order',
  done: 'polymarket.complete'
}

export default function PolymarketPortfolio() {
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const { t } = useTranslate()
  const theme = useTheme()

  const { user } = useAuthContext()
  const { data: portfolio } = useGetPolymarketPortfolioSWR(10000)
  const { data: positions = [] } = useGetPolymarketPositionsSWR(10000)
  const { data: orders = [], isLoading: isOrdersLoading } = useGetPolymarketOrdersSWR(10000)
  const { data: trades = [] } = useGetPolymarketTradesSWR(30000)
  const { data: balanceData, isLoading: isBalanceLoading } = useGetWalletBalance(user?.wallet || '')

  const polyBalance = balanceData?.polymarket
  const idleUsdc = polyBalance?.idle_usdc ?? 0
  const totalUsd = polyBalance?.total_usd ?? 0

  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [sellingPos, setSellingPos] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [activePurchases, setActivePurchases] = useState<ActivePurchase[]>([])
  const [soldPositionKeys, setSoldPositionKeys] = useState<Set<string>>(new Set())
  const [partialSellAnchor, setPartialSellAnchor] = useState<HTMLElement | null>(null)
  const [partialSellPos, setPartialSellPos] = useState<IPolymarketPosition | null>(null)
  const [partialSellAmount, setPartialSellAmount] = useState('')

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
    setSellingPos(posKey)

    const token = pos.market?.tokens?.find((tk: any) => tk.outcome === pos.outcome)
    const tokenId = pos.asset || pos.token_id || token?.token_id

    if (!tokenId) {
      enqueueSnackbar(t('polymarket.token-id-not-found'), { variant: 'error' })
      setSellingPos(null)
      return
    }

    const sellSize = overrideSize ?? Math.floor(pos.size * 1e6) / 1e6
    const sellPrice = pos.current_price
    const tempId = `temp-${Date.now()}`
    const marketTitle = pos.title || pos.market_title || pos.market?.question || '—'

    setActivePurchases((prev) => [
      ...prev,
      {
        purchase_id: tempId,
        side: 'SELL',
        outcome: pos.outcome,
        size: sellSize,
        price: sellPrice,
        market_title: marketTitle,
        current_step: 'submitting',
        status: 'processing'
      }
    ])

    try {
      const res = await polymarketPurchase({
        token_id: tokenId,
        side: 'SELL',
        size: sellSize,
        price: sellPrice,
        bridge_amount: '0'
      })
      if (res.ok) {
        const purchaseId = res.data?.purchase_id || tempId
        setSoldPositionKeys((prev) => new Set(prev).add(posKey))
        setActivePurchases((prev) =>
          prev.map((p) =>
            p.purchase_id === tempId
              ? { ...p, purchase_id: purchaseId, current_step: 'order_placement' }
              : p
          )
        )

        const poll = async () => {
          try {
            const statusRes = await polymarketPurchaseStatus(purchaseId)
            if (statusRes.ok && statusRes.data) {
              const st = statusRes.data.status
              const step = statusRes.data.current_step || ''
              setActivePurchases((prev) =>
                prev.map((p) =>
                  p.purchase_id === purchaseId ? { ...p, current_step: step, status: st } : p
                )
              )
              if (st === 'completed') {
                clearInterval(pollInterval)
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar(t('polymarket.sell-completed'), { variant: 'success' })
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/positions')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio')
                )
                mutate(
                  (key: any) =>
                    Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance')
                )
                setSoldPositionKeys((prev) => {
                  const n = new Set(prev)
                  n.delete(posKey)
                  return n
                })
              } else if (st === 'failed') {
                clearInterval(pollInterval)
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar(statusRes.data.error || t('polymarket.sell-failed'), {
                  variant: 'error'
                })
                setSoldPositionKeys((prev) => {
                  const n = new Set(prev)
                  n.delete(posKey)
                  return n
                })
              }
            }
          } catch (e) {
            console.error(e)
          }
        }
        poll()
        const pollInterval = setInterval(poll, 4000)
      } else {
        setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
        enqueueSnackbar(res.message || t('polymarket.error-executing-sell'), { variant: 'error' })
      }
    } catch {
      setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
      enqueueSnackbar(t('polymarket.error-executing-sell'), { variant: 'error' })
    } finally {
      setSellingPos(null)
    }
  }

  const handlePartialSell = () => {
    if (!partialSellPos) return
    const amt = parseFloat(partialSellAmount)
    if (!amt || amt <= 0 || amt > partialSellPos.size) return
    setPartialSellAnchor(null)
    handleSellPosition(partialSellPos, Math.floor(amt * 1e6) / 1e6)
    setPartialSellPos(null)
    setPartialSellAmount('')
  }

  const handleClaimSubmit = async () => {
    if (idleUsdc <= 0) {
      enqueueSnackbar(t('polymarket.no-idle-funds'), { variant: 'warning' })
      return
    }

    setIsClaiming(true)
    try {
      const result = await polymarketBridgeWithdraw(idleUsdc.toString())
      if (result.ok) {
        enqueueSnackbar(t('polymarket.claiming-funds-desc'), { variant: 'info' })
        setTimeout(() => {
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance')
          )
          mutate(
            (key: any) =>
              Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio')
          )
          enqueueSnackbar(t('polymarket.balance-updated'), { variant: 'success' })
          setIsClaiming(false)
        }, 40000)
      } else {
        enqueueSnackbar(result.message || t('polymarket.error-claiming'), { variant: 'error' })
        setIsClaiming(false)
      }
    } catch {
      enqueueSnackbar(t('polymarket.error-claiming'), { variant: 'error' })
      setIsClaiming(false)
    }
  }

  if (isOrdersLoading || isBalanceLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    )
  }

  const totalValue =
    totalUsd > 0 ? totalUsd : (portfolio?.total_value ?? portfolio?.totalValue ?? 0)
  const totalPnl = portfolio?.total_pnl ?? portfolio?.totalPnl ?? 0
  const totalPnlRounded = (Math.floor(Math.abs(totalPnl) * 1e2) / 1e2) * (totalPnl < 0 ? -1 : 1)
  const activePositionsCount =
    portfolio?.positions_count ?? portfolio?.positionsCount ?? positions.length

  return (
    <Stack spacing={3}>
      {/* Portfolio Summary */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant='h6' fontWeight={700}>
            {t('polymarket.portfolio-overview')}
          </Typography>
          {idleUsdc > 0 && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Iconify icon='solar:info-circle-bold' width={14} />
              <strong>${fNumber(idleUsdc)} USDC</strong> {t('polymarket.available-in-polygon')}
            </Typography>
          )}
        </Stack>
        {idleUsdc >= 0.01 && (
          <Button
            variant='contained'
            color='primary'
            onClick={handleClaimSubmit}
            disabled={isClaiming}
            startIcon={
              isClaiming ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <Iconify icon='solar:arrow-right-up-bold' />
              )
            }
            sx={{ borderRadius: 1.5, px: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            {isClaiming ? t('polymarket.claiming') : t('polymarket.claim-all-scroll')}
          </Button>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3
        }}
      >
        <Card
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.success.main, 0.06)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
          }}
        >
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              {t('polymarket.total-value')}
            </Typography>
            <Typography variant='h3' fontWeight={800}>
              ${fNumber(totalValue)}
            </Typography>
          </Stack>
        </Card>

        <Card
          sx={{
            p: 3,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
          }}
        >
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              {t('polymarket.total-pnl')}
            </Typography>
            <Typography
              variant='h3'
              fontWeight={800}
              color={totalPnl >= 0 ? 'success.main' : 'error.main'}
            >
              {totalPnlRounded === 0
                ? '$0.00'
                : `${totalPnl > 0 ? '+' : ''}$${fNumber(totalPnlRounded)}`}
            </Typography>
          </Stack>
        </Card>

        <Card
          sx={{
            p: 3,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
          }}
        >
          <Stack spacing={1}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              {t('polymarket.active-positions')}
            </Typography>
            <Typography variant='h3' fontWeight={800}>
              {activePositionsCount}
            </Typography>
          </Stack>
        </Card>
      </Box>

      {/* Open Positions */}
      <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ px: 3, py: 2.5 }}
        >
          <Typography variant='h6' fontWeight={700}>
            {t('polymarket.open-positions')}
          </Typography>
          <Chip
            label={positions.length}
            size='small'
            sx={{
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.16),
              color: 'primary.main'
            }}
          />
        </Stack>

        {positions.filter(
          (p) => !soldPositionKeys.has((p.market?.condition_id || p.conditionId) + p.outcome)
        ).length === 0 ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
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
                  <TableCell>{t('polymarket.market')}</TableCell>
                  <TableCell>{t('polymarket.outcome')}</TableCell>
                  <TableCell align='right'>{t('polymarket.size')}</TableCell>
                  <TableCell align='right'>{t('polymarket.avg-price')}</TableCell>
                  <TableCell align='right'>{t('polymarket.current')}</TableCell>
                  <TableCell align='right'>{t('polymarket.pnl')}</TableCell>
                  <TableCell align='right'>{t('polymarket.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions
                  .filter(
                    (p) =>
                      !soldPositionKeys.has((p.market?.condition_id || p.conditionId) + p.outcome)
                  )
                  .map((pos, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Link
                          href={
                            pos.slug || pos.market_slug
                              ? `/markets/${pos.slug || pos.market_slug}`
                              : '#'
                          }
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Typography
                            variant='subtitle2'
                            noWrap
                            sx={{ maxWidth: 200, '&:hover': { textDecoration: 'underline' } }}
                          >
                            {pos.title || pos.market_title || pos.market?.question || '—'}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            pos.outcome === 'Yes'
                              ? t('common.yes')
                              : pos.outcome === 'No'
                                ? t('common.no')
                                : pos.outcome
                          }
                          size='small'
                          sx={{
                            fontWeight: 600,
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
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' fontWeight={600}>
                          {fNumber(pos.size)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2'>
                          {Math.round((pos.avg_price ?? pos.avgPrice ?? 0) * 100)}¢
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2'>
                          {Math.round((pos.current_price ?? pos.curPrice ?? 0) * 100)}¢
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {(() => {
                          const pnlVal = pos.pnl ?? pos.cashPnl ?? 0
                          const pnlRounded =
                            (Math.floor(Math.abs(pnlVal) * 1e2) / 1e2) * (pnlVal < 0 ? -1 : 1)
                          return (
                            <Typography
                              variant='body2'
                              fontWeight={700}
                              color={pnlVal >= 0 ? 'success.main' : 'error.main'}
                            >
                              {pnlRounded === 0
                                ? '$0.00'
                                : `${pnlVal > 0 ? '+' : ''}$${fNumber(pnlRounded)}`}
                            </Typography>
                          )
                        })()}
                      </TableCell>
                      <TableCell align='right'>
                        {(() => {
                          const posKey =
                            (pos.market?.condition_id || pos.conditionId) + pos.outcome
                          return (
                            <ButtonGroup
                              size='small'
                              color='error'
                              variant='contained'
                              disabled={sellingPos === posKey}
                            >
                              <Button onClick={() => handleSellPosition(pos)}>
                                {sellingPos === posKey ? (
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
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Open Orders */}
      <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ px: 3, py: 2.5 }}
        >
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

        {activePurchases.length === 0 && orders.length === 0 ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
            <Iconify
              icon='solar:document-bold-duotone'
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant='body2' color='text.secondary'>
              {t('polymarket.no-orders')}
            </Typography>
          </Stack>
        ) : (
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
                    key={ap.purchase_id}
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
                        {ap.market_title}
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
                      <Typography variant='body2'>
                        {ap.outcome === 'Yes'
                          ? t('common.yes')
                          : ap.outcome === 'No'
                            ? t('common.no')
                            : ap.outcome}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2' fontWeight={600}>
                        {fNumber(ap.size)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2'>{Math.round(ap.price * 100)}¢</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Chip
                        icon={<CircularProgress size={12} sx={{ color: 'inherit !important' }} />}
                        label={t(STEP_LABELS[ap.current_step] || ap.current_step)}
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
                      <Typography variant='body2'>
                        {order.outcome === 'Yes'
                          ? t('common.yes')
                          : order.outcome === 'No'
                            ? t('common.no')
                            : order.outcome}
                      </Typography>
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
        )}
      </Card>

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
              {t('polymarket.trade-history')}
            </Typography>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('polymarket.side')}</TableCell>
                  <TableCell>{t('polymarket.market')}</TableCell>
                  <TableCell align='right'>{t('polymarket.size')}</TableCell>
                  <TableCell align='right'>{t('polymarket.price')}</TableCell>
                  <TableCell align='right'>{t('polymarket.date')}</TableCell>
                  <TableCell align='center' sx={{ width: 48 }}>
                    {t('polymarket.tx')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map((trade, idx) => {
                  const ts =
                    typeof trade.timestamp === 'number'
                      ? trade.timestamp > 1e12
                        ? trade.timestamp
                        : trade.timestamp * 1000
                      : new Date(trade.timestamp).getTime()
                  const date = new Date(ts)
                  const dateStr = date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })
                  const timeStr = date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const marketTitle = trade.title || trade.market_title || '—'
                  const marketSlug = trade.slug || trade.market_slug || ''
                  const txHash = trade.transactionHash || trade.tx_hash

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
                          href={marketSlug ? `/markets/${marketSlug}` : '#'}
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
                          <a
                            href={`https://polygonscan.com/tx/${txHash}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ color: 'inherit' }}
                          >
                            <Iconify
                              icon='solar:link-round-bold'
                              width={18}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                            />
                          </a>
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
                ? `≈ $${(Number(partialSellAmount) * (partialSellPos.current_price ?? (partialSellPos as any).curPrice ?? 0)).toFixed(2)}`
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
