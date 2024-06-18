import { _invoices } from 'src/api/_data/_mock/_invoice'

import { InvoiceDetailsView } from 'src/sections/invoice/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Invoice Details'
}

type Props = {
  params: {
    id: string
  }
}

export default function InvoiceDetailsPage({ params }: Props) {
  const { id } = params

  return <InvoiceDetailsView id={id} />
}

export async function generateStaticParams() {
  return _invoices.map((invoice) => ({
    id: invoice.id
  }))
}
