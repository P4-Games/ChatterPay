'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

export default function PolymarketView(): JSX.Element {
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
                {t('products.hero.tag', 'Products')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 1 }}>
                {t('products.hero.polymarket.title', 'Polymarket')}
              </Typography>

              <Typography variant='body2' sx={{ mb: 3, color: 'text.disabled' }}>
                {t(
                  'products.polymarket-view.status',
                  '🔮 Beta — available now from your ChatterPay wallet.'
                )}
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', mb: 4 }}>
                {t(
                  'products.hero.polymarket.description',
                  'Trade prediction markets on real-world events, right from your ChatterPay wallet.'
                )}
              </Typography>

              <Button
                component={RouterLink}
                href={paths.dashboard.polymarket.root}
                variant='contained'
                size='large'
              >
                {t('products.polymarket-view.cta', 'Try Polymarket')}
              </Button>
            </m.div>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  )
}
