'use client'

import { m } from 'framer-motion'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import { _socials } from 'src/config-global'
import CompactLayout from 'src/layouts/compact'
import { ForbiddenIllustration } from 'src/assets/illustrations'

import Iconify from 'src/components/iconify'
import { varBounce, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

const DISCORD_URL =
  _socials.find((social) => social.value === 'discord')?.path ??
  'https://discord.com/invite/5VHk28uUeq'

// ----------------------------------------------------------------------

/**
 * Shown to an account that has been suspended for activity flagged as an attack on the platform.
 *
 * It is a page of its own rather than an alert on the login form because the suspension is not a
 * failed attempt the user can retry: the form would invite them to keep trying a login that can
 * never succeed. The Discord ticket is the one action left, so it is the primary button.
 */
export default function BlockedView() {
  const { t } = useTranslate()

  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant='h3' sx={{ mb: 2 }}>
            {t('blocked.title')}
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>{t('blocked.description')}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary', mt: 2 }}>{t('blocked.appeal')}</Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 220, my: { xs: 4, sm: 8 } }} />
        </m.div>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent='center'>
          <Button
            component='a'
            href={DISCORD_URL}
            target='_blank'
            rel='noopener noreferrer'
            size='large'
            variant='contained'
            startIcon={<Iconify icon='ic:baseline-discord' />}
          >
            {t('blocked.open-ticket')}
          </Button>

          <Button component={RouterLink} href='/' size='large' variant='outlined'>
            {t('blocked.go-home')}
          </Button>
        </Stack>
      </MotionContainer>
    </CompactLayout>
  )
}
