'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
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
  polymarketGetPositions,
  polymarketGetOrders,
  polymarketGetPortfolio,
  polymarketCancelOrder
} from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import { fNumber } from 'src/utils/format-number'

import type {
  IPolymarketOrder,
  IPolymarketPosition,
  IPolymarketPortfolio
} from 'src/types/polymarket'

// ----------------------------------------------------------------------

export default function PolymarketPortfolio() {
  const { t } = useTranslate()
  const theme = useTheme()

  const [portfolio, setPortfolio] = useState<IPolymarketPortfolio | null>(null)
  const [positions, setPositions] = useState<IPolymarketPosition[]>([])
  const [orders, setOrders] = useState<IPolymarketOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [portfolioRes, positionsRes, ordersRes] = await Promise.all([
        polymarketGetPortfolio(),
        polymarketGetPositions(),
        polymarketGetOrders()
      ])
      if (portfolioRes.ok && portfolioRes.data) setPortfolio(portfolioRes.data)
      if (positionsRes.ok && positionsRes.data) setPositions(positionsRes.data)
      if (ordersRes.ok && ordersRes.data) setOrders(ordersRes.data)
    } catch {
      // Silently fail, empty state shown
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const result = await polymarketCancelOrder(orderId)
      if (result.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId))
      }
    } catch {
      // Silently fail
    } finally {
      setCancellingId(null)
    }
  }

  if (isLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      {/* Portfolio Summary */}
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
              ${fNumber(portfolio?.total_value || 0)}
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
              color={(portfolio?.total_pnl || 0) >= 0 ? 'success.main' : 'error.main'}
            >
              {(portfolio?.total_pnl || 0) >= 0 ? '+' : ''}${fNumber(portfolio?.total_pnl || 0)}
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
              {portfolio?.positions_count || 0}
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
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08) }}
          />
        </Stack>

        {positions.length === 0 ? (
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
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((pos, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Typography variant='subtitle2' noWrap sx={{ maxWidth: 200 }}>
                        {pos.market?.question || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pos.outcome}
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
                      <Typography variant='body2'>{Math.round(pos.avg_price * 100)}¢</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2'>
                        {Math.round(pos.current_price * 100)}¢
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography
                        variant='body2'
                        fontWeight={700}
                        color={pos.pnl >= 0 ? 'success.main' : 'error.main'}
                      >
                        {pos.pnl >= 0 ? '+' : ''}${fNumber(pos.pnl)}
                      </Typography>
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
            label={orders.length}
            size='small'
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.08) }}
          />
        </Stack>

        {orders.length === 0 ? (
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
                      <Typography variant='body2'>
                        {Math.round(order.price * 100)}¢
                      </Typography>
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
    </Stack>
  )
}
