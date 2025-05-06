'use client'

import { useScroll } from 'framer-motion'

import Box from '@mui/material/Box'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

import HomeFaQ from '../home-faq'
import HomeHero from '../home-hero'
import HomeGetStarted from '../home-get-started'
import HomeRequestDemo from '../home-request-demo'
import HomeAllFeatures from '../home-all-features'
import HomeMainFeatures from '../home-main-features'

// ----------------------------------------------------------------------

export default function HomeView() {
  const { scrollYProgress } = useScroll()
  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <HomeHero />

      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default'
        }}
      >
        <HomeMainFeatures />

        <HomeAllFeatures />

        <HomeRequestDemo />

        <HomeFaQ />

        <HomeGetStarted />
      </Box>
    </MainLayout>
  )
}
