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

import { useTranslate } from 'src/locales'
import { polymarketPlaceOrder } from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { IPolymarketMarket, IPolymarketAccountStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  market: IPolymarketMarket
  accountStatus: IPolymarketAccountStatus | null
}

export default function PolymarketTradeModule({ market, accountStatus }: Props) {
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

  const canTrade = accountStatus?.has_account && accountStatus?.terms_accepted
  const tokenId = market.tokens?.[selectedOutcome]?.token_id || ''

  const handleSubmit = async () => {
    if (!canTrade || amountNum <= 0 || !tokenId) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await polymarketPlaceOrder({
        token_id: tokenId,
        side: 'BUY',
        size: amountNum,
        price: selectedPrice
      })

      if (result.ok) {
        setSuccess(t('polymarket.order-placed'))
        setAmount('')
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
