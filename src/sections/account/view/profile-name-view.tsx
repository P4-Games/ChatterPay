'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import ProfileName from '../profile-name'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Profile name page: update the profile display name.
 * @returns {JSX.Element} Profile name view.
 */
export default function ProfileNameView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.profile.name.title')}
      description={t('user.profile.name.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.profile.title'), href: paths.dashboard.user.profile },
        { name: t('user.profile.name.title') }
      ]}
    >
      <ProfileName />
    </UserPageShell>
  )
}
