'use client'

import QRCode from 'react-qr-code'
import { useMemo, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { m, AnimatePresence } from 'framer-motion'

import {
  Box,
  Chip,
  Stack,
  Alert,
  Avatar,
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
import { thinScroll } from 'src/theme/css'
import { DEFAULT_CHAIN_ID } from 'src/config-global'
import { getChainName, getChainLogoUrl, getLayerswapNetwork } from 'src/config-chains'

import LayerswapWidget from 'src/sections/deposit/view/layerswap-widget'

// ----------------------------------------------------------------------

/** A network the user can receive on, and the address that receives there. */
export type ReceiveAddress = {
  chainId: number
  address: string
}

type Props = {
  open: boolean
  onClose: () => void
  walletAddress: string
  /**
   * Addresses on networks other than the active one — today, Cardano.
   *
   * They matter because a Cardano address is not an alternative way to reach the same wallet: it
   * is a different wallet on a different chain, and funds sent to the EVM address never arrive
   * there. On top of that, Cardano has no Layerswap route and the user pays their own fees, so
   * seeing and copying this address is the only way they can get started at all.
   */
  extraAddresses?: ReceiveAddress[]
}

const transition = { duration: 0.1, ease: 'easeOut' as const }

/**
 * Deposit modal with two views:
 * - Main: multichain deposit via Layerswap (primary CTA)
 * - Address: wallet address + QR, on a network the user picks (secondary)
 */
export default function DashboardDepositModal({
  open,
  onClose,
  walletAddress,
  extraAddresses = []
}: Props) {
  const { t } = useTranslate()

  // Layerswap cannot deposit into every network. Where it can't, the widget
  // renders nothing, so the address view is the only way to deposit and the
  // modal opens straight into it instead of on an empty first step.
  const hasLayerswap = Boolean(getLayerswapNetwork())
  const [showAddress, setShowAddress] = useState(!hasLayerswap)

  // The active network first: it is where every other operation happens, so it stays the default.
  const receiveOptions = useMemo<ReceiveAddress[]>(
    () => [
      { chainId: DEFAULT_CHAIN_ID, address: walletAddress },
      ...extraAddresses.filter((option) => option.address)
    ],
    [walletAddress, extraAddresses]
  )
  const [selectedChainId, setSelectedChainId] = useState<number>(DEFAULT_CHAIN_ID)

  const selected =
    receiveOptions.find((option) => option.chainId === selectedChainId) ?? receiveOptions[0]
  const selectedAddress = selected?.address ?? walletAddress

  const networkName = getChainName(selected?.chainId)
  const networkLogo = getChainLogoUrl(selected?.chainId)

  const handleClose = () => {
    onClose()
    setShowAddress(!hasLayerswap)
    setSelectedChainId(DEFAULT_CHAIN_ID)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedAddress)
    enqueueSnackbar(t('balances.address-copied'), { variant: 'success' })
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='xs'
      fullWidth
      // The paper already keeps a 16px margin; the default 64px cap wastes half
      // a screen of height on short windows and forces the content to scroll.
      PaperProps={{ sx: { maxHeight: 'calc(100% - 32px)' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>{t('deposit.title')}</Typography>
          <IconButton onClick={handleClose} size='small'>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 0, pb: 0, overflowX: 'hidden', ...thinScroll }}>
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
                    {t('deposit.show-address', 'See my address on {network}').replace(
                      '{network}',
                      networkName
                    )}
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
              <Stack spacing={2} alignItems='center' sx={{ py: 2, px: 4 }}>
                {receiveOptions.length > 1 && (
                  <Stack direction='row' spacing={1} sx={{ width: 1, flexWrap: 'wrap', gap: 1 }}>
                    {receiveOptions.map((option) => (
                      <Chip
                        key={option.chainId}
                        label={getChainName(option.chainId)}
                        size='small'
                        onClick={() => setSelectedChainId(option.chainId)}
                        color={option.chainId === selected?.chainId ? 'primary' : 'default'}
                        variant={option.chainId === selected?.chainId ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Stack>
                )}

                <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2 }}>
                  {/* A Cardano address is over twice as long as an EVM one, so the QR needs more
                      modules; at 160px they get too small to scan reliably. */}
                  <QRCode value={selectedAddress} size={selectedAddress.length > 60 ? 200 : 160} />
                </Box>

                <Stack spacing={1} sx={{ width: 1 }}>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {t('deposit.wallet-address')}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
                  >
                    {selectedAddress}
                  </Typography>
                </Stack>

                <Stack
                  direction='row'
                  spacing={1.5}
                  alignItems='center'
                  sx={{
                    width: '100%',
                    p: 1.5,
                    bgcolor: 'action.selected',
                    borderRadius: 1.5
                  }}
                >
                  {/* Not every network has artwork uploaded, so fall back to the
                      network initial instead of rendering a broken image. */}
                  <Avatar
                    src={networkLogo || undefined}
                    alt={networkName}
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}
                  >
                    {networkName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Stack spacing={0.25}>
                    <Typography variant='subtitle2'>
                      {t('deposit.network')}: {networkName}
                    </Typography>
                  </Stack>
                </Stack>

                <Alert severity='warning' sx={{ width: '100%', py: 0.5 }}>
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

                {hasLayerswap && (
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
                )}
              </Stack>
            </m.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
