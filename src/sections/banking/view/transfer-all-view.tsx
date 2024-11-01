'use client'

import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import ChangeEmail from '../transfer-all'

// ----------------------------------------------------------------------

export default function TransferAllView() {
  const settings = useSettingsContext()
  const { t } = useTranslate()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('menu.email')}
        links={[
          { name: t('menu._dashboard'), href: paths.dashboard.root },
          { name: t('menu.transfer-all') }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <ChangeEmail />
    </Container>
  )
}
