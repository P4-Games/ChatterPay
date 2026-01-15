import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import { Link, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Card, { type CardProps } from '@mui/material/Card'
import ListItemText from '@mui/material/ListItemText'
import Badge, { badgeClasses } from '@mui/material/Badge'
import TableContainer from '@mui/material/TableContainer'

import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'
import { fDate, fTime } from 'src/utils/format-time'
import { maskAddress } from 'src/utils/format-address'

import { useTranslate } from 'src/locales'
import { EXPLORER_L2_URL } from 'src/config-global'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import CustomPopover, { usePopover } from 'src/components/custom-popover'
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom
} from 'src/components/table'

import type { ITransaction } from 'src/types/wallet'
import Avvvatars from 'avvvatars-react'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  isLoading: boolean
  tableData: ITransaction[]
  tableLabels: any
  userWallet: string
  tokenLogos?: Record<string, string>
}

export default function BankingRecentTransitions({
  title,
  subheader,
  tableLabels,
  isLoading,
  tableData,
  userWallet,
  tokenLogos = {},
  ...other
}: Props) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const table = useTable()
  const [maskAmounts, setMaskAmounts] = useState(false)

  // Load mask preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('maskTransactionAmounts')
    if (savedPreference !== null) {
      setMaskAmounts(savedPreference === 'true')
    }
  }, [])

  // Save mask preference to localStorage
  const handleToggleMask = () => {
    const newValue = !maskAmounts
    setMaskAmounts(newValue)
    localStorage.setItem('maskTransactionAmounts', String(newValue))
  }

  const denseHeight = table.dense ? 56 : 56 + 20
  const notFound = !tableData || !tableData.length

  // ----------------------------------------------------------------------

  const renderTitle = (
    <CardHeader
      title={title}
      subheader={subheader}
      action={
        <Tooltip title={maskAmounts ? 'Show amounts' : 'Hide amounts'}>
          <IconButton onClick={handleToggleMask} size='small'>
            <Iconify icon={maskAmounts ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
          </IconButton>
        </Tooltip>
      }
      sx={{ mb: 3, px: 3, pt: 3 }}
    />
  )

  const renderConent = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} />}

          <TableBody>
            {!notFound &&
              tableData.map((row) => (
                <BankingRecentTransitionsRow
                  key={row.id}
                  userWallet={userWallet}
                  row={row}
                  mdUp={mdUp}
                  maskAmounts={maskAmounts}
                  tokenLogos={tokenLogos}
                />
              ))}

            <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(
                table.page,
                table.rowsPerPage,
                (tableData && tableData.length) || 0
              )}
            />

            <TableNoData notFound={notFound} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )

  const renderContentSkeleton = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} />}

          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton variant='circular' width={48} height={48} sx={{ mr: 2 }} />
                    <Skeleton variant='text' width={120} />
                  </Box>
                </TableCell>

                <TableCell>
                  <Skeleton variant='text' width={80} />
                </TableCell>

                <TableCell>
                  <Skeleton variant='text' width={120} />
                </TableCell>

                <TableCell>
                  <Skeleton variant='rectangular' width={80} height={32} />
                </TableCell>

                <TableCell align='right'>
                  <Skeleton variant='circular' width={32} height={32} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )
  const renderActions = (
    <Box sx={{ p: 2, textAlign: 'right' }}>
      <Button
        size='small'
        color='inherit'
        endIcon={<Iconify icon='eva:arrow-ios-forward-fill' width={18} sx={{ ml: -0.5 }} />}
      >
        {t('transactions.table-view-all')}
      </Button>
    </Box>
  )

  return (
    <Card {...other}>
      {renderTitle}

      {isLoading ? renderContentSkeleton : renderConent}

      <Divider sx={{ borderStyle: 'dashed' }} />
      {renderActions}
    </Card>
  )
}

// ----------------------------------------------------------------------

type BankingRecentTransitionsRowProps = {
  userWallet: string
  row: ITransaction
  mdUp: boolean
  maskAmounts: boolean
  tokenLogos: Record<string, string>
}

function getContactData(
  userWallet: string,
  data: ITransaction,
  mdUp: boolean
): { contactName: string; contactIdentifier: string; calculatedAmount: string } {
  let contactName: string = ''
  let contactIdentifier: string = ''
  let calculatedAmount: string = ''

  const trxReceive: boolean = userWallet === data.wallet_to

  if (data.type.toLowerCase() === 'swap') {
    contactName = (trxReceive ? data.contact_to_name : data.contact_from_name) || ''
    contactIdentifier = (trxReceive ? data.contact_to_phone : data.contact_from_phone) || ''
    calculatedAmount = fNumber(data.amount)
  } else {
    // 'transfer' or 'deposit'
    contactName = (trxReceive ? data.contact_from_name : data.contact_to_name) || ''
    contactIdentifier = (trxReceive ? data.contact_from_phone : data.contact_to_phone) || ''
    // Subtract fee when sending, not when receiving
    calculatedAmount = fNumber(data.amount - (!trxReceive ? data.fee || 0 : 0))
  }

  // case: Identifier is a wallet
  if (contactIdentifier.startsWith('0x')) {
    contactIdentifier = maskAddress(contactIdentifier)
  }

  // hide contact name in mobile
  if (!mdUp) {
    contactName = ''
  }

  return { contactName, contactIdentifier, calculatedAmount }
}

function BankingRecentTransitionsRow({ userWallet, row, mdUp, maskAmounts, tokenLogos }: BankingRecentTransitionsRowProps) {
  const theme = useTheme()
  const { t } = useTranslate()
  const lightMode = theme.palette.mode === 'light'
  const trxReceive: boolean = userWallet === row.wallet_to
  const { contactName, contactIdentifier, calculatedAmount } = getContactData(userWallet, row, mdUp)
  const message: string = `${
    trxReceive ? t('transactions.receive-from') : t('transactions.sent-to')
  } ${contactName}`
  const trxLink = `${EXPLORER_L2_URL}/tx/${row.trx_hash}`

  const popover = usePopover()

  // Mask amount if enabled
  const displayAmount = maskAmounts ? '***' : calculatedAmount

  const handleDownload = () => {
    popover.onClose()
    console.info('DOWNLOAD', row.id)
  }

  const handlePrint = () => {
    popover.onClose()
    console.info('PRINT', row.id)
  }

  const handleShare = () => {
    popover.onClose()
    console.info('SHARE', row.id)
  }

  const tokenLogo = tokenLogos[row.token]

  const renderTokenIcon = (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 1,
        flexShrink: 0
      }}
    >
      {tokenLogo ? (
        <Box
          component='img'
          src={tokenLogo}
          alt={row.token}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%'
          }}
        />
      ) : (
        <Avvvatars value={row.token} style='character' size={24} displayValue={row.token.substring(0, 2)} />
      )}
    </Box>
  )

  const renderAvatar = (
    <Box sx={{ position: 'relative', mr: 2 }}>
      <Badge
        overlap='circular'
        color={trxReceive ? 'success' : 'error'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Iconify
            icon={
              trxReceive ? 'eva:diagonal-arrow-left-down-fill' : 'eva:diagonal-arrow-right-up-fill'
            }
            width={16}
          />
        }
        sx={{
          [`& .${badgeClasses.badge}`]: {
            p: 0,
            width: 20
          }
        }}
      >
        <Avvvatars
          value={contactName || (trxReceive ? row.wallet_from : (row.wallet_to || ''))}
          style={contactName ? 'character' : 'shape'}
          size={48}
        />
      </Badge>
    </Box>
  )

  const renderContentDesktop = (
    <TableRow sx={{ opacity: row.status === 'pending' ? 0.6 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        {renderAvatar}
        <ListItemText primary={message} secondary={contactIdentifier} sx={{ minWidth: 0 }} />
      </TableCell>

      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderTokenIcon}
          <Box>
            {displayAmount} {row.token}
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 2 }}>
        <ListItemText
          primary={fDate(new Date(row.date))}
          secondary={fTime(new Date(row.date))}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
        />
      </TableCell>

      <TableCell align='right' sx={{ py: 2, pr: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Link href={trxLink} target='_blank' rel='noopener'>
            <IconButton size='small'>
              <Iconify icon='eva:external-link-outline' />
            </IconButton>
          </Link>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  )

  const renderContentMobile = (
    <TableRow sx={{ opacity: row.status === 'pending' ? 0.6 : 1 }}>
      <TableCell sx={{ display: 'flex', alignItems: 'center', py: 2, pl: 3 }}>
        <Box sx={{ position: 'relative', mr: 1.5 }}>
          <Badge
            overlap='circular'
            color={trxReceive ? 'success' : 'error'}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Iconify
                icon={
                  trxReceive
                    ? 'eva:diagonal-arrow-left-down-fill'
                    : 'eva:diagonal-arrow-right-up-fill'
                }
                width={16}
              />
            }
            sx={{
              [`& .${badgeClasses.badge}`]: {
                p: 0,
                width: 20
              }
            }}
          >
            <Avvvatars
              value={contactName || (trxReceive ? row.wallet_from : (row.wallet_to || ''))}
              style={contactName ? 'character' : 'shape'}
              size={40}
            />
          </Badge>
        </Box>
        <ListItemText
          primary={message}
          secondary={
            <>
              {contactIdentifier}
              <Box component='span' sx={{ display: 'block', mt: 0.5 }}>
                {`${fDate(new Date(row.date))} ${fTime(new Date(row.date))}`}
              </Box>
            </>
          }
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
          sx={{ minWidth: 0, flex: 1 }}
        />
      </TableCell>

      <TableCell sx={{ textAlign: 'right', py: 2, whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {renderTokenIcon}
          <ListItemText
            primary={`${displayAmount} ${row.token}`}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </Box>
      </TableCell>

      <TableCell align='right' sx={{ py: 2, pr: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Link href={trxLink} target='_blank' rel='noopener'>
            <IconButton size='small'>
              <Iconify icon='eva:external-link-outline' />
            </IconButton>
          </Link>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen} size='small'>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  )

  return (
    <>
      {mdUp ? renderContentDesktop : renderContentMobile}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow='right-top'
        sx={{ width: 160 }}
      >
        <MenuItem onClick={handleDownload}>
          <Iconify icon='eva:cloud-download-fill' />
          {t('transactions.table-download')}
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <Iconify icon='solar:printer-minimalistic-bold' />
          {t('transactions.table-print')}
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <Iconify icon='solar:share-bold' />
          {t('transactions.table-share')}
        </MenuItem>
      </CustomPopover>
    </>
  )
}
