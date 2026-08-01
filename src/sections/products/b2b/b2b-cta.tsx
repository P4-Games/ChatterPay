import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import { CONTACT_EMAIL, CHATIZALO_PHONE_NUMBER } from 'src/config-global'

import Iconify from 'src/components/iconify'
import { MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const JUNGLE = '#0B2B1B'
const CHAT_GREEN = '#25D366'

const ANIMATIONS: Record<string, Variants> = {
  content: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  }
}

// ----------------------------------------------------------------------

/** Final B2B call to action: one email away from cutting acquisition costs. */
export default function B2BCta() {
  const { t } = useTranslate()

  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('b2b.hero.mail_subject'))}`
  const whatsappHref = `https://wa.me/${CHATIZALO_PHONE_NUMBER}?text=${encodeURIComponent(t('b2b.hero.whatsapp_msg'))}`

  return (
    <Box
      sx={{
        background: `radial-gradient(800px 420px at 50% 0%, ${alpha(CHAT_GREEN, 0.14)} 0%, transparent 60%), ${JUNGLE}`
      }}
    >
      <Container component={MotionViewport} sx={{ py: { xs: 12, md: 16 } }}>
        <m.div
          variants={ANIMATIONS.content}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.4 }}
        >
          <Stack spacing={3} alignItems='center' sx={{ textAlign: 'center' }}>
            <Typography
              variant='h2'
              sx={{
                color: 'common.white',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                maxWidth: 720
              }}
            >
              {t('b2b.cta.title')}
            </Typography>

            <Typography sx={{ color: alpha('#FFFFFF', 0.7), maxWidth: 560 }}>
              {t('b2b.cta.description')}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems='center'
              sx={{ mt: 1 }}
            >
              <Button
                component='a'
                href={mailHref}
                variant='contained'
                size='large'
                startIcon={<Iconify icon='solar:letter-bold-duotone' />}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 700,
                  bgcolor: CHAT_GREEN,
                  color: JUNGLE,
                  '&:hover': { bgcolor: '#1FBF5B' }
                }}
              >
                {t('b2b.cta.button')}
              </Button>

              <Button
                component='a'
                href={whatsappHref}
                target='_blank'
                rel='noopener'
                variant='outlined'
                size='large'
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: CHAT_GREEN,
                  borderColor: alpha(CHAT_GREEN, 0.5),
                  '&:hover': { borderColor: CHAT_GREEN, bgcolor: alpha(CHAT_GREEN, 0.08) }
                }}
              >
                {t('b2b.hero.cta_whatsapp')}
              </Button>
            </Stack>
          </Stack>
        </m.div>
      </Container>
    </Box>
  )
}
