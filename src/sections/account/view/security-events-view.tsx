'use client'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import SecurityEvents from '../security-events'
import UserPageShell from '../user-page-shell'

// ----------------------------------------------------------------------

/**
 * Security events page: activity and security changes log.
 * @returns {JSX.Element} Security events view.
 */
export default function SecurityEventsView() {
  const { t } = useTranslate()

  return (
    <UserPageShell
      title={t('security.events.title')}
      description={t('security.events.description')}
      links={[
        { name: t('menu._dashboard'), href: paths.dashboard.root },
        { name: t('menu.user'), href: paths.dashboard.user.root },
        { name: t('user.security.title'), href: paths.dashboard.user.security },
        { name: t('security.events.title') }
      ]}
    >
      <SecurityEvents />
    </UserPageShell>
  )
}
