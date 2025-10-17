'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { m, useScroll } from 'framer-motion'

import {
  Box,
  Grid,
  Card,
  Chip,
  alpha,
  useTheme,
  Container,
  Typography,
  CardContent,
  CardActionArea
} from '@mui/material'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'
import { TelegramIcon } from 'src/assets/icons'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

export default function ProductView(): JSX.Element {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()
  const theme = useTheme()

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
              <Typography component='div' variant='overline' sx={{ color: 'text.disabled', mb: 2 }}>
                {t('products.hero.tag', 'Products')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 3 }}>
                {t('products.hero.title', 'Explore')}
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary' }}>
                {t('products.hero.label') ?? 'Discover what you can do with ChatterPay.'}
              </Typography>
            </m.div>
          </Container>
        </Box>

        {/* Products Grid Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Container>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Tile
                  href='/products/basic'
                  title={`⚙️ ${t('products.hero.core.title', 'Core Features')}`}
                  description={t(
                    'products.hero.core.description',
                    'Send money instantly to WhatsApp contacts, swap crypto like BTC or ETH, withdraw funds to any wallet, and create NFT certificates with just a photo.'
                  )}
                  badge={t('products.hero.states.live', 'Live')}
                  cta={`${t('products.hero.cta', 'Learn more')} →`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Tile
                  href='/products/telegram'
                  title={t('products.hero.telegram.title', 'Telegram')}
                  description={t(
                    'products.hero.telegram.description',
                    'Access ChatterPay directly from Telegram. Check your wallet and balance without leaving the chat — fast, secure, and private.'
                  )}
                  badge={t('products.hero.states.live', 'Live')}
                  cta={`${t('products.hero.cta', 'Learn more')} →`}
                  icon={<TelegramIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Tile
                  href='/products/chatterpoints'
                  title={`🎯 ${t('products.hero.chatterpoints.title', 'Chatterpoints')}`}
                  description={t(
                    'products.hero.chatterpoints.description',
                    'Earn points through actions and games.'
                  )}
                  badge={t('products.hero.states.beta', 'Beta')}
                  cta={`${t('products.hero.cta', 'Learn more')} →`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Tile
                  href='/products/staking'
                  title={`💎 ${t('products.hero.staking.title', 'Staking')}`}
                  description={t(
                    'products.hero.staking.description',
                    'Earn while supporting the network.'
                  )}
                  badge={t('products.hero.states.dev', 'In development')}
                  cta={`${t('products.hero.cta', 'Learn more')} →`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Tile
                  href='/products/b2b'
                  title={`💼 ${t('products.hero.b2b.title', 'B2B')}`}
                  description={t(
                    'products.hero.b2b.description',
                    'Integrate crypto flows into your product.'
                  )}
                  badge={t('products.hero.states.planned', 'Planned')}
                  cta={`${t('products.hero.cta', 'Learn more')} →`}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  )
}

// ----------------------------------------------------------------------

function Tile(props: {
  href: string
  title: string
  description: string
  badge: string
  cta: string
  icon?: ReactNode
}): JSX.Element {
  const { href, title, description, badge, cta, icon } = props

  const getColor = (label: string) => {
    const v = (label || '').toLowerCase().trim()

    if (v === 'live' || v === 'activo' || v === 'ativo') return 'success' as const
    if (v.includes('beta')) return 'warning' as const
    if (
      v === 'in development' ||
      v === 'dev' ||
      v.includes('desarrollo') ||
      v.includes('desenvolvimento')
    ) {
      return 'warning' as const
    }
    if (
      v === 'planned' ||
      v.includes('próxim') || // próximamente
      v.includes('planeado') ||
      v.includes('planejado') ||
      v.includes('em breve')
    ) {
      return 'info' as const
    }
    return 'default' as const
  }

  return (
    <Card sx={{ height: '100%' }} elevation={1}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent
          sx={{
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5
            }}
          >
            <Typography
              variant='h6'
              noWrap
              title={title}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {icon && <Box sx={{ width: 20, height: 20, flex: '0 0 auto' }}>{icon}</Box>}
              {title}
            </Typography>
            <Chip label={badge} size='small' color={getColor(badge)} />
          </Box>

          <Typography color='text.secondary'>{description}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant='body2' sx={{ textDecoration: 'underline' }}>
            {cta}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
