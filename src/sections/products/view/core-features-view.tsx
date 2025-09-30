'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

/**
 * Renders the "Core Features" page with sections for Transfer, Swap,
 * Withdraw, and Create NFTs.
 */
export default function CoreFeaturesView(): JSX.Element {
  const { scrollYProgress } = useScroll()

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
                Core Features
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 2 }}>
                Essential Actions in ChatterPay
              </Typography>
              <Typography variant='body2' sx={{ mb: 3, color: 'text.disabled' }}>
                🚧 This page is under construction — check back soon for updates.
              </Typography>
              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary' }}>
                A quick overview of the fundamental tools available to manage your crypto:
                transfers, swaps, withdrawals, and NFTs.
              </Typography>
            </m.div>
          </Container>
        </Box>

        {/* Features Grid */}
        <Container sx={{ pb: { xs: 6, md: 10 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                title='Transfer'
                status='Live'
                description='Send money anywhere in the world instantly with no banks and low fees. If your contacts have WhatsApp, they have ChatterPay.'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                title='Swap'
                status='Live'
                description='Swap tokens instantly at the best rates, directly from your ChatterPay wallet — fast, simple, and secure.'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                title='Withdraw'
                status='Live'
                description='Withdraw your funds anytime to another wallet or contact, with full control and low fees — your money, your rules.'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard
                title='Create NFTs'
                status='Live'
                description='Create photo-based certificates to certify an issue date and guarantee they cannot be deleted or modified.'
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  )
}

// ----------------------------------------------------------------------

/**
 * Reusable card for a feature section.
 * @param {object} props
 * @param {string} props.title - Feature name.
 * @param {'Live' | 'Beta' | 'Coming soon'} props.status - Status badge.
 * @param {string} props.description - Short description of the feature.
 * @returns {JSX.Element} Feature card.
 */
function FeatureCard(props: {
  title: string
  status: 'Live' | 'Beta' | 'Coming soon'
  description: string
}): JSX.Element {
  const { title, status, description } = props

  const getColor = (label: string) => {
    if (label === 'Live') return 'success'
    if (label === 'Beta') return 'info'
    return 'default'
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mb: 2
        }}
      >
        <Typography variant='h6'>{title}</Typography>
        <Chip label={status} size='small' color={getColor(status)} />
      </Box>
      <Typography color='text.secondary'>{description}</Typography>
    </Box>
  )
}
