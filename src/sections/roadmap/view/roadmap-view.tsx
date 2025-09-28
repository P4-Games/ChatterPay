'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

export default function RoadmapView(): JSX.Element {
  const { scrollYProgress } = useScroll()

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 5, md: 4 },
            pb: { xs: 6, md: 8 },
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
                Roadmap
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 1 }}>
                ChatterPay Roadmap 🗺️
              </Typography>

              <Typography variant='body2' sx={{ mb: 3, color: 'text.disabled' }}>
                🚧 This page is under construction — check back soon for updates.
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary' }}>
                We’re shaping the future of ChatterPay and will share our upcoming milestones here.
              </Typography>
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
            src='/assets/images/illustrations/work_in_progress.png'
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
