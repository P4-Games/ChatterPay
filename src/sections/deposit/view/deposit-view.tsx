'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { CHATIZALO_PHONE_NUMBER } from 'src/config-global'

import Iconify from 'src/components/iconify'

import LayerswapWidget from './layerswap-widget'

// ----------------------------------------------------------------------

const WHATSAPP_BASE_URL = 'https://api.whatsapp.com/send/'

const isValidEthAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address)

// ----------------------------------------------------------------------

export default function DepositView() {
  const { t } = useTranslate()
  const theme = useTheme()
  const searchParams = useSearchParams()

  const address = searchParams.get('address') || ''
  const hasAddress = address.length > 0
  const isValid = hasAddress && isValidEthAddress(address)

  const primaryMain = theme.palette.primary.main

  const whatsappReturnUrl = useMemo(() => {
    const params = new URLSearchParams({
      phone: String(CHATIZALO_PHONE_NUMBER),
      text: t('layerswapDeposit.whatsappReturnText', 'I want to see my balance'),
      type: 'phone_number',
      app_absent: '0'
    })
    return `${WHATSAPP_BASE_URL}?${params.toString()}`
  }, [t])

  // ----------------------------------------------------------------------

  const renderError = () => {
    const errorKey = hasAddress
      ? 'layerswapDeposit.errors.invalidAddress'
      : 'layerswapDeposit.errors.missingAddress'

    const errorFallback = hasAddress
      ? 'The wallet address provided is not a valid Ethereum address.'
      : 'A wallet address is required. Please provide your address in the URL (?address=0x...).'

    return (
      <Container maxWidth='sm' sx={{ py: { xs: 4, md: 6 } }}>
        <Alert
          severity='error'
          sx={{
            borderRadius: 2,
            boxShadow: theme.customShadows.z8
          }}
        >
          <AlertTitle>{t('layerswapDeposit.errors.title', 'Invalid Request')}</AlertTitle>
          {t(errorKey, errorFallback)}
        </Alert>
      </Container>
    )
  }

  // ----------------------------------------------------------------------

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 2, sm: 3 },
        pt: { xs: 2, md: 4 },
        pb: { xs: 3, md: 5 }
      }}
    >
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
        {t('layerswapDeposit.title', 'Deposit to ChatterPay')}
      </Typography>

      <Typography
        variant='body2'
        sx={{ mb: 3, color: 'text.secondary', textAlign: 'center', maxWidth: 420 }}
      >
        {t(
          'layerswapDeposit.description',
          'Bridge your assets to Scroll and deposit directly into your ChatterPay wallet.'
        )}
      </Typography>

      {isValid ? <LayerswapWidget destAddress={address} /> : renderError()}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant='text'
          size='medium'
          href={whatsappReturnUrl}
          target='_blank'
          rel='noopener noreferrer'
          startIcon={<Iconify icon='eva:arrow-back-fill' />}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(primaryMain, 0.08)
            }
          }}
        >
          {t('layerswapDeposit.returnButton', 'Return to ChatterPay')}
        </Button>
      </Box>
    </Box>
  )
}
