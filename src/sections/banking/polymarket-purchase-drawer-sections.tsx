import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { Link } from '@mui/material'

import { fNumber } from 'src/utils/format-number'
import { fDate, fTime } from 'src/utils/format-time'
import { useTranslate } from 'src/locales'
import { EXPLORER_L2_URL } from 'src/config-global'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'

import {
  formatMarketSlug,
  formatStepName,
  stepStatusColor,
  stepIconColor,
  stepIcon
} from './banking-transaction-helpers'

import type { ITransaction } from 'src/types/wallet'
import type { IPolymarketPurchaseStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type SummaryProps = {
  transaction: ITransaction
  details: IPolymarketPurchaseStatus | null
  txStatus: string
  statusLabelColor: 'success' | 'error' | 'warning'
}

/**
 * Purchase drawer header: status label, market name, date/time and amounts.
 * @param {SummaryProps} props - Transaction, fetched details and derived status.
 * @returns {JSX.Element} The summary rows.
 */
export function PurchaseSummary({
  transaction,
  details,
  txStatus,
  statusLabelColor
}: SummaryProps) {
  const { t } = useTranslate()

  const marketName = formatMarketSlug(transaction.polymarket_market_slug)
  const txDate = new Date(transaction.date)
  const shares = transaction.polymarket_size ?? details?.size
  const price = details?.price

  return (
    <>
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

        {(shares !== undefined || price !== undefined) && (
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
        )}
      </Stack>
    </>
  )
}

// ----------------------------------------------------------------------

type BridgeOrderProps = {
  transaction: ITransaction
  isSell: boolean
}

/**
 * Bridge & CLOB order detail — only present on unified polymarket_buy/sell records.
 * @param {BridgeOrderProps} props - Transaction and sell-direction flag.
 * @returns {JSX.Element} Bridge/order rows with a leading divider.
 */
export function PurchaseBridgeOrder({ transaction, isSell }: BridgeOrderProps) {
  const { t } = useTranslate()

  return (
    <>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
          {t('transactions.polymarket-bridge-order-detail') || 'Bridge & Order'}
        </Typography>
        <Stack spacing={1.5}>
          {/* Bridge row */}
          {(transaction.polymarket_bridge_tx_hash || transaction.polymarket_bridge_amount) && (
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
                    ? t('transactions.polymarket-bridge-step-out') || 'Bridge (Polygon → Scroll)'
                    : t('transactions.polymarket-bridge-step-in') || 'Bridge (Scroll → Polygon)'}
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
  )
}

// ----------------------------------------------------------------------

type StepsProps = {
  steps: NonNullable<IPolymarketPurchaseStatus['steps']>
}

/**
 * Purchase step timeline — rows after the first failed step are hidden.
 * @param {StepsProps} props - Steps from the purchase status endpoint.
 * @returns {JSX.Element} Step rows with a leading divider.
 */
export function PurchaseSteps({ steps }: StepsProps) {
  const { t } = useTranslate()

  let foundFailed = false

  return (
    <>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
          {t('transactions.polymarket-steps')}
        </Typography>
        <Stack spacing={1}>
          {steps.map((step) => {
            if (foundFailed) return null
            if (step.status === 'failed') foundFailed = true
            return (
              <Box
                key={step.name}
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
          })}
        </Stack>
      </Box>
    </>
  )
}

// ----------------------------------------------------------------------

type ErrorProps = {
  message: string
}

/**
 * Error detail block shown for failed purchases.
 * @param {ErrorProps} props - Raw error message.
 * @returns {JSX.Element} Error block with a leading divider.
 */
export function PurchaseError({ message }: ErrorProps) {
  const { t } = useTranslate()

  return (
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
          {message}
        </Typography>
      </Box>
    </>
  )
}
