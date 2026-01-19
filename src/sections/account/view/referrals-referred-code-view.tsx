'use client'

import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import ReferralsReferredCode from '../referrals-referred-code'

// ----------------------------------------------------------------------

export default function ReferralsReferredCodeView() {
  const settings = useSettingsContext()
  const { t } = useTranslate()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        links={[
          { name: t('menu._dashboard'), href: paths.dashboard.root },
          { name: t('menu.user'), href: paths.dashboard.user.root },
          { name: t('user.referrals.title'), href: paths.dashboard.user.referrals },
          { name: t('user.referrals.referredCode.title') }
        ]}
        sx={{
          mb: { xs: 2, md: 3 }
        }}
      />

      <Stack spacing={1} sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant='h4'>{t('user.referrals.referredCode.title')}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('user.referrals.referredCode.description')}
        </Typography>
      </Stack>

      <ReferralsReferredCode />
    </Container>
  )
}
