'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import ChangeEmail from '../change-email'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Email change page: update the email linked to the account.
 * @returns {JSX.Element} Email edit view.
 */
export default function EmailEditView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('account.email.title')}
      description={t('account.email.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('menu.account'), href: paths.dashboard.user.root },
        { name: t('menu.email') }
      ]}
    >
      <ChangeEmail />
    </UserPageShell>
  )
}
