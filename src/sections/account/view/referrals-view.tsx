'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import ReferralsDetail from '../referrals-detail'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Referrals page: own code, usage count and referred-by code.
 * @returns {JSX.Element} Referrals view.
 */
export default function ReferralsView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.referrals.title')}
      description={t('user.referrals.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.referrals.title') }
      ]}
    >
      <ReferralsDetail />
    </UserPageShell>
  )
}
