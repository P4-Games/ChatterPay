'use client'

import {
  Box,
  Card,
  Stack,
  Button,
  Collapse,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { fNumber } from 'src/utils/format-number'
import Iconify from 'src/components/iconify'

import type { IBalance, CurrencyKey } from 'src/types/wallet'
import type { TokenPriceData } from 'src/app/api/services/coingecko/coingecko-service'

// ----------------------------------------------------------------------

type Props = {
  cryptoTotalUsd: number
  polymarketTotalUsd: number
  idleUsdc: number
  isLoading: boolean
  hideValues: boolean
  onToggleHideValues: () => void
  onDepositClick: () => void
  onWithdrawClick: () => void
  onClaimClick: () => void
  onCryptoClick: () => void
  onPolymarketClick: () => void
  isClaiming: boolean
  selectedCurrency: CurrencyKey
  onCurrencyChange: (currency: CurrencyKey) => void
  totals: Record<CurrencyKey, number>
  tokenLogos: Record<string, string>
  balances: IBalance[]
  // Crypto dropdown data
  cryptoExpanded: boolean
  onCryptoToggle: () => void
  priceData: Record<string, TokenPriceData>
}

// Show up to 3 stacked token logos
function StackedTokenIcons({
  balances,
  tokenLogos,
  isDark
}: {
  balances: IBalance[]
  tokenLogos: Record<string, string>
  isDark: boolean
}) {
  const topTokens = [...balances]
    .sort((a, b) => (b.balance_conv?.usd ?? 0) - (a.balance_conv?.usd ?? 0))
    .slice(0, 3)
    .filter((b) => tokenLogos[b.token])

  if (topTokens.length === 0) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Iconify icon='solar:wallet-bold' width={18} sx={{ color: 'text.secondary' }} />
      </Box>
    )
  }

  const iconSize = 28
  const overlap = 8

  return (
    <Box
      sx={{
        position: 'relative',
        width: iconSize + (topTokens.length - 1) * (iconSize - overlap),
        height: iconSize,
        flexShrink: 0
      }}
    >
      {topTokens.map((token, index) => (
        <Box
          key={token.token}
          component='img'
          src={tokenLogos[token.token]}
          alt={token.token}
          sx={{
            position: 'absolute',
            left: index * (iconSize - overlap),
            top: 0,
            width: iconSize,
            height: iconSize,
            borderRadius: '50%',
            border: isDark ? '2px solid #2B3139' : '2px solid white',
            bgcolor: isDark ? '#2B3139' : 'white',
            objectFit: 'contain',
            zIndex: topTokens.length - index
          }}
        />
      ))}
    </Box>
  )
}

// Inline crypto asset row
function CryptoAssetRow({
  balance,
  priceData,
  tokenLogos,
  hideValues,
  selectedCurrency
}: {
  balance: IBalance
  priceData: Record<string, TokenPriceData>
  tokenLogos: Record<string, string>
  hideValues: boolean
  selectedCurrency: CurrencyKey
}) {
  const theme = useTheme()
  const price = priceData[balance.token] || { usd: 0, usd_24h_change: 0 }
  const priceChange = price.usd_24h_change
  const hasPriceChange = priceData[balance.token] && priceChange !== 0
  const isPositiveChange = priceChange >= 0
  const logoUrl = tokenLogos[balance.token]
  const hasBalance = balance.balance > 0

  const currencyValue = balance.balance_conv[selectedCurrency] || 0
  const displayValue = hasBalance ? fNumber(currencyValue) : '0'
  const currencyLabel = selectedCurrency.toUpperCase()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.25,
        px: 3,
        opacity: hasBalance ? 1 : 0.5,
        '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04), borderRadius: 1 },
        transition: theme.transitions.create(['background-color', 'opacity'], { duration: 200 })
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        {logoUrl ? (
          <Box
            component='img'
            src={logoUrl}
            alt={balance.token}
            sx={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}
          />
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant='caption' fontWeight={700}>
              {balance.token.substring(0, 2)}
            </Typography>
          </Box>
        )}
        <Box>
          <Typography variant='subtitle2' fontWeight={600}>
            {balance.token}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {fNumber(balance.balance)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Typography variant='subtitle2' fontWeight={600}>
          {hideValues ? '***' : `$${displayValue}`} {currencyLabel}
        </Typography>
        {hasPriceChange && hasBalance && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
            <Iconify
              icon={isPositiveChange ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
              width={14}
              sx={{ color: isPositiveChange ? 'success.main' : 'error.main' }}
            />
            <Typography
              variant='caption'
              sx={{
                color: isPositiveChange ? 'success.main' : 'error.main',
                fontWeight: 600
              }}
            >
              {isPositiveChange ? '+' : ''}
              {fNumber(priceChange)}%
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function DashboardPortfolioBalance({
  cryptoTotalUsd,
  polymarketTotalUsd,
  idleUsdc,
  isLoading,
  hideValues,
  onToggleHideValues,
  onDepositClick,
  onWithdrawClick,
  onClaimClick,
  onCryptoClick,
  onPolymarketClick,
  isClaiming,
  selectedCurrency,
  onCurrencyChange,
  totals,
  tokenLogos,
  balances,
  cryptoExpanded,
  onCryptoToggle,
  priceData
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const headingColor = isDark ? '#B8F6C9' : '#173F35'
  const btnColor = isDark ? '#7EDBB8' : '#0D352C'

  let conversionRate = 1
  if (selectedCurrency !== 'usd') {
    if (totals.usd > 0) {
      conversionRate = (totals[selectedCurrency] || 0) / totals.usd
    } else {
      const stable = balances.find((b) => b.balance_conv?.usd > 0)
      if (stable) conversionRate = stable.balance_conv[selectedCurrency] / stable.balance_conv.usd
    }
  }

  const polymarketConverted = polymarketTotalUsd * conversionRate
  const combinedTotal = (totals[selectedCurrency] || 0) + polymarketConverted

  // Sort balances by USD value for dropdown
  const sortedBalances = [...balances].sort(
    (a, b) => (b.balance_conv?.usd ?? 0) - (a.balance_conv?.usd ?? 0)
  )

  return (
    <Stack spacing={2}>
      {/* Heading */}
      <Stack direction='row' alignItems='center' spacing={0.5}>
        <Typography
          sx={{
            color: headingColor,
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 'normal',
            letterSpacing: '-0.24px'
          }}
        >
          Portfolio Balance
        </Typography>
        <IconButton color='inherit' onClick={onToggleHideValues} sx={{ opacity: 0.48 }}>
          <Iconify icon={hideValues ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={18} />
        </IconButton>
      </Stack>

      {/* Total Balance with currency */}
      <Stack direction='row' alignItems='baseline' spacing={0.75}>
        <Typography
          sx={{
            color: headingColor,
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 'normal',
            letterSpacing: '-0.36px'
          }}
        >
          ${!hideValues ? fNumber(combinedTotal) || '0.00' : '********'}
        </Typography>
        <Stack
          direction='row'
          alignItems='center'
          spacing={0.25}
          sx={{ cursor: 'pointer', opacity: 0.4 }}
          onClick={() => {
            const keys = Object.keys(totals) as CurrencyKey[]
            const idx = keys.indexOf(selectedCurrency)
            onCurrencyChange(keys[(idx + 1) % keys.length])
          }}
        >
          <Typography
            sx={{
              color: headingColor,
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 'normal'
            }}
          >
            {selectedCurrency.toUpperCase()}
          </Typography>
          <Iconify icon='eva:chevron-down-fill' width={18} sx={{ opacity: 0.6 }} />
        </Stack>
      </Stack>

      {/* Crypto Row + Dropdown */}
      <Card
        sx={{
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          overflow: 'hidden'
        }}
      >
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          onClick={onCryptoToggle}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04) },
            transition: theme.transitions.create('background-color', { duration: 200 })
          }}
        >
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <StackedTokenIcons balances={balances} tokenLogos={tokenLogos} isDark={isDark} />
            <Typography variant='subtitle1' fontWeight={600}>
              Crypto
            </Typography>
          </Stack>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='subtitle1' fontWeight={600}>
              {hideValues
                ? '********'
                : `$${fNumber(totals[selectedCurrency] || 0)} ${selectedCurrency.toUpperCase()}`}
            </Typography>
            <Iconify
              icon='eva:chevron-down-fill'
              width={20}
              sx={{
                color: 'text.secondary',
                transition: theme.transitions.create('transform', { duration: 300 }),
                transform: cryptoExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </Stack>
        </Stack>

        <Collapse in={cryptoExpanded} timeout={300}>
          <Box
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              maxHeight: 320,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[500], 0.2)
              }
            }}
          >
            {sortedBalances.map((balance) => (
              <CryptoAssetRow
                key={`${balance.network}-${balance.token}`}
                balance={balance}
                priceData={priceData}
                tokenLogos={tokenLogos}
                hideValues={hideValues}
                selectedCurrency={selectedCurrency}
              />
            ))}
          </Box>
        </Collapse>
      </Card>

      {/* Polymarket Row */}
      <Card
        onClick={onPolymarketClick}
        sx={{
          px: 3,
          py: 1.5,
          cursor: 'pointer',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04) },
          transition: theme.transitions.create('background-color', { duration: 200 })
        }}
      >
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box
              component='img'
              src='/assets/icons/polymarket/logo.svg'
              alt='Polymarket'
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                flexShrink: 0
              }}
            />
            <Typography variant='subtitle1' fontWeight={600}>
              Polymarket
            </Typography>
          </Stack>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='subtitle1' fontWeight={600}>
              {hideValues
                ? '********'
                : `$${fNumber(polymarketConverted)} ${selectedCurrency.toUpperCase()}`}
            </Typography>
            <Iconify icon='eva:chevron-right-fill' width={20} sx={{ color: 'text.secondary' }} />
          </Stack>
        </Stack>
      </Card>

      {/* Action Buttons */}
      <Stack direction='row' spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button
          variant='contained'
          color='primary'
          startIcon={<Iconify icon='eva:diagonal-arrow-left-down-fill' />}
          onClick={onDepositClick}
          sx={{
            px: 3,
            py: 1.2,
            flex: { xs: 1, sm: 'none' },
            ...(isDark && {
              bgcolor: '#1B9C85',
              color: '#fff',
              '&:hover': { bgcolor: '#22b89a' }
            })
          }}
        >
          {t('balances.deposit')}
        </Button>

        <Button
          variant='outlined'
          startIcon={<Iconify icon='eva:diagonal-arrow-right-up-fill' />}
          onClick={onWithdrawClick}
          sx={{
            px: 3,
            py: 1.2,
            flex: { xs: 1, sm: 'none' },
            color: btnColor,
            borderColor: btnColor,
            borderWidth: '0.5px',
            '&:hover': {
              borderColor: btnColor,
              bgcolor: alpha(btnColor, 0.06),
              borderWidth: '0.5px'
            }
          }}
        >
          Withdraw
        </Button>

        {idleUsdc >= 0.01 && (
          <Button
            variant='outlined'
            startIcon={
              isClaiming ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <Iconify icon='solar:hand-money-bold' />
              )
            }
            onClick={onClaimClick}
            disabled={isClaiming}
            sx={{
              px: 3,
              py: 1.2,
              flex: { xs: '1 1 100%', sm: 'none' },
              color: btnColor,
              borderColor: btnColor,
              borderWidth: '0.5px',
              '&:hover': {
                borderColor: btnColor,
                bgcolor: alpha(btnColor, 0.06),
                borderWidth: '0.5px'
              }
            }}
          >
            {isClaiming ? 'Claiming...' : `Claim Settlements: $${fNumber(idleUsdc)}`}
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
