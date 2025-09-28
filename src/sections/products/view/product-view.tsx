'use client'

import Link from 'next/link'
import { useScroll } from 'framer-motion'

import {
  Box,
  Grid,
  Card,
  Chip,
  Container,
  Typography,
  CardContent,
  CardActionArea
} from '@mui/material'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

export default function ProductView(): JSX.Element {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Container maxWidth='lg' sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant='h3' component='h1' gutterBottom>
            {t('Products') ?? 'Products'}
          </Typography>
          <Typography color='text.secondary'>
            {t('Discover what you can do with ChatterPay.') ??
              'Discover what you can do with ChatterPay.'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <Tile
              href='/products/basic'
              title='Core Features ⚙️'
              description='Send money instantly to WhatsApp contacts, swap crypto like BTC or ETH, withdraw funds to any wallet, and create NFT certificates with just a photo.'
              badge='Live'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Tile
              href='/products/chatterpoints'
              title='ChatterPoints 🎯'
              description='Earn points through actions and games.'
              badge='In development'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Tile
              href='/products/staking'
              title='Staking 💎'
              description='Earn while supporting the network.'
              badge='In development'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Tile
              href='/products/b2b'
              title='B2B 💼'
              description='Integrate crypto flows into your product.'
              badge='Planned'
            />
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  )
}

// ----------------------------------------------------------------------

function Tile(props: {
  href: string
  title: string
  description: string
  badge: string
}): JSX.Element {
  const { href, title, description, badge } = props

  const getColor = (label: string) => {
    if (label === 'Live') return 'success'
    if (label === 'In development') return 'warning'
    return 'default'
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
            <Typography variant='h6' noWrap title={title}>
              {title}
            </Typography>
            <Chip label={badge} size='small' color={getColor(badge)} />
          </Box>

          <Typography color='text.secondary'>{description}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant='body2' sx={{ textDecoration: 'underline' }}>
            Learn more →
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
