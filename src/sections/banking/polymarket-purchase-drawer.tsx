import { useState, useEffect } from 'react'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link, Skeleton } from '@mui/material'

import { useTranslate } from 'src/locales'
import { paths } from 'src/routes/paths'

import DashboardDrawer from './dashboard-drawer'
import { polymarketPurchaseStatus } from 'src/app/api/hooks/use-polymarket'
import {
  PurchaseSummary,
  PurchaseBridgeOrder,
  PurchaseSteps,
  PurchaseError
} from './polymarket-purchase-drawer-sections'

import type { ITransaction } from 'src/types/wallet'
import type { IPolymarketPurchaseStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: () => void
  purchaseId: string
  transaction: ITransaction
}

/**
 * Drawer with the full detail of a Polymarket buy/sell: status, amounts,
 * bridge & order data, step timeline and error info. Fetches the live purchase
 * status each time it opens.
 * @param {Props} props - Open state, purchase id and the transaction row.
 * @returns {JSX.Element} The drawer.
 */
export default function PolymarketPurchaseDrawer({
  open,
  onClose,
  purchaseId,
  transaction
}: Props) {
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

  const marketLink = transaction.polymarket_market_slug
    ? paths.dashboard.polymarket.detail(transaction.polymarket_market_slug)
    : null

  const hasBridgeOrOrder = !!(
    transaction.polymarket_bridge_tx_hash ||
    transaction.polymarket_bridge_amount ||
    transaction.polymarket_order_id
  )

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
          <PurchaseSummary
            transaction={transaction}
            details={details}
            txStatus={txStatus}
            statusLabelColor={statusLabelColor}
          />

          {hasBridgeOrOrder && <PurchaseBridgeOrder transaction={transaction} isSell={isSell} />}

          {details?.steps && details.steps.length > 0 && <PurchaseSteps steps={details.steps} />}

          {(details?.error || transaction.user_notes) && isFailed && (
            <PurchaseError message={details?.error || transaction.user_notes || ''} />
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
