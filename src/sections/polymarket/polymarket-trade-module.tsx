'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha, useTheme } from '@mui/material/styles'

import { useSnackbar } from 'src/components/snackbar'
import { useSWRConfig } from 'swr'
import { useTranslate } from 'src/locales'
import { polymarketPurchase, polymarketPurchaseStatus } from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { IPolymarketMarket, IPolymarketAccountStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  market: IPolymarketMarket
  accountStatus: IPolymarketAccountStatus | null
}

export default function PolymarketTradeModule({ market, accountStatus }: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const { mutate } = useSWRConfig()
  const { t } = useTranslate()
  const theme = useTheme()

  const [selectedOutcome, setSelectedOutcome] = useState<number>(0)
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const outcomes = market.outcomes || ['Yes', 'No']
  const prices = (market.outcome_prices || []).map(Number)
  const selectedPrice = prices[selectedOutcome] || 0
  const amountNum = Number.parseFloat(amount) || 0
  const estimatedShares = selectedPrice > 0 ? amountNum / selectedPrice : 0
  const estimatedReturn = estimatedShares * 1 // Each share pays $1 if correct
  const estimatedProfit = estimatedReturn - amountNum

  const canTrade = accountStatus?.account?.has_account && accountStatus?.account?.terms_accepted
  const tokenId = market.tokens?.[selectedOutcome]?.token_id || ''

  const handleSubmit = async () => {
    if (!canTrade || amountNum <= 0 || !tokenId || selectedPrice <= 0) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // `size` = number of prediction tokens, not USD.
      const tokenQuantity = Math.floor((amountNum / selectedPrice) * 100) / 100
      const bridgeAmountWei = Math.floor(amountNum * 1e6).toString()

      const result = await polymarketPurchase({
        token_id: tokenId,
        side: 'BUY',
        size: tokenQuantity,
        price: selectedPrice,
        bridge_amount: bridgeAmountWei
      })

      if (result.ok) {
        setAmount('')
        enqueueSnackbar('Transaction in Progress: Bridging & Placing Order...', { variant: 'info' })
        
        // Optimistically deduct visual balance
        mutate(
          (key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'),
          (currentData: any) => {
            if (!currentData || !currentData.data) return currentData;
            // Best effort optimistic deduction, assume USDC is primary
            const newBal = { ...currentData };
            if (newBal.data.balance) {
               newBal.data.balance = Math.max(0, newBal.data.balance - amountNum);
            }
            return newBal;
          },
          { revalidate: false }
        )

        const purchaseId = result.data?.purchase_id
        if (purchaseId) {
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await polymarketPurchaseStatus(purchaseId)
              if (statusRes.ok && statusRes.data) {
                const st = statusRes.data.status
                if (st === 'completed') {
                  clearInterval(pollInterval)
                  enqueueSnackbar(t('polymarket.order-placed'), { variant: 'success' })
                  // Hard invalidate balance
                  mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'))
                  mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/positions'))
                  mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/orders'))
                  mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/portfolio'))
                } else if (st === 'failed') {
                  clearInterval(pollInterval)
                  enqueueSnackbar(statusRes.data.error || 'Transaction failed', { variant: 'error' })
                  mutate((key: any) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/balance'))
                }
              }
            } catch (e) {
              console.error(e)
            }
          }, 4000)
        }
      } else {
        setError(result.message || t('polymarket.order-error'))
      }
    } catch {
      setError(t('polymarket.order-error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      sx={{
        p: 3,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
      }}
    >
      <Typography variant='h6' sx={{ mb: 3 }}>
        {t('polymarket.trade')}
      </Typography>

      <Stack spacing={3}>
        {/* Outcome selection */}
        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
            {t('polymarket.pick-outcome')}
          </Typography>
          <ToggleButtonGroup
            value={selectedOutcome}
            exclusive
            onChange={(_, val) => {
              if (val !== null) setSelectedOutcome(val)
            }}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                fontWeight: 700,
                borderRadius: '12px !important',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&.Mui-selected': {
                  bgcolor:
                    selectedOutcome === 0
                      ? alpha(theme.palette.success.main, 0.12)
                      : alpha(theme.palette.error.main, 0.12),
                  color:
                    selectedOutcome === 0
                      ? theme.palette.success.dark
                      : theme.palette.error.dark,
                  borderColor:
                    selectedOutcome === 0
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  '&:hover': {
                    bgcolor:
                      selectedOutcome === 0
                        ? alpha(theme.palette.success.main, 0.2)
                        : alpha(theme.palette.error.main, 0.2)
                  }
                }
              }
            }}
          >
            {outcomes.map((outcome, idx) => (
              <ToggleButton key={outcome} value={idx}>
                <Stack direction='row' alignItems='center' spacing={1}>
                  <span>{outcome}</span>
                  <Typography
                    component='span'
                    variant='caption'
                    sx={{ fontWeight: 700, opacity: 0.7 }}
                  >
                    {Math.round((prices[idx] || 0) * 100)}¢
                  </Typography>
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Amount */}
        <TextField
          fullWidth
          label={t('polymarket.amount')}
          type='number'
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError(null)
            setSuccess(null)
          }}
          InputProps={{
            startAdornment: <InputAdornment position='start'>$</InputAdornment>
          }}
          inputProps={{ min: 0, step: 0.01 }}
        />

        {/* Estimate */}
        {amountNum > 0 && (
          <Card
            variant='outlined'
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`
            }}
          >
            <Stack spacing={1}>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='caption' color='text.secondary'>
                  {t('polymarket.shares')}
                </Typography>
                <Typography variant='caption' fontWeight={600}>
                  {estimatedShares.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='caption' color='text.secondary'>
                  {t('polymarket.potential-return')}
                </Typography>
                <Typography variant='caption' fontWeight={600} color='success.main'>
                  ${estimatedReturn.toFixed(2)}
                </Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography variant='caption' color='text.secondary'>
                  {t('polymarket.potential-profit')}
                </Typography>
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color={estimatedProfit >= 0 ? 'success.main' : 'error.main'}
                >
                  {estimatedProfit >= 0 ? '+' : ''}${estimatedProfit.toFixed(2)}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Alerts */}
        {error && <Alert severity='error'>{error}</Alert>}
        {success && <Alert severity='success'>{success}</Alert>}

        {!canTrade && (
          <Alert severity='warning'>{t('polymarket.setup-required')}</Alert>
        )}

        {/* Submit */}
        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={handleSubmit}
          disabled={!canTrade || amountNum <= 0 || isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color='inherit' />
            ) : (
              <Iconify icon='solar:cart-bold' />
            )
          }
          sx={{
            py: 1.5,
            fontWeight: 700,
            fontSize: '1rem',
            bgcolor:
              selectedOutcome === 0
                ? theme.palette.success.main
                : theme.palette.error.main,
            '&:hover': {
              bgcolor:
                selectedOutcome === 0
                  ? theme.palette.success.dark
                  : theme.palette.error.dark
            }
          }}
        >
          {isSubmitting
            ? t('polymarket.placing')
            : `${t('polymarket.buy')} ${outcomes[selectedOutcome]}`}
        </Button>
      </Stack>
    </Card>
  )
}
