'use client'

import { m } from 'framer-motion'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import CompactLayout from 'src/layouts/compact'
import { DISCORD_SUPPORT_URL } from 'src/config-global'
import { ForbiddenIllustration } from 'src/assets/illustrations'

import Iconify from 'src/components/iconify'
import { varBounce, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

/**
 * Shown to an account that has been suspended for activity flagged as an attack on the platform.
 *
 * It is a page of its own rather than an alert on the login form because the suspension is not a
 * failed attempt the user can retry: the form would invite them to keep trying a login that can
 * never succeed. The Discord ticket is the one action left, so it is the primary button.
 *
 * It carries more copy than the other error views and has two buttons instead of one, and
 * `CompactLayout` centres its children inside a `100vh` box with 96px of padding while a fixed
 * 80px header overlays the top. At the 403 view's proportions the buttons landed below the fold on
 * a short viewport, so the heading, the illustration and the vertical rhythm are all a step
 * smaller here, and the illustration shrinks again on the shorter mobile viewport.
 */
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
            href={DISCORD_SUPPORT_URL}
            target='_blank'
            rel='noopener noreferrer'
            variant='contained'
            startIcon={<Iconify icon='ic:baseline-discord' />}
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
