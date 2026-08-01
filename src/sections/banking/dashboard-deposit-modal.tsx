'use client'

import QRCode from 'react-qr-code'
import { useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { m, AnimatePresence } from 'framer-motion'

import {
  Box,
  Stack,
  Alert,
  Button,
  Dialog,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent
} from '@mui/material'

import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, QrCode01Icon } from '@hugeicons/core-free-icons'

import { useTranslate } from 'src/locales'
import Iconify from 'src/components/iconify'

import LayerswapWidget from 'src/sections/deposit/view/layerswap-widget'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: () => void
  walletAddress: string
}

const transition = { duration: 0.1, ease: 'easeOut' as const }

/**
 * Deposit modal with two views:
 * - Main: multichain deposit via Layerswap (primary CTA)
 * - Address: wallet address + QR on Scroll network (secondary)
 */
export default function DashboardDepositModal({ open, onClose, walletAddress }: Props) {
  const { t } = useTranslate()
  const [showAddress, setShowAddress] = useState(false)

  const handleClose = () => {
    onClose()
    setShowAddress(false)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    enqueueSnackbar(t('balances.address-copied'), { variant: 'success' })
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>{t('deposit.title')}</Typography>
          <IconButton onClick={handleClose} size='small'>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 0, pb: 0, overflowX: 'hidden' }}>
        <AnimatePresence initial={false} mode='wait'>
          {!showAddress ? (
            <m.div
              key='layerswap'
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={transition}
            >
              <Stack spacing={0} alignItems='center'>
                <LayerswapWidget destAddress={walletAddress} plain />

                <Box sx={{ width: '100%', maxWidth: 440, px: 4 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='inherit'
                    size='large'
                    onClick={() => setShowAddress(true)}
                    startIcon={<HugeiconsIcon icon={QrCode01Icon} size={18} />}
                    sx={{ mt: 0.5, mb: 3 }}
                  >
                    {t('deposit.show-address', 'See my address on Scroll')}
                  </Button>
                </Box>
              </Stack>
            </m.div>
          ) : (
            <m.div
              key='address'
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={transition}
            >
              <Stack spacing={3} alignItems='center' sx={{ py: 2, px: 4 }}>
                <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2 }}>
                  <QRCode value={walletAddress} size={200} />
                </Box>

                <Stack spacing={1} sx={{ width: 1 }}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {t('deposit.wallet-address')}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
                  >
                    {walletAddress}
                  </Typography>
                </Stack>

                <Stack
                  direction='row'
                  spacing={1.5}
                  alignItems='center'
                  sx={{
                    width: '100%',
                    p: 2,
                    bgcolor: 'action.selected',
                    borderRadius: 1.5
                  }}
                >
                  <Box
                    component='img'
                    src='https://storage.googleapis.com/chatbot-multimedia/chatterpay/images/tokens/scr.svg'
                    alt='Scroll Network'
                    loading='lazy'
                    decoding='async'
                    sx={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                  <Stack spacing={0.25}>
                    <Typography variant='subtitle2'>{t('deposit.network')}: Scroll</Typography>
                  </Stack>
                </Stack>

                <Alert severity='warning' sx={{ width: '100%' }}>
                  {t('deposit.network-warning')}
                </Alert>

                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  startIcon={<HugeiconsIcon icon={Copy01Icon} size={18} />}
                  onClick={handleCopyAddress}
                >
                  {t('deposit.copy-address')}
                </Button>

                <Button
                  variant='text'
                  size='small'
                  startIcon={<Iconify icon='eva:arrow-back-fill' width={16} />}
                  onClick={() => setShowAddress(false)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  {t('deposit.back-to-deposit', 'Back to deposit')}
                </Button>
              </Stack>
            </m.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
