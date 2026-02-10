'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

type Props = {
  destAddress: string
  /** When true, strips card styling (shadow, border, radius) so the widget blends into a parent container */
  embedded?: boolean
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

const LS_DARK_BG = '#0c1526'

const LAYERSWAP_BASE_URL = 'https://layerswap.io/app'

export default function LayerswapWidget({ destAddress, embedded = false }: Props) {
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
      theme: 'default'
    })

    return `${LAYERSWAP_BASE_URL}?${params.toString()}`
  }, [destAddress, t])

  return (
    <Box
      sx={{
        width: '100%',
        ...(!embedded && { maxWidth: 500 }),
        mx: 'auto',
        overflow: 'hidden',
        bgcolor: LS_DARK_BG,
        ...(embedded
          ? { borderRadius: 0 }
          : {
              borderRadius: 3,
              boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.24)}, ${theme.customShadows.z16}`,
              borderTop: `3px solid ${theme.palette.primary.main}`
            })
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
          display: 'block'
        }}
      />
    </Box>
  )
}
