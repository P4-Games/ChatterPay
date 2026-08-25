import type { ReactNode } from 'react'

import Analytics from 'src/components/analytics/analytics'

// ----------------------------------------------------------------------

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Analytics />
      {children}
    </>
  )
}
