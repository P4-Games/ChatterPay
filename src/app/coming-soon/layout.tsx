'use client'

import CompactLayout from 'src/layouts/compact'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return <CompactLayout>{children}</CompactLayout>
}
