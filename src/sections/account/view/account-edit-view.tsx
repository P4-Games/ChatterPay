'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import AccountGeneral from '../account-general'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Account edit page: general account settings.
 * @returns {JSX.Element} Account edit view.
 */
export default function AccountEditView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('menu.account')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('menu.account') }
      ]}
    >
      <AccountGeneral />
    </UserPageShell>
  )
}
