import { useState, useEffect } from 'react'
import { enqueueSnackbar } from 'notistack'
import QRCode from 'react-qr-code'

import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Card, { type CardProps } from '@mui/material/Card'
import {
  Box,
  Stack,
  Button,
  Select,
  Tooltip,
  Dialog,
  Alert,
  Typography,
  DialogTitle,
  DialogContent,
  type SelectChangeEvent
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'
import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, EXPLORER_L2_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

import LayerswapWidget from 'src/sections/deposit/view/layerswap-widget'

import type { IBalances, CurrencyKey } from 'src/types/wallet'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  tableData: IBalances
  hideValues?: boolean
  onToggleHideValues?: () => void
  selectedCurrency?: 'usd' | 'ars' | 'brl' | 'uyu'
  onCurrencyChange?: (currency: 'usd' | 'ars' | 'brl' | 'uyu') => void
}
export default function BankingBalances({
  title,
  subheader,

  tableData,
  hideValues = false,
  onToggleHideValues,
  selectedCurrency = 'usd',
  onCurrencyChange,
  ...other
}: Props) {
  const walletLinkL2 = `${EXPLORER_L2_URL}/address/${tableData?.wallet || ''}`

  const { t } = useTranslate()
  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')
  const depositModal = useBoolean()
  const [showAddress, setShowAddress] = useState(false)
  const router = useRouter()

  const handleCloseDeposit = () => {
    depositModal.onFalse()
    setShowAddress(false)
  }

  const sendReciveUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('balances.wapp-msg'))

  const handleCurrencyChangeLocal = (event: SelectChangeEvent<'usd' | 'ars' | 'brl' | 'uyu'>) => {
    if (onCurrencyChange) {
      onCurrencyChange(event.target.value as 'usd' | 'ars' | 'brl' | 'uyu')
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tableData?.wallet || '')
    enqueueSnackbar(t('balances.address-copied'), { variant: 'success' })
  }

  const renderTitle = (
    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ ml: 1 }}>
      <Typography variant='h6'>{title || t('balances.title')} </Typography>
      {onToggleHideValues && (
        <IconButton color='inherit' onClick={onToggleHideValues} sx={{ opacity: 0.48 }}>
          <Iconify icon={hideValues ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
        </IconButton>
      )}
      <IconButton onClick={() => window.open(walletLinkL2, '_blank')}>
        <Tooltip title={t('balances.view-on-explorer')} arrow>
          <Iconify icon='eva:external-link-outline' />
        </Tooltip>
      </IconButton>
    </Stack>
  )

  const renderActions = (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent={mdUp ? 'flex-end' : 'center'}
      spacing={mdUp ? 2 : 1}
      sx={{ mb: mdUp ? 0 : 3, px: mdUp ? 0 : 3 }}
    >
      <Button
        fullWidth={!mdUp}
        sx={{
          px: mdUp ? undefined : 2
        }}
        variant='contained'
        color='primary'
        startIcon={<Iconify icon='eva:diagonal-arrow-left-down-fill' />}
        onClick={depositModal.onTrue}
      >
        {t('balances.deposit')}
      </Button>
      <Button
        fullWidth={!mdUp}
        sx={{
          px: mdUp ? undefined : 2
        }}
        variant='outlined'
        color='inherit'
        startIcon={<Iconify icon='eva:diagonal-arrow-right-up-fill' />}
        onClick={() => window.open(sendReciveUrl, '_blank')}
      >
        {t('balances.send')}
      </Button>
    </Stack>
  )

  const renderTotal = (
    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 2, px: 2, ml: 1 }}>
      <Typography variant='h3'>
        {'$ '}
        {!hideValues
          ? fNumber(tableData && tableData.totals && tableData.totals[selectedCurrency]) || '0.00'
          : '********'}
      </Typography>
      <Select
        value={selectedCurrency ?? ''}
        onChange={handleCurrencyChangeLocal}
        sx={{ border: 'none', '& fieldset': { border: 'none' } }}
      >
        {tableData &&
          tableData.totals &&
          Object.keys(tableData.totals).map((currencyKey) => (
            <MenuItem key={currencyKey} value={currencyKey}>
              {currencyKey.toUpperCase()}
            </MenuItem>
          ))}
      </Select>
    </Stack>
  )

  const renderSummaryDesktop = (
    <Card {...other}>
      <Stack direction='row' justifyContent='space-between' sx={{ mt: 2, px: 2, mb: 2 }}>
        {renderTitle}

        {renderActions}
      </Stack>

      {renderTotal}
    </Card>
  )

  const renderSummaryMobile = (
    <Card {...other}>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mt: 2, px: 3, mb: 1 }}
      >
        {renderTitle}
      </Stack>

      {renderTotal}
      {renderActions}
    </Card>
  )

  // Layerswap's app background — must match exactly so dialog blends with the iframe
  const LS_BG = '#0c1526'

  const renderDepositModal = (
    <Dialog
      open={depositModal.value}
      onClose={handleCloseDeposit}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: LS_BG,
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' sx={{ color: '#fff' }}>
            {t('deposit.title')}
          </Typography>
          <IconButton onClick={handleCloseDeposit} size='small' sx={{ color: alpha('#fff', 0.6) }}>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 0, pb: 0 }}>
        {!showAddress ? (
          <Stack spacing={0} alignItems='center'>
            <LayerswapWidget destAddress={tableData?.wallet || ''} embedded />

            <Button
              variant='text'
              size='small'
              onClick={() => setShowAddress(true)}
              sx={{
                mt: 1.5,
                mb: 2,
                color: alpha('#fff', 0.45),
                '&:hover': {
                  color: alpha('#fff', 0.7),
                  bgcolor: alpha('#fff', 0.06)
                }
              }}
            >
              {t('deposit.show-address', 'See my address on Scroll')}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3} alignItems='center' sx={{ py: 2, px: 3 }}>
            {/* QR Code */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#fff',
                borderRadius: 2
              }}
            >
              <QRCode value={tableData?.wallet || ''} size={200} />
            </Box>

            <Stack spacing={1} sx={{ width: 1 }}>
              <Typography variant='caption' sx={{ color: alpha('#fff', 0.5) }}>
                {t('deposit.wallet-address')}
              </Typography>
              <Typography
                variant='body2'
                sx={{ wordBreak: 'break-all', fontFamily: 'monospace', color: '#fff' }}
              >
                {tableData?.wallet}
              </Typography>
            </Stack>

            {/* Network Info */}
            <Stack
              direction='row'
              spacing={1.5}
              alignItems='center'
              sx={{
                width: '100%',
                p: 2,
                bgcolor: alpha('#fff', 0.06),
                borderRadius: 1.5
              }}
            >
              <Box
                component='img'
                src='https://storage.googleapis.com/chatbot-multimedia/chatterpay/images/tokens/scr.svg'
                alt='Scroll Network'
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%'
                }}
              />
              <Stack spacing={0.25}>
                <Typography variant='subtitle2' sx={{ color: '#fff' }}>
                  {t('deposit.network')}: Scroll
                </Typography>
              </Stack>
            </Stack>

            {/* Warning Alert */}
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

            <Button
              variant='text'
              size='small'
              startIcon={<Iconify icon='eva:arrow-back-fill' width={16} />}
              onClick={() => setShowAddress(false)}
              sx={{
                color: alpha('#fff', 0.45),
                '&:hover': {
                  color: alpha('#fff', 0.7),
                  bgcolor: alpha('#fff', 0.06)
                }
              }}
            >
              {t('deposit.back-to-deposit', 'Back to deposit')}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      {mdUp ? renderSummaryDesktop : renderSummaryMobile}
      {renderDepositModal}
    </>
  )
}
