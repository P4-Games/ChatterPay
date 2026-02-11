import { Suspense } from 'react'

import { DepositView } from 'src/sections/deposit/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'ChatterPay: Deposit'
}

export default function DepositPage() {
  return (
    <Suspense>
      <DepositView />
    </Suspense>
  )
}
