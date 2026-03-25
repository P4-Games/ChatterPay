'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'

import {
  Autocomplete,
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
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Divider,
  ListSubheader,
  Tooltip
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import Iconify from 'src/components/iconify'
import { fNumber } from 'src/utils/format-number'
import { BOT_WAPP_URL } from 'src/config-global'

import type { IBalance, ITransaction, IToken } from 'src/types/wallet'

// ----------------------------------------------------------------------

function parseDecimal(val: any): number {
  if (val && typeof val === 'object' && val.$numberDecimal) return parseFloat(val.$numberDecimal)
  return typeof val === 'number' ? val : 0
}

type DestType = 'phone' | 'address'

type ChainData = {
  key: string
  name: string
  id: number
  chainType: string
  logoURI: string
  addressType: 'evm' | 'solana' | 'bitcoin'
}

type LifiToken = {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  priceUSD?: string
}

type RecentDest = {
  label: string
  value: string
  type: DestType
}

// ----------------------------------------------------------------------

const ENS_LOGO = 'https://cryptofonts.com/img/SVG/ens.svg'
const LIFI_CHAINS_URL = 'https://li.quest/v1/chains?chainTypes=EVM,SVM'

const CHAIN_PRIORITY: Record<number, number> = {
  534352: 0,
  1: 1,
  42161: 2,
  8453: 3,
  10: 4,
  137: 5,
  56: 6,
  43114: 7,
  324: 8,
  59144: 9,
  5000: 10,
  100: 11
}

const BITCOIN_CHAIN: ChainData = {
  key: 'btc',
  name: 'Bitcoin',
  id: 20000000000001,
  chainType: 'UTXO',
  logoURI:
    'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bitcoin.svg',
  addressType: 'bitcoin'
}

const SOLANA_CHAIN: ChainData = {
  key: 'sol',
  name: 'Solana',
  id: 1151111081099710,
  chainType: 'SVM',
  logoURI:
    'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg',
  addressType: 'solana'
}

const FALLBACK_CHAINS: ChainData[] = [
  {
    key: 'scl',
    name: 'Scroll',
    id: 534352,
    chainType: 'EVM',
    logoURI:
      'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/scroll.svg',
    addressType: 'evm'
  },
  {
    key: 'eth',
    name: 'Ethereum',
    id: 1,
    chainType: 'EVM',
    logoURI:
      'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg',
    addressType: 'evm'
  },
  {
    key: 'arb',
    name: 'Arbitrum',
    id: 42161,
    chainType: 'EVM',
    logoURI:
      'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg',
    addressType: 'evm'
  },
  {
    key: 'bas',
    name: 'Base',
    id: 8453,
    chainType: 'EVM',
    logoURI:
      'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg',
    addressType: 'evm'
  },
  SOLANA_CHAIN,
  BITCOIN_CHAIN
]

function getAddressType(chainType: string): 'evm' | 'solana' | 'bitcoin' {
  if (chainType === 'SVM') return 'solana'
  return 'evm'
}

function sortChains(chains: ChainData[]): ChainData[] {
  return [...chains].sort((a, b) => {
    const pa = CHAIN_PRIORITY[a.id] ?? 999
    const pb = CHAIN_PRIORITY[b.id] ?? 999
    if (pa !== pb) return pa - pb
    return a.name.localeCompare(b.name)
  })
}

// Address validation
function isValidEvmAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr)
}

function isValidSolAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}

function isValidBtcAddress(addr: string): boolean {
  return /^(bc1[a-zA-HJ-NP-Z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr)
}

function detectChainFromAddress(addr: string): number | null {
  if (isValidBtcAddress(addr)) return 20000000000001
  if (isValidSolAddress(addr) && !isValidEvmAddress(addr)) return 1151111081099710
  return null
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^\+?\d{7,15}$/.test(cleaned)
}

function validateAddress(addr: string, addressType: string): boolean {
  if (addressType === 'bitcoin') return isValidBtcAddress(addr)
  if (addressType === 'solana') return isValidSolAddress(addr)
  return isValidEvmAddress(addr)
}

// ----------------------------------------------------------------------

const STEP_VARIANTS = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 })
}

// ----------------------------------------------------------------------

type CurrencyKey = 'usd' | 'ars' | 'brl' | 'uyu'

type Props = {
  open: boolean
  onClose: () => void
  balances: IBalance[]
  tokenLogos: Record<string, string>
  transactions?: ITransaction[]
  userWallet?: string
  tokens?: IToken[]
  selectedCurrency?: CurrencyKey
}

export default function DashboardWithdrawModal({
  open,
  onClose,
  balances,
  tokenLogos,
  transactions,
  userWallet,
  tokens,
  selectedCurrency
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  // Wizard
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')
  const [isFeeAdded, setIsFeeAdded] = useState(false)

  // Step 2
  const [destType, setDestType] = useState<DestType>('phone')
  const [destination, setDestination] = useState('')
  const [selectedChainId, setSelectedChainId] = useState(534352)
  const [destTokenSymbol, setDestTokenSymbol] = useState('USDT')
  const [tokenSearch, setTokenSearch] = useState('')

  // LI.FI data
  const [chains, setChains] = useState<ChainData[]>(FALLBACK_CHAINS)
  const [lifiTokens, setLifiTokens] = useState<LifiToken[]>([])
  const [isLoadingChains, setIsLoadingChains] = useState(false)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const chainCacheRef = useRef<ChainData[] | null>(null)
  const tokenCacheRef = useRef<Record<string, LifiToken[]>>({})

  // ENS
  const [ensAddress, setEnsAddress] = useState('')
  const [isResolvingEns, setIsResolvingEns] = useState(false)

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

  const selectedBalance = sortedBalances.find((b) => b.token === selectedToken)
  const availableAmount = selectedBalance?.balance ?? 0
  const selectedChain = chains.find((c) => c.id === selectedChainId)

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
  const currRate = usdValue > 0 ? currValue / usdValue : 1

  const tokenPrice =
    availableAmount > 0 ? (selectedBalance?.balance_conv?.usd ?? 0) / availableAmount : 0

  const feeInUsd = 0.08
  const feeInCurr = feeInUsd * currRate
  const feeInTokens = tokenPrice > 0 ? feeInUsd / tokenPrice : 0

  const dbToken = tokens?.find((t) => t.symbol === selectedToken)
  const isL1 = destType === 'address' && selectedChainId === 1
  const limits = dbToken?.operations_limits?.transfer?.[isL1 ? 'L1' : 'L2']

  const minLimit = limits ? parseDecimal(limits.min) : 0
  const maxLimit = limits ? parseDecimal(limits.max) : Infinity

  // ----- Effects -----

  // Auto-select first token
  useEffect(() => {
    if (open && sortedBalances.length > 0 && !selectedToken) {
      setSelectedToken(sortedBalances[0].token)
    }
  }, [open, sortedBalances, selectedToken])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(0)
      setDirection(1)
      setSelectedToken('')
      setAmount('')
      setIsFeeAdded(false)
      setDestType('phone')
      setDestination('')
      setSelectedChainId(534352)
      setDestTokenSymbol('USDT')
      setTokenSearch('')
      setLifiTokens([])
      setEnsAddress('')
      setError('')
    }
  }, [open])

  // Fetch LI.FI chains
  useEffect(() => {
    if (!open) return
    if (chainCacheRef.current) {
      setChains(chainCacheRef.current)
      return
    }

    let cancelled = false
    setIsLoadingChains(true)

    fetch(LIFI_CHAINS_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const rawChains: ChainData[] = (data.chains || [])
          .filter((c: any) => c.mainnet)
          .map((c: any) => ({
            key: c.key,
            name: c.name,
            id: c.id,
            chainType: c.chainType,
            logoURI: c.logoURI || '',
            addressType: getAddressType(c.chainType)
          }))

        // Ensure Solana is present
        if (!rawChains.find((c) => c.id === 1151111081099710)) rawChains.push(SOLANA_CHAIN)
        // Always add Bitcoin
        rawChains.push(BITCOIN_CHAIN)

        const sorted = sortChains(rawChains)
        chainCacheRef.current = sorted
        setChains(sorted)
      })
      .catch(() => {
        if (!cancelled) setChains(FALLBACK_CHAINS)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChains(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  // Fetch LI.FI tokens when chain changes
  useEffect(() => {
    if (destType !== 'address' || !selectedChain) return

    const cacheKey = String(selectedChain.id)
    if (tokenCacheRef.current[cacheKey]) {
      setLifiTokens(tokenCacheRef.current[cacheKey])
      return
    }

    let cancelled = false
    setIsLoadingTokens(true)

    fetch(`https://li.quest/v1/tokens?chains=${selectedChain.id}&minPriceUSD=0.01`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const tokens: LifiToken[] = data.tokens?.[String(selectedChain.id)] || []
        tokens.sort((a, b) => parseFloat(b.priceUSD || '0') - parseFloat(a.priceUSD || '0'))
        tokenCacheRef.current[cacheKey] = tokens
        setLifiTokens(tokens)
      })
      .catch(() => {
        if (!cancelled) setLifiTokens([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTokens(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedChain, destType])

  // Default dest token
  useEffect(() => {
    if (selectedChain?.addressType === 'bitcoin') {
      setDestTokenSymbol('BTC')
    } else if (destTokenSymbol === 'BTC') {
      setDestTokenSymbol('USDT')
    }
  }, [selectedChainId, selectedChain, destTokenSymbol])

  // ENS resolution
  useEffect(() => {
    if (destType !== 'address') {
      setEnsAddress('')
      return
    }
    const trimmed = destination.trim()
    if (!trimmed.endsWith('.eth')) {
      setEnsAddress('')
      return
    }

    const timer = setTimeout(() => {
      setIsResolvingEns(true)
      fetch(`https://api.ensideas.com/ens/resolve/${trimmed}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.address && isValidEvmAddress(data.address)) {
            setEnsAddress(data.address)
          } else {
            setEnsAddress('')
          }
        })
        .catch(() => setEnsAddress(''))
        .finally(() => setIsResolvingEns(false))
    }, 600)

    return () => clearTimeout(timer)
  }, [destination, destType])

  // Filtered tokens
  const filteredLifiTokens = useMemo(() => {
    if (!tokenSearch.trim()) return lifiTokens.slice(0, 80)
    const q = tokenSearch.toLowerCase()
    return lifiTokens
      .filter((tk) => tk.symbol.toLowerCase().includes(q) || tk.name.toLowerCase().includes(q))
      .slice(0, 80)
  }, [lifiTokens, tokenSearch])

  const selectedLifiToken = useMemo(
    () => lifiTokens.find((tk) => tk.symbol === destTokenSymbol),
    [lifiTokens, destTokenSymbol]
  )

  // Recent sends
  const recentSends = useMemo((): RecentDest[] => {
    if (!transactions || !userWallet) return []
    const seen = new Set<string>()
    const result: RecentDest[] = []
    for (const tx of transactions) {
      if (tx.wallet_from?.toLowerCase() !== userWallet.toLowerCase()) continue
      if (tx.wallet_to && !seen.has(tx.wallet_to.toLowerCase())) {
        seen.add(tx.wallet_to.toLowerCase())
        result.push({
          label: tx.contact_to_name || `${tx.wallet_to.slice(0, 6)}...${tx.wallet_to.slice(-4)}`,
          value: tx.wallet_to,
          type: 'address'
        })
      }
      if (tx.contact_to_phone && !seen.has(tx.contact_to_phone)) {
        seen.add(tx.contact_to_phone)
        result.push({
          label: tx.contact_to_name || tx.contact_to_phone,
          value: tx.contact_to_phone,
          type: 'phone'
        })
      }
      if (result.length >= 5) break
    }
    return result
  }, [transactions, userWallet])

  // Phone contacts for autocomplete (deduplicated by phone number)
  const phoneContacts = useMemo(() => {
    if (!transactions || !userWallet) return []
    const seen = new Map<string, { label: string; value: string }>()
    for (const tx of transactions) {
      if (tx.wallet_from?.toLowerCase() !== userWallet.toLowerCase()) continue
      if (tx.contact_to_phone && !seen.has(tx.contact_to_phone)) {
        seen.set(tx.contact_to_phone, {
          label: tx.contact_to_name || tx.contact_to_phone,
          value: tx.contact_to_phone
        })
      }
    }
    return Array.from(seen.values())
  }, [transactions, userWallet])

  // ----- Handlers -----

  const handleAddressChange = useCallback(
    (value: string) => {
      setDestination(value)
      setError('')
      const trimmed = value.trim()
      const detected = detectChainFromAddress(trimmed)
      if (detected) {
        setSelectedChainId(detected)
      } else if (trimmed.endsWith('.eth')) {
        // ENS names resolve to EVM addresses — ensure an EVM chain is selected
        setSelectedChainId((prev) => {
          const currentChain = chains.find((c) => c.id === prev)
          if (currentChain?.addressType !== 'evm') return 534352 // default to Scroll
          return prev
        })
      }
    },
    [chains]
  )

  const handleMaxClick = () => {
    setAmount(String(availableAmount))
    setIsFeeAdded(false)
    setError('')
  }

  const handleToggleFee = () => {
    if (!amountFloat) return
    if (isFeeAdded) {
      setAmount(Math.max(0, amountFloat - feeInTokens).toString())
      setIsFeeAdded(false)
    } else {
      setAmount((amountFloat + feeInTokens).toString())
      setIsFeeAdded(true)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (destType === 'phone') {
        setDestination(text.trim())
      } else {
        handleAddressChange(text.trim())
      }
    } catch {
      /* clipboard not available */
    }
  }

  const goNext = () => {
    if (step === 0) {
      if (!amountFloat || amountFloat <= 0) {
        setError(t('withdraw.invalid-amount'))
        return
      }
      if (amountFloat > availableAmount) {
        setError(t('withdraw.exceeds-balance'))
        return
      }
      if (minLimit > 0 && amountFloat < minLimit) {
        setError(`Min ${minLimit} ${selectedToken}`)
        return
      }
      if (maxLimit < Infinity && amountFloat > maxLimit) {
        setError(`Max ${maxLimit} ${selectedToken}`)
        return
      }
    }
    if (step === 1) {
      // For ENS names, use the resolved address for validation
      const effectiveAddress = ensAddress || destination.trim()
      if (destType === 'phone') {
        if (!isValidPhone(destination.trim())) {
          setError(t('withdraw.invalid-phone'))
          return
        }
      } else if (!selectedChain || !validateAddress(effectiveAddress, selectedChain.addressType)) {
        setError(t('withdraw.invalid-address'))
        return
      }
    }
    setError('')
    setDirection(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  const goBack = () => {
    setError('')
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSend = () => {
    const effectiveAddress = ensAddress || destination.trim()
    let message: string

    if (destType === 'phone') {
      message = `Send ${amountFloat} ${selectedToken} to ${destination.trim()}`
    } else {
      const isCrossChain = destTokenSymbol !== selectedToken || selectedChainId !== 534352
      if (isCrossChain) {
        message = `Send ${amountFloat} ${selectedToken} to ${destTokenSymbol} on ${selectedChain?.name}, ${effectiveAddress}`
      } else {
        message = `Send ${amountFloat} ${selectedToken} to ${effectiveAddress}`
      }
    }

    const url = BOT_WAPP_URL.replaceAll('MESSAGE', encodeURIComponent(message))
    window.open(url, '_blank')
    onClose()
  }

  // ----- Step config -----
  const steps = [
    { label: t('withdraw.step-amount'), icon: 'solar:wallet-money-bold' },
    { label: t('withdraw.step-destination'), icon: 'solar:map-point-bold' },
    { label: t('withdraw.step-review'), icon: 'solar:check-circle-bold' }
  ]

  const canProceedStep0 = !!selectedToken && amountFloat > 0
  const canProceedStep1 = !!destination

  // Chain logo helper
  const chainLogo = (chain: ChainData, size = 22) => (
    <Box
      component='img'
      src={chain.logoURI}
      alt={chain.name}
      sx={{ width: size, height: size, borderRadius: '50%' }}
    />
  )

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
          <Stack direction='row' alignItems='center' spacing={1.5}>
            {step > 0 && (
              <IconButton onClick={goBack} size='small' sx={{ mr: 0.5 }}>
                <Iconify icon='eva:arrow-back-fill' width={20} />
              </IconButton>
            )}
            <Typography variant='h6' fontWeight={700}>
              {t('withdraw.title')}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size='small'>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Step Indicator */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          {steps.map((s, i) => {
            const isActive = i === step
            const isCompleted = i < step
            return (
              <Stack
                key={s.label}
                direction='row'
                alignItems='center'
                spacing={0.75}
                sx={{ flex: 1 }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive
                      ? 'primary.main'
                      : isCompleted
                        ? alpha(theme.palette.primary.main, 0.16)
                        : alpha(theme.palette.grey[500], 0.08),
                    transition: 'all 0.2s'
                  }}
                >
                  {isCompleted ? (
                    <Iconify icon='eva:checkmark-fill' width={16} sx={{ color: 'primary.main' }} />
                  ) : (
                    <Iconify
                      icon={s.icon}
                      width={15}
                      sx={{ color: isActive ? 'primary.contrastText' : 'text.disabled' }}
                    />
                  )}
                </Box>
                <Typography
                  variant='caption'
                  fontWeight={isActive ? 700 : 500}
                  color={isActive ? 'text.primary' : 'text.secondary'}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {s.label}
                </Typography>
                {i < steps.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      borderRadius: 1,
                      bgcolor: isCompleted ? 'primary.main' : alpha(theme.palette.grey[500], 0.16),
                      ml: 0.5
                    }}
                  />
                )}
              </Stack>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Content */}
      <DialogContent
        sx={{ px: 3, py: 0, minHeight: 320, position: 'relative', overflow: 'hidden' }}
      >
        <AnimatePresence initial={false} custom={direction} mode='wait'>
          {/* ============ STEP 0: Token & Amount ============ */}
          {step === 0 && (
            <m.div
              key='step-0'
              custom={direction}
              variants={STEP_VARIANTS}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Stack spacing={3} sx={{ py: 3 }}>
                {/* Token Select */}
                <Stack spacing={1}>
                  <Typography variant='caption' color='text.secondary' fontWeight={600}>
                    {t('withdraw.source-token')}
                  </Typography>
                  <Select
                    value={selectedToken}
                    onChange={(e) => {
                      setSelectedToken(e.target.value)
                      setError('')
                    }}
                    displayEmpty
                    size='small'
                    renderValue={(val) => {
                      if (!val)
                        return (
                          <Typography color='text.secondary'>
                            {t('withdraw.select-token')}
                          </Typography>
                        )
                      const logo = tokenLogos[val]
                      return (
                        <Stack direction='row' alignItems='center' spacing={1.5}>
                          {logo && (
                            <Box
                              component='img'
                              src={logo}
                              alt={val}
                              sx={{ width: 24, height: 24, borderRadius: '50%' }}
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
                                sx={{ width: 28, height: 28, borderRadius: '50%' }}
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
                </Stack>

                {/* Amount */}
                <Stack spacing={1}>
                  <Stack direction='row' alignItems='center' justifyContent='space-between'>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      {t('withdraw.amount')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {t('withdraw.available')}: {fNumber(availableAmount)} {selectedToken}
                    </Typography>
                  </Stack>
                  <TextField
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setIsFeeAdded(false)
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
                            label={t('withdraw.max')}
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

                {/* Summary */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.grey[500], 0.06),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`
                  }}
                >
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Stack spacing={0.5}>
                      <Typography variant='body2' color='text.primary' fontWeight={600}>
                        {t('withdraw.you-receive') || 'You receive'}
                      </Typography>
                      <Stack direction='row' alignItems='center' spacing={0.1}>
                        <Typography variant='caption' color='text.secondary'>
                          {t('withdraw.fee') || 'Fee'}: ${fNumber(feeInCurr)} {curr.toUpperCase()}
                        </Typography>
                        <Tooltip
                          title={isFeeAdded ? 'Remove fee from amount' : 'Add fee to amount'}
                        >
                          <IconButton
                            size='small'
                            onClick={handleToggleFee}
                            sx={{
                              p: 0.25,
                              ml: 0.25,
                              color: isFeeAdded ? 'primary.main' : 'text.disabled'
                            }}
                          >
                            <Iconify
                              icon={
                                isFeeAdded ? 'solar:minus-circle-bold' : 'solar:add-circle-bold'
                              }
                              width={14}
                            />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Typography variant='subtitle1' fontWeight={700}>
                      ~${fNumber(Math.max(0, currValue - feeInCurr))} {curr.toUpperCase()}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </m.div>
          )}

          {/* ============ STEP 1: Destination ============ */}
          {step === 1 && (
            <m.div
              key='step-1'
              custom={direction}
              variants={STEP_VARIANTS}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Stack spacing={2.5} sx={{ py: 3 }}>
                {/* Recent Sends */}
                {recentSends.length > 0 && (
                  <Stack spacing={1}>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      {t('withdraw.recent-sends')}
                    </Typography>
                    <Stack direction='row' flexWrap='wrap' gap={1}>
                      {recentSends.map((rs) => (
                        <Chip
                          key={rs.value}
                          label={rs.label}
                          size='small'
                          onClick={() => {
                            setDestType(rs.type)
                            setDestination(rs.value)
                            if (rs.type === 'address') handleAddressChange(rs.value)
                            setError('')
                          }}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            maxWidth: 160,
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.16) }
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}

                {/* Destination Type Toggle */}
                <ToggleButtonGroup
                  value={destType}
                  exclusive
                  onChange={(_, val) => {
                    if (val) {
                      setDestType(val)
                      setDestination('')
                      setEnsAddress('')
                      setError('')
                    }
                  }}
                  size='small'
                  fullWidth
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px !important',
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        borderColor: theme.palette.primary.main,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) }
                      }
                    }
                  }}
                >
                  <ToggleButton value='phone'>
                    <Iconify icon='solar:phone-bold' width={18} sx={{ mr: 1 }} />
                    {t('withdraw.phone')}
                  </ToggleButton>
                  <ToggleButton value='address'>
                    <Iconify icon='solar:wallet-bold' width={18} sx={{ mr: 1 }} />
                    {t('withdraw.address')}
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Destination Input */}
                {destType === 'phone' ? (
                  <Autocomplete
                    freeSolo
                    options={phoneContacts}
                    inputValue={destination}
                    onInputChange={(_, value) => {
                      setDestination(value)
                      setError('')
                    }}
                    onChange={(_, value) => {
                      if (value && typeof value === 'object' && 'value' in value) {
                        setDestination(value.value)
                      }
                      setError('')
                    }}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : option.label
                    }
                    filterOptions={(options, { inputValue }) => {
                      const q = inputValue.toLowerCase()
                      return options.filter(
                        (o) =>
                          o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
                      )
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.value}>
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={1.5}
                          sx={{ width: '100%' }}
                        >
                          <Iconify
                            icon='solar:phone-bold'
                            width={18}
                            sx={{ color: 'text.secondary' }}
                          />
                          <Stack sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='body2' fontWeight={600} noWrap>
                              {option.label}
                            </Typography>
                            {option.label !== option.value && (
                              <Typography variant='caption' color='text.secondary' noWrap>
                                {option.value}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='+1 234 567 8900'
                        size='small'
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Iconify
                                icon='solar:phone-bold'
                                width={20}
                                sx={{ color: 'text.secondary' }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                              <InputAdornment position='end'>
                                <Tooltip title={t('withdraw.paste')}>
                                  <IconButton size='small' onClick={handlePaste}>
                                    <Iconify
                                      icon='eva:clipboard-fill'
                                      width={18}
                                      sx={{ color: 'text.secondary' }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            </>
                          )
                        }}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    value={destination}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder='0x... / bc1... / name.eth'
                    size='small'
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Iconify
                            icon='solar:wallet-bold'
                            width={20}
                            sx={{ color: 'text.secondary' }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Tooltip title={t('withdraw.paste')}>
                            <IconButton size='small' onClick={handlePaste}>
                              <Iconify
                                icon='eva:clipboard-fill'
                                width={18}
                                sx={{ color: 'text.secondary' }}
                              />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                )}

                {/* ENS Resolution Display */}
                {isResolvingEns && (
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <CircularProgress size={14} />
                    <Typography variant='caption' color='text.secondary'>
                      {t('withdraw.resolving-ens')}
                    </Typography>
                  </Stack>
                )}
                {ensAddress && !isResolvingEns && (
                  <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1.5}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.16)}`
                    }}
                  >
                    <Box component='img' src={ENS_LOGO} alt='ENS' sx={{ width: 20, height: 20 }} />
                    <Typography
                      variant='caption'
                      sx={{ opacity: 0.7, fontFamily: 'monospace', flex: 1, minWidth: 0 }}
                      noWrap
                    >
                      {ensAddress}
                    </Typography>
                    <Iconify
                      icon='eva:checkmark-circle-2-fill'
                      width={16}
                      sx={{ color: 'success.main', flexShrink: 0 }}
                    />
                  </Stack>
                )}

                {/* Network & Destination Token (address mode) */}
                {destType === 'address' && (
                  <>
                    {/* Network */}
                    <Stack spacing={1}>
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>
                        {t('withdraw.network')}
                      </Typography>
                      <Select
                        value={selectedChainId}
                        onChange={(e) => {
                          setSelectedChainId(e.target.value as number)
                          setDestTokenSymbol('USDT')
                          setTokenSearch('')
                          setError('')
                        }}
                        size='small'
                        fullWidth
                        renderValue={(val) => {
                          const chain = chains.find((c) => c.id === val)
                          if (!chain) return String(val)
                          return (
                            <Stack direction='row' alignItems='center' spacing={1.5}>
                              {chainLogo(chain)}
                              <Typography variant='subtitle2' fontWeight={600}>
                                {chain.name}
                              </Typography>
                            </Stack>
                          )
                        }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                      >
                        {isLoadingChains ? (
                          <MenuItem disabled>
                            <Stack alignItems='center' sx={{ width: '100%', py: 1 }}>
                              <CircularProgress size={20} />
                            </Stack>
                          </MenuItem>
                        ) : (
                          chains.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              <Stack direction='row' alignItems='center' spacing={1.5}>
                                {chainLogo(c)}
                                <Typography variant='body2' fontWeight={600}>
                                  {c.name}
                                </Typography>
                              </Stack>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </Stack>

                    {/* Destination Token */}
                    <Stack spacing={1}>
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>
                        {t('withdraw.dest-token')}
                      </Typography>

                      {selectedChain?.addressType === 'bitcoin' ? (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                            bgcolor: alpha(theme.palette.grey[500], 0.04)
                          }}
                        >
                          <Stack direction='row' alignItems='center' spacing={1.5}>
                            {chainLogo(BITCOIN_CHAIN, 24)}
                            <Typography variant='subtitle2' fontWeight={600}>
                              BTC
                            </Typography>
                          </Stack>
                        </Box>
                      ) : (
                        <Select
                          value={destTokenSymbol}
                          onChange={(e) => {
                            setDestTokenSymbol(e.target.value as string)
                            setTokenSearch('')
                          }}
                          size='small'
                          fullWidth
                          displayEmpty
                          onClose={() => setTokenSearch('')}
                          renderValue={(val) => {
                            const tk = lifiTokens.find((t2) => t2.symbol === val)
                            return (
                              <Stack direction='row' alignItems='center' spacing={1.5}>
                                {tk?.logoURI ? (
                                  <Box
                                    component='img'
                                    src={tk.logoURI}
                                    alt={val}
                                    sx={{ width: 22, height: 22, borderRadius: '50%' }}
                                  />
                                ) : null}
                                <Typography variant='subtitle2' fontWeight={600}>
                                  {val || t('withdraw.select-token')}
                                </Typography>
                              </Stack>
                            )
                          }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } }, autoFocus: false }}
                        >
                          <ListSubheader sx={{ px: 1.5, py: 1, bgcolor: 'background.paper' }}>
                            <TextField
                              value={tokenSearch}
                              onChange={(e) => setTokenSearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder={t('withdraw.search-tokens')}
                              size='small'
                              fullWidth
                              autoFocus
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <Iconify
                                      icon='eva:search-fill'
                                      width={18}
                                      sx={{ color: 'text.disabled' }}
                                    />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </ListSubheader>
                          {isLoadingTokens ? (
                            <MenuItem disabled>
                              <Stack alignItems='center' sx={{ width: '100%', py: 1 }}>
                                <CircularProgress size={20} />
                              </Stack>
                            </MenuItem>
                          ) : filteredLifiTokens.length === 0 ? (
                            <MenuItem disabled>
                              <Typography variant='body2' color='text.secondary'>
                                {t('withdraw.no-tokens')}
                              </Typography>
                            </MenuItem>
                          ) : (
                            filteredLifiTokens.map((tk) => (
                              <MenuItem key={tk.address + tk.symbol} value={tk.symbol}>
                                <Stack
                                  direction='row'
                                  alignItems='center'
                                  spacing={1.5}
                                  sx={{ width: '100%' }}
                                >
                                  {tk.logoURI ? (
                                    <Box
                                      component='img'
                                      src={tk.logoURI}
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
                                  <Stack sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant='body2' fontWeight={600} noWrap>
                                      {tk.symbol}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary' noWrap>
                                      {tk.name}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </m.div>
          )}

          {/* ============ STEP 2: Review ============ */}
          {step === 2 && (
            <m.div
              key='step-2'
              custom={direction}
              variants={STEP_VARIANTS}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Stack spacing={2.5} sx={{ py: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                  }}
                >
                  <Stack spacing={2}>
                    {/* Sending */}
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {t('withdraw.sending')}
                      </Typography>
                      <Stack direction='row' alignItems='center' spacing={1}>
                        {tokenLogos[selectedToken] && (
                          <Box
                            component='img'
                            src={tokenLogos[selectedToken]}
                            alt={selectedToken}
                            sx={{ width: 20, height: 20, borderRadius: '50%' }}
                          />
                        )}
                        <Typography variant='subtitle2' fontWeight={700}>
                          {fNumber(amountFloat)} {selectedToken}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* To */}
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {t('withdraw.to')}
                      </Typography>
                      <Stack alignItems='flex-end' spacing={0.25}>
                        {ensAddress ? (
                          <>
                            <Stack direction='row' alignItems='center' spacing={0.75}>
                              <Box
                                component='img'
                                src={ENS_LOGO}
                                alt='ENS'
                                sx={{ width: 14, height: 14 }}
                              />
                              <Typography variant='body2' fontWeight={600}>
                                {destination}
                              </Typography>
                            </Stack>
                            <Typography
                              variant='caption'
                              sx={{ opacity: 0.6, fontFamily: 'monospace' }}
                              noWrap
                            >
                              {`${ensAddress.slice(0, 10)}...${ensAddress.slice(-6)}`}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              maxWidth: 220,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {destination}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>

                    {/* Network & Dest Token (address mode) */}
                    {destType === 'address' && (
                      <>
                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {t('withdraw.network')}
                          </Typography>
                          <Stack direction='row' alignItems='center' spacing={1}>
                            {selectedChain && chainLogo(selectedChain, 18)}
                            <Typography variant='body2' fontWeight={600}>
                              {selectedChain?.name}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {t('withdraw.dest-token')}
                          </Typography>
                          <Stack direction='row' alignItems='center' spacing={1}>
                            {selectedLifiToken?.logoURI && (
                              <Box
                                component='img'
                                src={selectedLifiToken.logoURI}
                                alt={destTokenSymbol}
                                sx={{ width: 18, height: 18, borderRadius: '50%' }}
                              />
                            )}
                            <Typography variant='subtitle2' fontWeight={700}>
                              {destTokenSymbol}
                            </Typography>
                          </Stack>
                        </Stack>
                      </>
                    )}

                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Stack spacing={0.5}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('withdraw.you-receive') || 'You receive'}
                        </Typography>
                        <Typography variant='caption' color='text.disabled'>
                          {t('withdraw.fee') || 'Fee'}: ${fNumber(feeInCurr)} {curr.toUpperCase()}
                        </Typography>
                      </Stack>
                      <Typography variant='subtitle2' fontWeight={700}>
                        ~${fNumber(Math.max(0, currValue - feeInCurr))} {curr.toUpperCase()}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </m.div>
          )}
        </AnimatePresence>

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
        {step < 2 ? (
          <Button
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            onClick={goNext}
            disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
            endIcon={<Iconify icon='eva:arrow-forward-fill' />}
            sx={{
              py: 1.5,
              fontWeight: 700,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            {t('withdraw.next')}
          </Button>
        ) : (
          <Button
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            onClick={handleSend}
            startIcon={<Iconify icon='ic:round-whatsapp' />}
            sx={{
              py: 1.5,
              fontWeight: 700,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            {t('withdraw.send-via-whatsapp')}
          </Button>
        )}
      </Box>
    </Dialog>
  )
}
