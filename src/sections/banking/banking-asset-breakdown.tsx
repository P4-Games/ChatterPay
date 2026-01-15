'use client'

import { useMemo, useState } from 'react'

import Avvvatars from 'avvvatars-react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControlLabel from '@mui/material/FormControlLabel'

import { fNumber } from 'src/utils/format-number'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'

import type { IBalance } from 'src/types/wallet'
import type { TokenPriceData } from 'src/app/api/services/coingecko/coingecko-service'

// ----------------------------------------------------------------------

type Props = {
  balances: IBalance[]
  priceData: Record<string, TokenPriceData>
  tokenLogos: Record<string, string>
  isLoading?: boolean
}

export default function BankingAssetBreakdown({
  balances,
  priceData,
  tokenLogos,
  isLoading = false
}: Props) {
  const theme = useTheme()
  const { t } = useTranslate()
  const [hideSmallBalances, setHideSmallBalances] = useState(false)

  // Filter and sort balances
  const processedBalances = useMemo(() => {
    let filtered = [...balances]

    // Filter small balances if toggle is on
    if (hideSmallBalances) {
      filtered = filtered.filter((balance) => balance.balance_conv.usd >= 1)
    }

    // Sort by USD value (highest to lowest)
    filtered.sort((a, b) => b.balance_conv.usd - a.balance_conv.usd)

    return filtered
  }, [balances, hideSmallBalances])

  const renderLoading = (
    <>
      {[...Array(5)].map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            px: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant='circular' width={40} height={40} />
            <Box>
              <Skeleton variant='text' width={80} />
              <Skeleton variant='text' width={120} />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Skeleton variant='text' width={60} />
            <Skeleton variant='text' width={40} />
          </Box>
        </Box>
      ))}
    </>
  )

  const renderEmpty = (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        color: 'text.secondary'
      }}
    >
      <Iconify icon='eva:inbox-outline' width={64} sx={{ mb: 2, opacity: 0.48 }} />
      <Typography variant='body2'>
        {hideSmallBalances ? 'No balances above $1' : 'No balance'}
      </Typography>
    </Box>
  )

  const renderAssetRow = (balance: IBalance) => {
    const price = priceData[balance.token] || { usd: 0, usd_24h_change: 0 }
    const priceChange = price.usd_24h_change
    const hasPriceChange = priceData[balance.token] && priceChange !== 0
    const isPositiveChange = priceChange >= 0
    const logoUrl = tokenLogos[balance.token]

    return (
      <Box
        key={`${balance.network}-${balance.token}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          '&:hover': {
            bgcolor: 'action.hover',
            borderRadius: 1
          },
          transition: theme.transitions.create(['background-color'])
        }}
      >
        {/* Token Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          {logoUrl ? (
            <Box
              component='img'
              src={logoUrl}
              alt={balance.token}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                flexShrink: 0
              }}
            />
          ) : (
            <Avvvatars
              value={balance.token}
              style='character'
              size={40}
              displayValue={balance.token.substring(0, 2)}
            />
          )}
          <Box>
            <Typography variant='subtitle2'>{balance.token}</Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {fNumber(balance.balance)}
            </Typography>
          </Box>
        </Box>

        {/* Value and Change */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='subtitle2'>${fNumber(balance.balance_conv.usd)}</Typography>
          {hasPriceChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <Iconify
                icon={isPositiveChange ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                width={16}
                sx={{
                  color: isPositiveChange ? 'success.main' : 'error.main'
                }}
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

  return (
    <Card>
      <CardHeader
        title={t('Assets')}
        action={
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={hideSmallBalances}
                onChange={(e) => setHideSmallBalances(e.target.checked)}
              />
            }
            label={
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Hide &lt;$1
              </Typography>
            }
            sx={{ m: 0, gap: 1 }}
          />
        }
        sx={{ pb: 1, '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 } }}
      />

      <Scrollbar sx={{ maxHeight: 440 }}>
        <Stack spacing={0}>
          {isLoading && renderLoading}
          {!isLoading && processedBalances.length === 0 && renderEmpty}
          {!isLoading && processedBalances.map(renderAssetRow)}
        </Stack>
      </Scrollbar>
    </Card>
  )
}
