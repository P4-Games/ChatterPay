'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import UserHome from '../user-home'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * User hub page: entry cards for profile, security and referrals.
 * @returns {JSX.Element} User home view.
 */
export default function UserHomeView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.account.title')}
      description={t('user.account.description')}
      links={[{ name: t('menu._dashboard'), href: paths.dashboard.root }, { name: t('menu.user') }]}
    >
      <UserHome />
    </UserPageShell>
  )
}
