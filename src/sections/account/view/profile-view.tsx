'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import ProfileDetail from '../profile-detail'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Profile page: personal details list (name, phone, wallet, email).
 * @returns {JSX.Element} Profile view.
 */
export default function ProfileView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.profile.title')}
      description={t('user.profile.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.profile.title') }
      ]}
    >
      <ProfileDetail />
    </UserPageShell>
  )
}
