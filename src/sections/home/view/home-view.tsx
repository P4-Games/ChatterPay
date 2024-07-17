'use client'

import { useScroll } from 'framer-motion'

import Box from '@mui/material/Box'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

import HomeFaQ from '../home-faq'
import HomeHero from '../home-hero'
import HomeStackTech from '../home-stack-tech'
import HomeGetStarter from '../home-get-starter'
import HomeRequestDemo from '../home-request-demo'
import HomeAllFeatures from '../home-all-features'
import HomeMainFeatures from '../home-main-features'

// ----------------------------------------------------------------------
/*
type StyledPolygonProps = {
  anchor?: 'top' | 'bottom'
}

const StyledPolygon = styled('div')<StyledPolygonProps>(({ anchor = 'top', theme }) => ({
  left: 0,
  zIndex: 9,
  height: 80,
  width: '100%',
  position: 'absolute',
  clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
  backgroundColor: theme.palette.background.default,
  display: 'block',
  lineHeight: 0,
  ...(anchor === 'top' && {
    top: -1,
    transform: 'scale(-1, -1)',
    backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.grey[500], 0.04) : alpha(theme.palette.grey[500], 0.04)
  }),
  ...(anchor === 'bottom' && {
    bottom: -1,
    backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.grey[500], 0.04) : alpha(theme.palette.grey[500], 0.04)
  })
}))
*/
// white #F4F6F8
// previo   bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04)
/*
export const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24'
}
*/
// ----------------------------------------------------------------------

export default function HomeView() {
  const { scrollYProgress } = useScroll()
  // const theme = useTheme()
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

        <HomeStackTech />

        <HomeFaQ />

        <HomeGetStarter />
      </Box>
    </MainLayout>
  )
}
