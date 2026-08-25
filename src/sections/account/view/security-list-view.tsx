'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import SecurityList from '../security-list'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Security hub page: links to status, recovery questions, PIN and events.
 * @returns {JSX.Element} Security list view.
 */
export default function SecurityListView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.security.title')}
      description={t('user.security.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.security.title') }
      ]}
    >
      <SecurityList />
    </UserPageShell>
  )
}
