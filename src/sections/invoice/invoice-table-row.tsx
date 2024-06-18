import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'

import { useBoolean } from 'src/hooks/use-boolean'

import { fCurrency } from 'src/utils/format-number'
import { fDate, fTime } from 'src/utils/format-time'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { ConfirmDialog } from 'src/components/custom-dialog'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { IInvoice } from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = {
  row: IInvoice
  selected: boolean
  onSelectRow: VoidFunction
  onViewRow: VoidFunction
  onEditRow: VoidFunction
  onDeleteRow: VoidFunction
}

export default function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow
}: Props) {
  const { sent, invoiceNumber, createDate, dueDate, status, invoiceTo, totalAmount } = row

  const confirm = useBoolean()

  const popover = usePopover()

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding='checkbox'>
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={invoiceTo.name} sx={{ mr: 2 }}>
            {invoiceTo.name.charAt(0).toUpperCase()}
          </Avatar>

          <ListItemText
            disableTypography
            primary={
              <Typography variant='body2' noWrap>
                {invoiceTo.name}
              </Typography>
            }
            secondary={
              <Link
                noWrap
                variant='body2'
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {invoiceNumber}
              </Link>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(createDate)}
            secondary={fTime(createDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>

        <TableCell>{fCurrency(totalAmount)}</TableCell>

        <TableCell align='center'>{sent}</TableCell>

        <TableCell>
          <Label
            variant='soft'
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align='right' sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon='eva:more-vertical-fill' />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow='right-top'
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow()
            popover.onClose()
          }}
        >
          <Iconify icon='solar:eye-bold' />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow()
            popover.onClose()
          }}
        >
          <Iconify icon='solar:pen-bold' />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue()
            popover.onClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon='solar:trash-bin-trash-bold' />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title='Delete'
        content='Are you sure want to delete?'
        action={
          <Button variant='contained' color='error' onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  )
}
