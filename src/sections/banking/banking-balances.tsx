import { useState } from 'react'

import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Card, { CardProps } from '@mui/material/Card'
import {
  Box,
  Stack,
  Button,
  Select,
  Tooltip,
  Popover,
  Typography,
  SelectChangeEvent
} from '@mui/material'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'
import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, EXPLORER_L1_URL, EXPLORER_L2_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

import { IBalances, CurrencyKey } from 'src/types/wallet'

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
  const walletLinkL1 = `${EXPLORER_L1_URL}/address/${tableData?.wallet || ''}`
  const walletLinkL2 = `${EXPLORER_L2_URL}/address/${tableData?.wallet || ''}`

  const { t } = useTranslate()

  const mdUp = useResponsive('up', 'md')
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyKey>('usd')
  const currency = useBoolean()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'wallet-links-popover' : undefined
  const router = useRouter()

  const sendReciveUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('balances.wapp-msg'))

  const handleCurrencyChange = (event: SelectChangeEvent<CurrencyKey>) => {
    setSelectedCurrency(event.target.value as CurrencyKey)
  }

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
  }

  const renderTitle = (
    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ ml: 1 }}>
      <Typography variant='h6'>{title || 'Estimated Balance'} </Typography>
      <IconButton color='inherit' onClick={currency.onToggle} sx={{ opacity: 0.48 }}>
        <Iconify icon={currency.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
      </IconButton>
      <IconButton onClick={handleOpenPopover}>
        <Tooltip title='View Wallet Links' arrow>
          <Iconify icon='eva:external-link-outline' />
        </Tooltip>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Button onClick={() => window.open(walletLinkL1, '_blank')} variant='contained'>
            l1
          </Button>
          <Button onClick={() => window.open(walletLinkL2, '_blank')} variant='contained'>
            l2
          </Button>
        </Box>
      </Popover>
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
        onClick={() => window.open(sendReciveUrl, '_blank')}
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
      <Button
        fullWidth={!mdUp}
        sx={{
          px: mdUp ? undefined : 2,
          mx: mdUp ? 0 : 1
        }}
        variant='outlined'
        color='warning'
        startIcon={<Iconify icon='mdi:arrow-collapse-all' />}
        onClick={() => router.push(paths.dashboard.transfer.all)}
      >
        {t('balances.transfer-all')}
      </Button>
    </Stack>
  )

  const renderTotal = (
    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 2, px: 2, ml: 1 }}>
      <Typography variant='h3'>
        {currency.value
          ? fNumber(tableData && tableData.totals && tableData.totals[selectedCurrency]) || 0.0
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

  return mdUp ? renderSummaryDesktop : renderSummaryMobile
}
