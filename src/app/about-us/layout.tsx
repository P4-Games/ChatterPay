import type { ReactNode } from 'react'

import BaseLayout from 'src/layouts/baseLayout'

// ----------------------------------------------------------------------

export default function aboutUsLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>
}
