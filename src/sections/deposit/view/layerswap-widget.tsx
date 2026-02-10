'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

type Props = {
  destAddress: string
}

// ----------------------------------------------------------------------
// Layerswap iFrame integration.
//
// All customization is done via URL query parameters.
// See: https://docs.layerswap.io/integration/UI/Configurations
// See: https://docs.layerswap.io/integration/UI/iFrame
//
// The iframe loads layerswap.io directly
// ----------------------------------------------------------------------

const LS_DARK_BG = '#070C17'

const LAYERSWAP_BASE_URL = 'https://layerswap.io/app'

export default function LayerswapWidget({ destAddress }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const iframeSrc = useMemo(() => {
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
      theme: 'default',
    })

    // Add clientId if available
    const apiKey = process.env.NEXT_PUBLIC_LAYERSWAP_API_KEY
    if (apiKey) {
      params.set('clientId', apiKey)
    }

    return `${LAYERSWAP_BASE_URL}?${params.toString()}`
  }, [destAddress, t])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 500,
        mx: 'auto',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: LS_DARK_BG,
        boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.24)}, ${theme.customShadows.z16}`,
        // Subtle green glow accent at the top
        borderTop: `3px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box
        component='iframe'
        src={iframeSrc}
        title='Layerswap Deposit'
        allow='clipboard-write'
        sx={{
          width: '100%',
          height: { xs: 580, sm: 620 },
          border: 'none',
          display: 'block',
        }}
      />
    </Box>
  )
}
