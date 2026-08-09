'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'
import { UI_BASE_URL } from 'src/config-global'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

function getDevUrl(): string {
  const url = new URL(UI_BASE_URL)
  let { hostname } = url

  if (hostname.toLowerCase() === 'localhost') {
    return UI_BASE_URL
  }

  if (hostname.toLowerCase().startsWith('dev.')) {
    return UI_BASE_URL
  }

  hostname = `dev.${hostname}`
  return `${url.protocol}//${hostname}${url.port ? `:${url.port}` : ''}`
}

// ----------------------------------------------------------------------

export default function DevelopmentView(): JSX.Element {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 5, md: 8 },
            pb: { xs: 6, md: 10 },
            textAlign: 'center'
          }}
        >
          <Container>
            <m.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography component='div' variant='overline' sx={{ color: 'text.disabled', mb: 1 }}>
                {t('development.hero.tag', 'Demo')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 2 }}>
                {t('development.hero.title', 'Playground')}
              </Typography>

              <Typography variant='body2' sx={{ mb: 3, color: 'text.disabled' }}>
                {t(
                  'development.hero.label',
                  'Test the future of crypto payments — safe, free, and on testnet.'
                )}
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', mb: 4 }}>
                {t(
                  'development.hero.description',
                  'Use our demo environment to explore ChatterPay features and test integrations.'
                )}
              </Typography>

              <Button variant='contained' size='large' href={getDevUrl()} target='_blank'>
                {t('development.hero.cta', 'Go to Demo Site')} →
              </Button>
            </m.div>
          </Container>
        </Box>

        {/* Placeholder Illustration Section */}
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box
            component='img'
            src='/assets/images/illustrations/playground.png'
            alt='Work in progress'
            sx={{
              maxWidth: { xs: '90%', md: '600px' },
              maxHeight: { xs: 300, md: 400 },
              mb: 3,
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </Container>
      </Box>
    </MainLayout>
  )
}
