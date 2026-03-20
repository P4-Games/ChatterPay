'use client'

import { useState, useEffect, useRef } from 'react'
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
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import {
  polymarketCancelOrder,
  polymarketPurchase,
  polymarketPurchaseStatus
} from 'src/app/api/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useSWRConfig } from 'swr'

import Iconify from 'src/components/iconify'
import { fNumber } from 'src/utils/format-number'

import type {
  IPolymarketOrder,
  IPolymarketPosition
} from 'src/types/polymarket'

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
  submitting: 'Submitting',
  account_creation: 'Creating account',
  bridge: 'Bridging funds',
  order_placement: 'Placing order',
  done: 'Complete',
}

type Props = {
  positions: IPolymarketPosition[]
  orders: IPolymarketOrder[]
  isLoading: boolean
  idleUsdc: number
}

export default function DashboardPositionsTable({
  positions,
  orders,
  isLoading,
  idleUsdc
}: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const { t } = useTranslate()
  const theme = useTheme()

  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [sellingPos, setSellingPos] = useState<string | null>(null)
  const [activePurchases, setActivePurchases] = useState<ActivePurchase[]>([])
  const [soldPositionKeys, setSoldPositionKeys] = useState<Set<string>>(new Set())

  // Track polling intervals for cleanup on unmount
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => () => {
    // Clear all polling intervals on unmount
    pollIntervalsRef.current.forEach((interval) => clearInterval(interval))
  }, [])

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const result = await polymarketCancelOrder(orderId)
      if (result.ok) {
        mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders'))
      }
    } catch {
      // Silently fail
    } finally {
      setCancellingId(null)
    }
  }

  const handleSellPosition = async (pos: IPolymarketPosition) => {
    const posKey = (pos.market?.condition_id || pos.conditionId) + pos.outcome
    setSellingPos(posKey)

    const token = pos.market?.tokens?.find((tk: any) => tk.outcome === pos.outcome)
    if (!token?.token_id) {
      enqueueSnackbar('Token ID not found', { variant: 'error' })
      setSellingPos(null)
      return
    }

    const sellSize = Math.floor(pos.size * 1e6) / 1e6
    const sellPrice = pos.current_price ?? pos.curPrice ?? 0
    const tempId = `temp-${Date.now()}`
    const marketTitle = pos.market_title || pos.title || pos.market?.question || '—'

    setActivePurchases((prev) => [...prev, {
      purchase_id: tempId,
      side: 'SELL',
      outcome: pos.outcome,
      size: sellSize,
      price: sellPrice,
      market_title: marketTitle,
      current_step: 'submitting',
      status: 'processing',
    }])

    try {
      const res = await polymarketPurchase({
        token_id: token.token_id,
        side: 'SELL',
        size: sellSize,
        price: sellPrice,
        bridge_amount: "0"
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
                const interval = pollIntervalsRef.current.get(purchaseId)
                if (interval) { clearInterval(interval); pollIntervalsRef.current.delete(purchaseId) }
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar('Sell order completed', { variant: 'success' })
                mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/positions'))
                mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders'))
                mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio'))
                mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'))
                setSoldPositionKeys((prev) => { const n = new Set(prev); n.delete(posKey); return n })
              } else if (st === 'failed') {
                const interval = pollIntervalsRef.current.get(purchaseId)
                if (interval) { clearInterval(interval); pollIntervalsRef.current.delete(purchaseId) }
                setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== purchaseId))
                enqueueSnackbar(statusRes.data.error || 'Sell failed', { variant: 'error' })
                setSoldPositionKeys((prev) => { const n = new Set(prev); n.delete(posKey); return n })
              }
            }
          } catch (e) { console.error(e) }
        }
        poll()
        const pollInterval = setInterval(poll, 4000)
        pollIntervalsRef.current.set(purchaseId, pollInterval)
      } else {
        setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
        enqueueSnackbar(res.message || 'Error executing sell', { variant: 'error' })
      }
    } catch {
      setActivePurchases((prev) => prev.filter((p) => p.purchase_id !== tempId))
      enqueueSnackbar('Error executing sell', { variant: 'error' })
    } finally {
      setSellingPos(null)
    }
  }

  const filteredPositions = positions.filter(
    (p) => !soldPositionKeys.has((p.market?.condition_id || p.conditionId) + p.outcome)
  )

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
                    const pnlRounded = Math.floor(Math.abs(pnlVal) * 1e2) / 1e2 * (pnlVal < 0 ? -1 : 1)
                    const valueUsd = pos.size * currentPrice

                    return (
                      <TableRow key={idx} hover>
                        {/* Market Column: icon + title + outcome chip + shares */}
                        <TableCell>
                          <Stack direction='row' alignItems='center' spacing={2}>
                            {pos.market?.image ? (
                              <Box
                                component='img'
                                src={pos.market.image}
                                alt=''
                                sx={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
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
                                <Iconify icon='solar:chart-bold' width={20} sx={{ color: 'text.secondary' }} />
                              </Box>
                            )}
                            <Stack spacing={0.5}>
                              <Link
                                href={(pos.market_slug || pos.slug) ? `/dashboard/polymarket/${pos.market_slug || pos.slug}` : '#'}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <Typography
                                  variant='subtitle2'
                                  sx={{ '&:hover': { textDecoration: 'underline' }, maxWidth: 400 }}
                                >
                                  {pos.market_title || pos.title || pos.market?.question || '—'}
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

                        {/* Avg Price */}
                        <TableCell align='right'>
                          <Typography variant='body2'>
                            {Math.round(avgPrice * 100)}¢
                          </Typography>
                        </TableCell>

                        {/* Current Price */}
                        <TableCell align='right'>
                          <Typography variant='body2'>
                            {Math.round(currentPrice * 100)}¢
                          </Typography>
                        </TableCell>

                        {/* Value + P&L */}
                        <TableCell align='right'>
                          <Stack alignItems='flex-end'>
                            <Typography variant='subtitle2' fontWeight={700}>
                              ${fNumber(valueUsd)} USD
                            </Typography>
                            <Typography
                              variant='caption'
                              fontWeight={600}
                              color={pnlVal >= 0 ? 'success.main' : 'error.main'}
                            >
                              {pnlRounded === 0
                                ? '$0.00'
                                : `${pnlVal > 0 ? '+' : '-'}$${fNumber(Math.abs(pnlRounded))} (${pnlVal > 0 ? '+' : ''}${fNumber((pos.pnl_percent ?? pos.percentPnl ?? 0) * 100)}%)`}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align='right'>
                          <Button
                            size='small'
                            color='error'
                            variant='contained'
                            disabled={sellingPos === posKey}
                            onClick={() => handleSellPosition(pos)}
                          >
                            {sellingPos === posKey ? <CircularProgress size={14} color='inherit' /> : 'Sell'}
                          </Button>
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
                    sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.08) }}
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
                        key={ap.purchase_id}
                        sx={{
                          '@keyframes softPulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          },
                          animation: 'softPulse 2s ease-in-out infinite',
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
                                ap.side === 'BUY' ? theme.palette.success.main : theme.palette.error.main,
                                0.1
                              ),
                              color: ap.side === 'BUY' ? theme.palette.success.dark : theme.palette.error.dark
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{ap.outcome}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600}>{fNumber(ap.size)}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2'>{Math.round(ap.price * 100)}¢</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Chip
                            icon={<CircularProgress size={12} sx={{ color: 'inherit !important' }} />}
                            label={STEP_LABELS[ap.current_step] || ap.current_step}
                            size='small'
                            sx={{
                              fontWeight: 600,
                              bgcolor: theme.palette.text.primary,
                              color: theme.palette.background.paper,
                              '& .MuiChip-icon': { color: 'inherit' },
                              pointerEvents: 'none',
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
                                order.side === 'BUY' ? theme.palette.success.main : theme.palette.error.main,
                                0.1
                              ),
                              color: order.side === 'BUY' ? theme.palette.success.dark : theme.palette.error.dark
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{order.outcome}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' fontWeight={600}>{fNumber(order.size)}</Typography>
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
        /* Closed tab - placeholder */
        <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}>
          <Stack alignItems='center' sx={{ py: 8 }}>
            <Iconify
              icon='solar:archive-bold-duotone'
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant='body2' color='text.secondary'>
              No closed positions
            </Typography>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
