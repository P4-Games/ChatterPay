import { ReactNode } from 'react'

import BaseLayout from 'src/layouts/baseLayout'

// ----------------------------------------------------------------------

export default function productLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>
}
