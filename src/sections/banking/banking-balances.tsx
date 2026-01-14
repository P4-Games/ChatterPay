import { useState } from 'react'
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
  Typography,
  DialogTitle,
  DialogContent,
  type SelectChangeEvent
} from '@mui/material'

import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'
import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, EXPLORER_L2_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

import type { IBalances, CurrencyKey } from 'src/types/wallet'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  tableData: IBalances
}
export default function BankingBalances({
  title,
  subheader,

  tableData,
  ...other
}: Props) {
  const walletLinkL2 = `${EXPLORER_L2_URL}/address/${tableData?.wallet || ''}`

  const { t } = useTranslate()

  const mdUp = useResponsive('up', 'md')
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyKey>('usd')
  const currency = useBoolean()
  const depositModal = useBoolean()
  const router = useRouter()

  const sendReciveUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('balances.wapp-msg'))

  const handleCurrencyChange = (event: SelectChangeEvent<CurrencyKey>) => {
    setSelectedCurrency(event.target.value as CurrencyKey)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tableData?.wallet || '')
    enqueueSnackbar('Address copied!', { variant: 'success' })
  }

  const renderTitle = (
    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ ml: 1 }}>
      <Typography variant='h6'>{title || 'Your money'} </Typography>
      <IconButton color='inherit' onClick={currency.onToggle} sx={{ opacity: 0.48 }}>
        <Iconify icon={currency.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
      </IconButton>
      <IconButton onClick={() => window.open(walletLinkL2, '_blank')}>
        <Tooltip title='View on Explorer' arrow>
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
      sx={{ mb: mdUp ? 0 : 2 }}
    >
      <Button
        fullWidth={!mdUp}
        sx={{
          px: mdUp ? undefined : 2,
          mx: mdUp ? 0 : 1
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
          px: mdUp ? undefined : 2,
          mx: mdUp ? 0 : 1
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
        {"$ "}{currency.value
          ? fNumber(tableData && tableData.totals && tableData.totals[selectedCurrency]) || '0.00'
          : '********'}
      </Typography>
      <Select
        value={selectedCurrency ?? ''}
        onChange={handleCurrencyChange}
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
        sx={{ mt: 1, px: 2, mb: 1 }}
      >
        {renderTitle}
      </Stack>

      {renderTotal}
      {renderActions}
    </Card>
  )

  const renderDepositModal = (
    <Dialog open={depositModal.value} onClose={depositModal.onFalse} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Deposit
        <IconButton onClick={depositModal.onFalse} sx={{ ml: 'auto' }}>
          <Iconify icon='eva:close-fill' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} alignItems='center' sx={{ py: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2 }}>
            <QRCode value={tableData?.wallet || ''} size={200} />
          </Box>
          
          <Stack spacing={1} sx={{ width: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Wallet Address
            </Typography>
            <Typography variant='body2' sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {tableData?.wallet}
            </Typography>
          </Stack>

          <Button
            fullWidth
            variant='contained'
            startIcon={<Iconify icon='eva:copy-fill' />}
            onClick={handleCopyAddress}
          >
            Copy Address
          </Button>
        </Stack>
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
