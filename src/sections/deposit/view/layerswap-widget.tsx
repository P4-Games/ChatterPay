'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { LAYERSWAP_BASE_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

type Props = {
  destAddress: string
}

// ----------------------------------------------------------------------
// Layerswap redirect integration.
//
// We use the redirect/external-link pattern for all platforms (desktop +
// mobile, iOS + Android) because an embedded iframe breaks external-wallet
// deep-links (WalletConnect, MetaMask, etc.) on every platform, not just
// iOS Safari.
//
// URL query parameters reference:
//   https://docs.layerswap.io/integration/UI/Configurations
//
// In development / testing environments LAYERSWAP_BASE_URL points at the
// Layerswap sandbox so no real funds are involved.
// ----------------------------------------------------------------------

export default function LayerswapWidget({ destAddress }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const layerswapUrl = useMemo(() => {
    const params = new URLSearchParams({
      // Destination config
      to: 'SCROLL_MAINNET',
      toAsset: 'USDT',
      fromAsset: 'USDT',
      destAddress,

      // Lock destination (user should only change source)
      lockTo: 'true',
      lockToAsset: 'true',
      hideTo: 'true',
      hideAddress: 'true',
      hideRefuel: 'true',

      // CTA button text
      actionButtonText: t('layerswapDeposit.actionButton', 'Deposit to ChatterPay'),

      // Always use the dark "default" Layerswap theme for a polished look
      theme: 'default'
    })

    return `${LAYERSWAP_BASE_URL}?${params.toString()}`
  }, [destAddress, t])

  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        p: 4,
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: isDark ? 'background.paper' : 'grey.100',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: theme.customShadows.z16
      }}
    >
      {/* Wallet icon */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}
      >
        <Iconify
          icon='solar:wallet-bold-duotone'
          width={36}
          sx={{ color: theme.palette.primary.main }}
        />
      </Box>

      {/* Description */}
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          mb: 3,
          lineHeight: 1.6
        }}
      >
        {t(
          'layerswapDeposit.description',
          'Bridge your assets to Scroll and deposit directly into your ChatterPay wallet.'
        )}
      </Typography>

      {/* CTA */}
      <Button
        variant='contained'
        size='large'
        fullWidth
        href={layerswapUrl}
        target='_blank'
        rel='noopener noreferrer'
        startIcon={<Iconify icon='eva:external-link-fill' />}
        sx={{ mb: 2 }}
      >
        {t('layerswapDeposit.actionButton', 'Deposit to ChatterPay')}
      </Button>

      {/* Badge */}
      <Typography variant='caption' sx={{ display: 'block', color: 'text.disabled' }}>
        {t('layerswapDeposit.badge', 'Powered by Layerswap')}
      </Typography>
    </Box>
  )
}
