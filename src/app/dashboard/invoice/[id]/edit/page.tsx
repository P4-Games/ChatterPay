import { _invoices } from 'src/app/api/_data/_mock/_invoice'

import { InvoiceEditView } from 'src/sections/invoice/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Invoice Edit'
}

type Props = {
  params: {
    id: string
  }
}

export default function InvoiceEditPage({ params }: Props) {
  const { id } = params

  return <InvoiceEditView id={id} />
}

export async function generateStaticParams() {
  return _invoices.map((invoice) => ({
    id: invoice.id
  }))
}
