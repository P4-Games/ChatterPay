'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import SecurityRecoveryQuestions from '../security-recovery-questions'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Recovery questions page: update security questions and answers.
 * @returns {JSX.Element} Security recovery view.
 */
export default function SecurityRecoveryView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('security.recovery.title')}
      description={t('security.recovery.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.security.title'), href: paths.dashboard.user.security },
        { name: t('security.recovery.title') }
      ]}
    >
      <SecurityRecoveryQuestions />
    </UserPageShell>
  )
}
