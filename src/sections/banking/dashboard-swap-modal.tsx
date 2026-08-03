'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'

import {
  Box,
  Chip,
  Stack,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import Iconify from 'src/components/iconify'
import { fNumber } from 'src/utils/format-number'
import { BOT_WAPP_URL } from 'src/config-global'

import type { IBalance, IToken, CurrencyKey } from 'src/types/wallet'

// ----------------------------------------------------------------------

function parseDecimal(val: any): number {
  if (val && typeof val === 'object' && val.$numberDecimal) return parseFloat(val.$numberDecimal)
  return typeof val === 'number' ? val : 0
}

type LifiQuote = {
  estimate: {
    toAmount: string
    toAmountMin: string
    toAmountUSD: string
    approvalAddress: string
    executionDuration: number
    feeCosts: Array<{
      name: string
      amount: string
      amountUSD: string
      token: { symbol: string; decimals: number }
    }>
    gasCosts: Array<{
      amount: string
      amountUSD: string
    }>
  }
  action: {
    toToken: {
      symbol: string
      decimals: number
      priceUSD: string
    }
  }
}

type Props = {
  open: boolean
  onClose: () => void
  balances: IBalance[]
  tokenLogos: Record<string, string>
  userWallet?: string
  tokens?: IToken[]
  selectedCurrency?: CurrencyKey
}

const SCROLL_CHAIN_ID = 534352
const SWAP_FEE_PERCENT = 0.0025 // 0.25%

// ----------------------------------------------------------------------

export default function DashboardSwapModal({
  open,
  onClose,
  balances,
  tokenLogos,
  userWallet,
  tokens,
  selectedCurrency
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  // Source
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')

  // Destination
  const [destTokenSymbol, setDestTokenSymbol] = useState('')

  // Quote
  const [quote, setQuote] = useState<LifiQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Error
  const [error, setError] = useState('')

  // ----- Computed -----
  const sortedBalances = useMemo(
    () =>
      [...balances]
        .filter((b) => b.balance > 0)
        .sort((a, b) => (b.balance_conv?.usd ?? 0) - (a.balance_conv?.usd ?? 0)),
    [balances]
  )

  const dbTokens = useMemo(() => tokens ?? [], [tokens])

  const selectedBalance = sortedBalances.find((b) => b.token === selectedToken)
  const availableAmount = selectedBalance?.balance ?? 0

  const amountFloat = parseFloat(amount) || 0
  const usdValue =
    availableAmount > 0
      ? (amountFloat / availableAmount) * (selectedBalance?.balance_conv?.usd ?? 0)
      : 0

  const curr = selectedCurrency || 'usd'
  const currValue =
    availableAmount > 0
      ? (amountFloat / availableAmount) * (selectedBalance?.balance_conv?.[curr] ?? 0)
      : 0

  const sourceDbToken = dbTokens.find((tk) => tk.symbol === selectedToken)
  const destDbToken = dbTokens.find((tk) => tk.symbol === destTokenSymbol)

  // Swap operation limits
  const limits = sourceDbToken?.operations_limits?.swap?.L2
  const minLimit = limits ? parseDecimal(limits.min) : 0
  const maxLimit = limits ? parseDecimal(limits.max) : Infinity

  // Fee (0.25%)
  const feeUsd = usdValue * SWAP_FEE_PERCENT

  // Quote output
  const estimatedOutput = useMemo(() => {
    if (!quote || !destDbToken) return 0
    return parseFloat(quote.estimate.toAmount) / 10 ** destDbToken.decimals
  }, [quote, destDbToken])

  const estimatedOutputUsd = quote ? parseFloat(quote.estimate.toAmountUSD || '0') : 0

  const rate = useMemo(() => {
    if (!amountFloat || !estimatedOutput) return 0
    return estimatedOutput / amountFloat
  }, [amountFloat, estimatedOutput])

  // ----- Effects -----

  // Auto-select first token on open
  useEffect(() => {
    if (open && sortedBalances.length > 0 && !selectedToken) {
      setSelectedToken(sortedBalances[0].token)
    }
  }, [open, sortedBalances, selectedToken])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedToken('')
      setAmount('')
      setDestTokenSymbol('')
      setQuote(null)
      setError('')
      setIsLoadingQuote(false)
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)
    }
  }, [open])

  // Fetch quote with debounce
  const fetchQuote = useCallback(() => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)

    if (!sourceDbToken || !destDbToken || !amountFloat || !userWallet) {
      setQuote(null)
      return
    }

    // Don't quote if same token
    if (sourceDbToken.address.toLowerCase() === destDbToken.address.toLowerCase()) {
      setQuote(null)
      return
    }

    setIsLoadingQuote(true)
    quoteTimerRef.current = setTimeout(() => {
      const fromAmount = BigInt(Math.floor(amountFloat * 10 ** sourceDbToken.decimals)).toString()

      const params = new URLSearchParams({
        fromChain: String(SCROLL_CHAIN_ID),
        toChain: String(SCROLL_CHAIN_ID),
        fromToken: sourceDbToken.address,
        toToken: destDbToken.address,
        fromAmount,
        fromAddress: userWallet
      })

      fetch(`/api/v1/proxy/lifi/quote?${params.toString()}`)
        .then((r) => {
          if (!r.ok) throw new Error('Quote failed')
          return r.json()
        })
        .then((data) => {
          if (data.estimate) {
            setQuote(data)
          } else {
            setQuote(null)
          }
        })
        .catch(() => {
          setQuote(null)
        })
        .finally(() => {
          setIsLoadingQuote(false)
        })
    }, 600)
  }, [sourceDbToken, destDbToken, amountFloat, userWallet])

  useEffect(() => {
    fetchQuote()
    return () => {
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)
    }
  }, [fetchQuote])

  // ----- Handlers -----
  const handleMaxClick = () => {
    if (availableAmount > 0) {
      setAmount(String(availableAmount))
      setError('')
    }
  }

  const handleSwap = () => {
    // Validation
    if (!amountFloat || amountFloat <= 0) {
      setError(t('swap.invalid-amount'))
      return
    }
    if (amountFloat > availableAmount) {
      setError(t('swap.exceeds-balance'))
      return
    }
    if (minLimit > 0 && usdValue < minLimit) {
      setError(`Minimum: $${fNumber(minLimit)} USD`)
      return
    }
    if (maxLimit < Infinity && usdValue > maxLimit) {
      setError(`Maximum: $${fNumber(maxLimit)} USD`)
      return
    }
    if (!destDbToken) {
      setError(t('swap.select-token'))
      return
    }

    const message = `Swap ${amountFloat} ${selectedToken} to ${destDbToken.symbol}`
    const url = BOT_WAPP_URL.replaceAll('MESSAGE', encodeURIComponent(message))
    window.open(url, '_blank')
    onClose()
  }

  const canSwap =
    !!selectedToken &&
    amountFloat > 0 &&
    amountFloat <= availableAmount &&
    !!destDbToken &&
    sourceDbToken?.address.toLowerCase() !== destDbToken.address.toLowerCase()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' fontWeight={700}>
            {t('swap.title')}
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Stack spacing={2.5} sx={{ py: 3 }}>
          {/* ---- SOURCE ---- */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              fontWeight={600}
              sx={{ mb: 1, display: 'block' }}
            >
              {t('swap.from')}
            </Typography>

            <Stack direction='row' spacing={1.5} alignItems='flex-start'>
              {/* Token select */}
              <Select
                value={selectedToken}
                onChange={(e) => {
                  setSelectedToken(e.target.value)
                  setQuote(null)
                  setError('')
                }}
                displayEmpty
                size='small'
                sx={{ minWidth: 130 }}
                renderValue={(val) => {
                  if (!val)
                    return (
                      <Typography color='text.secondary' variant='body2'>
                        {t('swap.select-token')}
                      </Typography>
                    )
                  const logo = tokenLogos[val]
                  return (
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {logo && (
                        <Box
                          component='img'
                          src={logo}
                          alt={val}
                          sx={{ width: 22, height: 22, borderRadius: '50%' }}
                        />
                      )}
                      <Typography variant='subtitle2' fontWeight={600}>
                        {val}
                      </Typography>
                    </Stack>
                  )
                }}
              >
                {sortedBalances.map((b) => (
                  <MenuItem key={b.token} value={b.token}>
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                      sx={{ width: '100%' }}
                    >
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        {tokenLogos[b.token] && (
                          <Box
                            component='img'
                            src={tokenLogos[b.token]}
                            alt={b.token}
                            sx={{ width: 24, height: 24, borderRadius: '50%' }}
                          />
                        )}
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600}>
                            {b.token}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {fNumber(b.balance)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant='body2' fontWeight={600}>
                        ${fNumber(b.balance_conv?.usd ?? 0)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>

              {/* Amount input */}
              <TextField
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                placeholder='0.00'
                type='number'
                size='small'
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Chip
                        label={t('swap.max')}
                        size='small'
                        onClick={handleMaxClick}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) }
                        }}
                      />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            {/* Available balance */}
            {selectedToken && (
              <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                {t('swap.available')}: {fNumber(availableAmount)} {selectedToken}
                {usdValue > 0 && ` (~$${fNumber(usdValue)})`}
              </Typography>
            )}
          </Box>

          {/* ---- SWAP ARROW ---- */}
          <Stack alignItems='center'>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main'
              }}
            >
              <Iconify icon='solar:transfer-vertical-bold' width={20} />
            </Box>
          </Stack>

          {/* ---- DESTINATION ---- */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              fontWeight={600}
              sx={{ mb: 1, display: 'block' }}
            >
              {t('swap.to')}
            </Typography>

            <Stack direction='row' spacing={1.5} alignItems='flex-start'>
              {/* Dest token select */}
              <Select
                value={destTokenSymbol}
                onChange={(e) => {
                  setDestTokenSymbol(e.target.value as string)
                  setQuote(null)
                  setError('')
                }}
                size='small'
                sx={{ minWidth: 130 }}
                displayEmpty
                renderValue={(val) => {
                  if (!val)
                    return (
                      <Typography color='text.secondary' variant='body2'>
                        {t('swap.select-token')}
                      </Typography>
                    )
                  const logo = tokenLogos[val]
                  return (
                    <Stack direction='row' alignItems='center' spacing={1}>
                      {logo && (
                        <Box
                          component='img'
                          src={logo}
                          alt={val}
                          sx={{ width: 22, height: 22, borderRadius: '50%' }}
                        />
                      )}
                      <Typography variant='subtitle2' fontWeight={600}>
                        {val}
                      </Typography>
                    </Stack>
                  )
                }}
              >
                {dbTokens.map((tk) => (
                  <MenuItem key={tk.symbol} value={tk.symbol}>
                    <Stack direction='row' alignItems='center' spacing={1.5} sx={{ width: '100%' }}>
                      {tokenLogos[tk.symbol] ? (
                        <Box
                          component='img'
                          src={tokenLogos[tk.symbol]}
                          alt={tk.symbol}
                          sx={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.grey[500], 0.16),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant='caption' fontWeight={700}>
                            {tk.symbol[0]}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant='body2' fontWeight={600}>
                        {tk.symbol}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>

              {/* Estimated output (read-only) */}
              <TextField
                value={estimatedOutput > 0 ? fNumber(estimatedOutput) : ''}
                placeholder='0.00'
                size='small'
                fullWidth
                disabled
                InputProps={{
                  endAdornment: isLoadingQuote ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={16} />
                    </InputAdornment>
                  ) : undefined
                }}
              />
            </Stack>

            {/* Estimated USD value */}
            {estimatedOutputUsd > 0 && (
              <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                ~${fNumber(estimatedOutputUsd)} USD
              </Typography>
            )}
          </Box>

          {/* ---- QUOTE INFO ---- */}
          {quote && destDbToken && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
              }}
            >
              <Stack spacing={1.5}>
                {/* Rate */}
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    {t('swap.rate')}
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    1 {selectedToken} = {fNumber(rate)} {destDbToken.symbol}
                  </Typography>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Estimated output */}
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    {t('swap.estimated-output')}
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    {tokenLogos[destDbToken.symbol] && (
                      <Box
                        component='img'
                        src={tokenLogos[destDbToken.symbol]}
                        alt={destDbToken.symbol}
                        sx={{ width: 18, height: 18, borderRadius: '50%' }}
                      />
                    )}
                    <Typography variant='subtitle2' fontWeight={700}>
                      {fNumber(estimatedOutput)} {destDbToken.symbol}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Fee */}
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    {t('swap.fee')} (0.25%)
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    ~${fNumber(feeUsd)} USD
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Fetching quote indicator */}
          {isLoadingQuote && !quote && amountFloat > 0 && destDbToken && (
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='center'
              spacing={1}
              sx={{ py: 1 }}
            >
              <CircularProgress size={16} />
              <Typography variant='caption' color='text.secondary'>
                {t('swap.fetching-quote')}
              </Typography>
            </Stack>
          )}

          {/* No quote warning */}
          {!isLoadingQuote &&
            !quote &&
            amountFloat > 0 &&
            destDbToken &&
            sourceDbToken?.address.toLowerCase() !== destDbToken.address.toLowerCase() && (
              <Typography variant='caption' color='warning.main' textAlign='center'>
                {t('swap.no-quote')}
              </Typography>
            )}
        </Stack>

        {/* Error */}
        {error && (
          <Typography
            variant='caption'
            color='error.main'
            fontWeight={600}
            sx={{ display: 'block', pb: 1 }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>

      {/* Footer */}
      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          fullWidth
          variant='contained'
          color='primary'
          size='large'
          onClick={handleSwap}
          disabled={!canSwap}
          startIcon={<Iconify icon='ic:round-whatsapp' />}
          sx={{
            py: 1.5,
            fontWeight: 700,
            borderRadius: 50,
            textTransform: 'none',
            fontSize: '0.95rem'
          }}
        >
          {t('swap.swap-via-whatsapp')}
        </Button>
      </Box>
    </Dialog>
  )
}
