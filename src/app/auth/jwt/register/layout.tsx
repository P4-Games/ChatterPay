'use client'

import { useTranslate } from 'src/locales'
import { GuestGuard } from 'src/auth/guard'
import AuthClassicLayout from 'src/layouts/auth/classic'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const { t } = useTranslate()

  return (
    <GuestGuard>
      <AuthClassicLayout title={t('register.title')}>{children}</AuthClassicLayout>
    </GuestGuard>
  )
}
