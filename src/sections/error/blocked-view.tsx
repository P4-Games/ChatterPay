'use client'

import { m } from 'framer-motion'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import CompactLayout from 'src/layouts/compact'
import { SUPPORT_URL } from 'src/config-global'
import { ForbiddenIllustration } from 'src/assets/illustrations'

import Iconify from 'src/components/iconify'
import { varBounce, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function BlockedView() {
  const { t } = useTranslate()

  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            {t('blocked.title')}
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>{t('blocked.description')}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>{t('blocked.appeal')}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: { xs: 120, sm: 160 }, my: { xs: 3, sm: 4 } }} />
        </m.div>

        <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent='center'>
          <Button
            component='a'
            href={SUPPORT_URL}
            target='_blank'
            rel='noopener noreferrer'
            variant='contained'
            startIcon={<Iconify icon='eva:message-circle-fill' />}
          >
            {t('blocked.open-ticket')}
          </Button>

          <Button component={RouterLink} href='/' variant='outlined'>
            {t('blocked.go-home')}
          </Button>
        </Stack>
      </MotionContainer>
    </CompactLayout>
  )
}
