'use client'

import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import SecurityRecoveryQuestions from '../security-recovery-questions'

// ----------------------------------------------------------------------

export default function SecurityRecoveryView() {
  const settings = useSettingsContext()
  const { t } = useTranslate()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        links={[
          { name: t('menu._dashboard'), href: paths.dashboard.root },
          { name: t('menu.user'), href: paths.dashboard.user.root },
          { name: t('user.security.title'), href: paths.dashboard.user.security },
          { name: t('security.recovery.title') }
        ]}
        sx={{
          mb: { xs: 2, md: 3 }
        }}
      />

      <Stack spacing={1} sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant='h4'>{t('security.recovery.title')}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('security.recovery.description')}
        </Typography>
      </Stack>

      <SecurityRecoveryQuestions />
    </Container>
  )
}
