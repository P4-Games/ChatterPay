'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import Security from '../security'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Security page: security settings overview.
 * @returns {JSX.Element} Security view.
 */
export default function SecurityView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('menu.security')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('menu.security') }
      ]}
    >
      <Security />
    </UserPageShell>
  )
}
