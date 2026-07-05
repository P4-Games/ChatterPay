import { useRef, useState, useEffect } from 'react'
import { m, animate, useInView, useReducedMotion } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { CONTACT_EMAIL, CHATIZALO_PHONE_NUMBER } from 'src/config-global'

import Iconify from 'src/components/iconify'
import { varFade, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

const JUNGLE = '#0B2B1B'
const PINE = 'hsla(147, 41%, 21%, 1)'
const CHAT_GREEN = '#25D366'

const StyledRoot = styled('div')(() => ({
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  minHeight: '100vh',
  background: `radial-gradient(1100px 640px at 80% 10%, ${alpha(PINE, 0.9)} 0%, transparent 60%), ${JUNGLE}`
}))

// ----------------------------------------------------------------------

const formatCac = (value: number) => (value >= 10 ? `$${value.toFixed(0)}` : `$${value.toFixed(2)}`)

/** Animated counter that collapses the $100 app-store CAC down to $0.30. */
const CacCounter = () => {
  const { t } = useTranslate()
  const shouldReduceMotion = useReducedMotion()

  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [value, setValue] = useState(100)

  useEffect(() => {
    if (!isInView) return undefined

    if (shouldReduceMotion) {
      setValue(0.3)
      return undefined
    }

    const controls = animate(100, 0.3, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(latest)
    })
    return () => controls.stop()
  }, [isInView, shouldReduceMotion])

  const settled = value <= 0.31

  return (
    <Box ref={ref} sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: { xs: 20, md: 24 },
          fontWeight: 600,
          color: alpha('#FFFFFF', 0.35),
          textDecoration: 'line-through',
          textDecorationThickness: 2,
          mb: 1
        }}
      >
        $100 · {t('b2b.hero.cac_old_label')}
      </Typography>

      <Typography
        component='div'
        sx={{
          fontSize: { xs: 88, sm: 120, md: 140 },
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          color: settled ? CHAT_GREEN : alpha('#FFFFFF', 0.9),
          transition: 'color 0.4s ease',
          textShadow: settled ? `0 0 80px ${alpha(CHAT_GREEN, 0.5)}` : 'none'
        }}
      >
        {formatCac(value)}
      </Typography>

      <Typography
        variant='overline'
        sx={{ color: alpha('#FFFFFF', 0.6), letterSpacing: 2, display: 'block', mt: 2 }}
      >
        {t('b2b.hero.cac_new_label')}
      </Typography>
    </Box>
  )
}

// ----------------------------------------------------------------------

/** B2B hero: the acquisition-cost pitch with mail and WhatsApp calls to action. */
export default function B2BHero() {
  const { t } = useTranslate()

  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('b2b.hero.mail_subject'))}`
  const whatsappHref = `https://wa.me/${CHATIZALO_PHONE_NUMBER}?text=${encodeURIComponent(t('b2b.hero.whatsapp_msg'))}`

  return (
    <StyledRoot>
      <Container
        component={MotionContainer}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: { md: '100vh' },
          pt: { xs: 14, md: 12 },
          pb: { xs: 10, md: 12 }
        }}
      >
        <Grid container spacing={{ xs: 8, md: 6 }} alignItems='center'>
          <Grid xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <m.div variants={varFade({ distance: 24 }).inUp} style={{ marginTop: 32 }}>
              <Typography
                variant='overline'
                sx={{ color: CHAT_GREEN, letterSpacing: 2, display: 'block', mb: 2 }}
              >
                {t('b2b.hero.eyebrow')}
              </Typography>
            </m.div>

            <m.div variants={varFade({ distance: 24 }).inUp}>
              <Typography
                variant='h1'
                sx={{
                  color: 'common.white',
                  fontSize: { xs: 36, sm: 44, md: 52 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 3
                }}
              >
                {t('b2b.hero.title')}
              </Typography>
            </m.div>

            <m.div variants={varFade({ distance: 24 }).inUp}>
              <Typography
                sx={{
                  color: alpha('#FFFFFF', 0.72),
                  fontSize: { xs: 16, md: 18 },
                  maxWidth: 500,
                  mx: { xs: 'auto', md: 0 },
                  mb: 5
                }}
              >
                {t('b2b.hero.subtitle')}
              </Typography>
            </m.div>

            <m.div variants={varFade({ distance: 24 }).inUp}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems='center'
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                <Button
                  component='a'
                  href={mailHref}
                  variant='contained'
                  size='large'
                  startIcon={<Iconify icon='solar:letter-bold-duotone' />}
                  sx={{
                    bgcolor: 'common.white',
                    color: JUNGLE,
                    fontWeight: 700,
                    px: 4,
                    '&:hover': { bgcolor: alpha('#FFFFFF', 0.88) }
                  }}
                >
                  {t('b2b.hero.cta_mail')}
                </Button>

                <Button
                  component='a'
                  href={whatsappHref}
                  target='_blank'
                  rel='noopener'
                  variant='outlined'
                  size='large'
                  sx={{
                    color: CHAT_GREEN,
                    borderColor: alpha(CHAT_GREEN, 0.5),
                    fontWeight: 600,
                    px: 4,
                    '&:hover': { borderColor: CHAT_GREEN, bgcolor: alpha(CHAT_GREEN, 0.08) }
                  }}
                >
                  {t('b2b.hero.cta_whatsapp')}
                </Button>
              </Stack>
            </m.div>
          </Grid>

          <Grid xs={12} md={6}>
            <m.div variants={varFade({ distance: 32 }).inUp}>
              <CacCounter />
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  )
}
