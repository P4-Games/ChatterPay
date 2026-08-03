'use client'

import dynamic from 'next/dynamic'

import Stack from '@mui/material/Stack'

import { POLYMARKET_REFRESH } from 'src/config-global'
import {
  useGetPolymarketPositionsSWR,
  useGetPolymarketOrdersSWR,
  useGetPolymarketPortfolioSWR,
  useGetPolymarketTradesSWR
} from 'src/app/api/hooks'

import DashboardDrawer from './dashboard-drawer'
import DashboardPositionsTable from './dashboard-positions-table'

// Code-split: the PNL widget (charts) stays out of the initial dashboard bundle.
const PolymarketPNLWidget = dynamic(() => import('src/sections/polymarket/polymarket-pnl-widget'), {
  ssr: false
})

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: VoidFunction
}

/**
 * Dashboard Polymarket drawer: expanded P&L widget plus positions/orders table.
 * Owns its data fetching — SWR polling only runs while the drawer is open, and
 * the cache makes re-opens instant with background revalidation.
 * @param {Props} props - Drawer open state and close handler.
 * @returns {JSX.Element} The drawer.
 */
export default function BankingPolymarketDrawer({ open, onClose }: Props) {
  const { data: positions = [], isLoading: isLoadingPositions } = useGetPolymarketPositionsSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    open
  )
  const { data: orders = [], isLoading: isLoadingOrders } = useGetPolymarketOrdersSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    open
  )
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useGetPolymarketPortfolioSWR(
    POLYMARKET_REFRESH.LIVE_MS,
    open
  )
  const { data: trades = [], isLoading: isLoadingTrades } = useGetPolymarketTradesSWR(
    POLYMARKET_REFRESH.HISTORY_MS,
    undefined,
    open
  )

  return (
    <DashboardDrawer open={open} onClose={onClose} title='Polymarket' width='50vw'>
      <Stack spacing={3}>
        <PolymarketPNLWidget
          variant='expanded'
          portfolioData={portfolioData ?? null}
          positions={positions}
          trades={trades}
          isLoadingExternal={isLoadingPortfolio || isLoadingTrades}
        />
        <DashboardPositionsTable
          positions={positions}
          orders={orders}
          isLoading={isLoadingPositions || isLoadingOrders}
        />
      </Stack>
    </DashboardDrawer>
  )
}
