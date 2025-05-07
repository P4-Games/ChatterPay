'use client'

import { useScroll } from 'framer-motion'

import Box from '@mui/material/Box'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

import HomeFaQ from '../home-faq'
import HomeHero from '../home-hero'
import HomeAwards from '../home-awards'
import HomeGetStarted from '../home-get-started'
import HomeMainFeatures from '../home-main-features'
import HomeFiatTransfer from '../home-fiat-transfer'

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

        <HomeFiatTransfer />

        <HomeFaQ />

        <HomeAwards />

        <HomeGetStarted />
      </Box>
    </MainLayout>
  )
}
