'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import SecurityStatusDetail from '../security-status'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Security status page: PIN info, failed attempts and lock status.
 * @returns {JSX.Element} Security status view.
 */
export default function SecurityStatusView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('security.status.title')}
      description={t('security.status.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.security.title'), href: paths.dashboard.user.security },
        { name: t('security.status.title') }
      ]}
    >
      <SecurityStatusDetail />
    </UserPageShell>
  )
}
