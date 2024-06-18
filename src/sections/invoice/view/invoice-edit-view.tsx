'use client'

import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { _invoices } from 'src/app/api/_data/_mock'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import InvoiceNewEditForm from '../invoice-new-edit-form'

// ----------------------------------------------------------------------

type Props = {
  id: string
}

export default function InvoiceEditView({ id }: Props) {
  const settings = useSettingsContext()

  const currentInvoice = _invoices.find((invoice) => invoice.id === id)

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Invoice',
            href: paths.dashboard.invoice.root
          },
          { name: currentInvoice?.invoiceNumber }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <InvoiceNewEditForm currentInvoice={currentInvoice} />
    </Container>
  )
}
