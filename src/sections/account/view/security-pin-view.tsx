'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import SecurityPinManagement from '../security-pin'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Security PIN page: set or reset the security PIN.
 * @returns {JSX.Element} Security PIN view.
 */
export default function SecurityPinView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('security.pin.title')}
      description={t('security.pin.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.security.title'), href: paths.dashboard.user.security },
        { name: t('security.pin.title') }
      ]}
    >
      <SecurityPinManagement />
    </UserPageShell>
  )
}
