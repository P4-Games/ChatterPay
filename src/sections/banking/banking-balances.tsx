import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Card, { type CardProps } from '@mui/material/Card'
import { Stack, Button, Select, Tooltip, Typography, type SelectChangeEvent } from '@mui/material'

import { useBoolean } from 'src/hooks/use-boolean'
import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL, EXPLORER_L2_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'

import DashboardDepositModal from './dashboard-deposit-modal'

import type { IBalances } from 'src/types/wallet'

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

  const mdUp = useResponsive('up', 'md')
  const depositModal = useBoolean()

  const sendReciveUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('balances.wapp-msg'))

  const handleCurrencyChangeLocal = (event: SelectChangeEvent<'usd' | 'ars' | 'brl' | 'uyu'>) => {
    if (onCurrencyChange) {
      onCurrencyChange(event.target.value as 'usd' | 'ars' | 'brl' | 'uyu')
    }
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

  return (
    <>
      {mdUp ? renderSummaryDesktop : renderSummaryMobile}
      <DashboardDepositModal
        open={depositModal.value}
        onClose={depositModal.onFalse}
        walletAddress={tableData?.wallet || ''}
      />
    </>
  )
}
