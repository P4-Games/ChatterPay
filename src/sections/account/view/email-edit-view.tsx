'use client'

import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import ChangeEmail from '../change-email'

// ----------------------------------------------------------------------

export default function EmailEditView() {
  const settings = useSettingsContext()
  const { t } = useTranslate()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('menu.email')}
        links={[
          { name: t('menu._dashboard'), href: paths.dashboard.root },
          { name: t('menu.user'), href: paths.dashboard.user.root },
          { name: t('menu.account'), href: paths.dashboard.user.root },
          { name: t('menu.email') }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <ChangeEmail />
    </Container>
  )
}
