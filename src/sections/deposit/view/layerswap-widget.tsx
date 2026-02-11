'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { LAYERSWAP_BG, LAYERSWAP_BASE_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

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
// Desktop: embedded iframe.
// Mobile:  opens Layerswap in a new tab because iOS Safari blocks
//          deep-links (custom URL schemes / Universal Links) from
//          cross-origin iframes — a WebKit platform limitation.
// ----------------------------------------------------------------------

export default function LayerswapWidget({ destAddress, embedded = false }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')

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

  const cardSx = {
    width: '100%',
    ...(!embedded && { maxWidth: 500 }),
    mx: 'auto',
    overflow: 'hidden',
    bgcolor: LAYERSWAP_BG,
    ...(embedded
      ? { borderRadius: 0 }
      : {
          borderRadius: 3,
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.24)}, ${theme.customShadows.z16}`,
          borderTop: `3px solid ${theme.palette.primary.main}`
        })
  }

  // --- Mobile: open in new tab so wallet deep-links work ---
  if (!mdUp) {
    return (
      <Box sx={{ ...cardSx, p: 4, textAlign: 'center' }}>
        <Iconify
          icon='solar:wallet-bold-duotone'
          width={48}
          sx={{ color: theme.palette.primary.main, mb: 2 }}
        />

        <Typography variant='body2' sx={{ color: alpha('#fff', 0.7), mb: 3 }}>
          {t(
            'layerswapDeposit.description',
            'Bridge your assets to Scroll and deposit directly into your ChatterPay wallet.'
          )}
        </Typography>

        <Button
          variant='contained'
          size='large'
          fullWidth
          href={layerswapUrl}
          target='_blank'
          rel='noopener noreferrer'
          startIcon={<Iconify icon='eva:external-link-fill' />}
        >
          {t('layerswapDeposit.actionButton', 'Deposit to ChatterPay')}
        </Button>

        <Typography variant='caption' sx={{ display: 'block', mt: 2, color: alpha('#fff', 0.35) }}>
          {t('layerswapDeposit.badge', 'Powered by Layerswap')}
        </Typography>
      </Box>
    )
  }

  // --- Desktop: embedded iframe ---
  return (
    <Box sx={cardSx}>
      <Box
        component='iframe'
        src={layerswapUrl}
        title={t('layerswapDeposit.iframeTitle', 'Layerswap Deposit')}
        allow='clipboard-write'
        referrerPolicy='strict-origin-when-cross-origin'
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
