'use client'

import QRCode from 'react-qr-code'
import { enqueueSnackbar } from 'notistack'

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
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: () => void
  walletAddress: string
}

export default function DashboardDepositModal({ open, onClose, walletAddress }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    enqueueSnackbar(t('deposit.address-copied'), { variant: 'success' })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>{t('deposit.title')}</Typography>
          <IconButton onClick={onClose} size='small'>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} alignItems='center' sx={{ py: 2 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <QRCode value={walletAddress} size={200} />
          </Box>

          <Stack spacing={1} sx={{ width: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              {t('deposit.wallet-address')}
            </Typography>
            <Typography variant='body2' sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
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
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 1.5
            }}
          >
            <Box
              component='img'
              src='https://storage.googleapis.com/chatbot-multimedia/chatterpay/images/tokens/scr.svg'
              alt='Scroll Network'
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
            startIcon={<Iconify icon='eva:copy-fill' />}
            onClick={handleCopyAddress}
          >
            {t('deposit.copy-address')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
