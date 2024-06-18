import { useState, useCallback } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'

import { fDate } from 'src/utils/format-time'
import { fCurrency } from 'src/utils/format-number'

import { INVOICE_STATUS_OPTIONS } from 'src/api/_data/_mock'

import Label from 'src/components/label'
import Scrollbar from 'src/components/scrollbar'

import { IInvoice } from 'src/types/invoice'

import InvoiceToolbar from './invoice-toolbar'

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}))

// ----------------------------------------------------------------------

type Props = {
  invoice: IInvoice
}

export default function InvoiceDetails({ invoice }: Props) {
  const [currentStatus, setCurrentStatus] = useState(invoice.status)

  const handleChangeStatus = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStatus(event.target.value)
  }, [])

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(invoice.subTotal)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Shipping</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          {fCurrency(-invoice.shipping)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          {fCurrency(-invoice.discount)}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Taxes</TableCell>
        <TableCell width={120}>{fCurrency(invoice.taxes)}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(invoice.totalAmount)}
        </TableCell>
      </StyledTableRow>
    </>
  )

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant='subtitle2'>NOTES</Typography>

        <Typography variant='body2'>
          We appreciate your business. Should you need us to add VAT or extra notes let us know!
        </Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant='subtitle2'>Have a Question?</Typography>

        <Typography variant='body2'>support@chatterpay.com</Typography>
      </Grid>
    </Grid>
  )

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>

              <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>

              <TableCell>Qty</TableCell>

              <TableCell align='right'>Unit price</TableCell>

              <TableCell align='right'>Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {invoice.items.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant='subtitle2'>{row.title}</Typography>

                    <Typography variant='body2' sx={{ color: 'text.secondary' }} noWrap>
                      {row.description}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{row.quantity}</TableCell>

                <TableCell align='right'>{fCurrency(row.price)}</TableCell>

                <TableCell align='right'>{fCurrency(row.price * row.quantity)}</TableCell>
              </TableRow>
            ))}

            {renderTotal}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  )

  return (
    <>
      <InvoiceToolbar
        invoice={invoice}
        currentStatus={currentStatus || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display='grid'
          alignItems='center'
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)'
          }}
        >
          <Box
            component='img'
            alt='logo'
            src='/logo/logo_single.svg'
            sx={{ width: 48, height: 48 }}
          />

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label
              variant='soft'
              color={
                (currentStatus === 'paid' && 'success') ||
                (currentStatus === 'pending' && 'warning') ||
                (currentStatus === 'overdue' && 'error') ||
                'default'
              }
            >
              {currentStatus}
            </Label>

            <Typography variant='h6'>{invoice.invoiceNumber}</Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Invoice From
            </Typography>
            {invoice.invoiceFrom.name}
            <br />
            {invoice.invoiceFrom.fullAddress}
            <br />
            Phone: {invoice.invoiceFrom.phoneNumber}
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Invoice To
            </Typography>
            {invoice.invoiceTo.name}
            <br />
            {invoice.invoiceTo.fullAddress}
            <br />
            Phone: {invoice.invoiceTo.phoneNumber}
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Date Create
            </Typography>
            {fDate(invoice.createDate)}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Due Date
            </Typography>
            {fDate(invoice.dueDate)}
          </Stack>
        </Box>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter}
      </Card>
    </>
  )
}
