import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import { Link, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Card, { CardProps } from '@mui/material/Card'
import ListItemText from '@mui/material/ListItemText'
import Badge, { badgeClasses } from '@mui/material/Badge'
import TableContainer from '@mui/material/TableContainer'

import { useResponsive } from 'src/hooks/use-responsive'

import { fNumber } from 'src/utils/format-number'
import { fDate, fTime } from 'src/utils/format-time'

import { useTranslate } from 'src/locales'
import { EXPLORER_L2 } from 'src/config-global'

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

import { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  isLoading: boolean
  tableData: ITransaction[]
  tableLabels: any
  userWallet: string
}

export default function BankingRecentTransitions({
  title,
  subheader,
  tableLabels,
  isLoading,
  tableData,
  userWallet,
  ...other
}: Props) {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const table = useTable()

  const denseHeight = table.dense ? 56 : 56 + 20
  const notFound = !tableData || !tableData.length

  // ----------------------------------------------------------------------

  const renderTitle = <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />

  const renderConent = (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: mdUp ? 720 : 300 }}>
          {mdUp && <TableHeadCustom headLabel={tableLabels} />}

          <TableBody>
            {tableData.map((row) => (
              <BankingRecentTransitionsRow
                key={row.id}
                userWallet={userWallet}
                row={row}
                mdUp={mdUp}
              />
            ))}

            <TableEmptyRows
              height={denseHeight}
              emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
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
}

function BankingRecentTransitionsRow({ userWallet, row, mdUp }: BankingRecentTransitionsRowProps) {
  const theme = useTheme()
  const { t } = useTranslate()
  const lightMode = theme.palette.mode === 'light'
  const trxReceive: boolean = userWallet === row.wallet_to
  const contact: string = (trxReceive ? row.contact_from_name : row.contact_to_name) || ''
  const phone: string = trxReceive ? row.contact_from_phone : row.contact_to_phone || ''
  const message: string = `${
    trxReceive ? t('transactions.receive-from') : t('transactions.sent-to')
  } ${contact}`
  const trxLink = `${EXPLORER_L2}/tx/${row.trx_hash}`

  const popover = usePopover()

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
        <Avatar
          src={row.contact_to_avatar_url || ''}
          sx={{
            width: 48,
            height: 48,
            color: 'text.secondary',
            bgcolor: 'background.neutral'
          }}
        />
      </Badge>
    </Box>
  )

  const renderContentDesktop = (
    <TableRow>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        {renderAvatar}
        <Link href={trxLink} target='_blank' rel='noopener' sx={{ mr: 1 }}>
          <IconButton>
            <Iconify icon='eva:external-link-outline' />
          </IconButton>
        </Link>
        <ListItemText primary={message} secondary={phone} />
      </TableCell>

      <TableCell>
        {fNumber(row.amount)} {row.token}
      </TableCell>

      <TableCell>
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

      <TableCell>
        <Label
          variant={lightMode ? 'soft' : 'filled'}
          color={
            (row.status === 'completed' && 'success') ||
            (row.status === 'progress' && 'warning') ||
            'error'
          }
        >
          {row.status}
        </Label>
      </TableCell>

      <TableCell align='right' sx={{ pr: 1 }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon='eva:more-vertical-fill' />
        </IconButton>
      </TableCell>
    </TableRow>
  )

  const renderContentMobile = (
    <TableRow>
      <TableCell sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Link href={trxLink} target='_blank' rel='noopener' sx={{ mr: 1 }}>
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
              ml: 0.5,
              mr: 2,
              [`& .${badgeClasses.badge}`]: {
                p: 0,
                width: 20
              }
            }}
          />
        </Link>
        <ListItemText
          primary={message}
          secondary={
            <>
              {phone}
              <Box component='span' sx={{ display: 'block', mt: 0.5 }}>
                {`${fDate(new Date(row.date))} ${fTime(new Date(row.date))}`}
              </Box>
            </>
          }
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
        />
      </TableCell>

      <TableCell sx={{ width: '35%', textAlign: 'right' }}>
        <ListItemText
          primary={`${fNumber(row.amount)} ${row.token}`}
          secondary={
            <Label
              variant={lightMode ? 'soft' : 'filled'}
              color={
                (row.status === 'completed' && 'success') ||
                (row.status === 'progress' && 'warning') ||
                'error'
              }
            >
              {row.status}
            </Label>
          }
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
        />
      </TableCell>

      <TableCell align='right' sx={{ width: '5%', pr: 1 }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon='eva:more-vertical-fill' />
        </IconButton>
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
