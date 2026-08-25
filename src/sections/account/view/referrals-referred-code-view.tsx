'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import ReferralsReferredCode from '../referrals-referred-code'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Referred-by code page: link the referral code used to invite the user.
 * @returns {JSX.Element} Referred code view.
 */
export default function ReferralsReferredCodeView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('user.referrals.referredCode.title')}
      description={t('user.referrals.referredCode.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.referrals.title'), href: paths.dashboard.user.referrals },
        { name: t('user.referrals.referredCode.title') }
      ]}
    >
      <ReferralsReferredCode />
    </UserPageShell>
  )
}
