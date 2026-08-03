'use client'

import { useScroll } from 'framer-motion'

import Box from '@mui/material/Box'

import MainLayout from 'src/layouts/main'

import ScrollProgress from 'src/components/scroll-progress'

import B2BCta from '../b2b/b2b-cta'
import B2BHero from '../b2b/b2b-hero'
import B2BLoop from '../b2b/b2b-loop'
import B2BProof from '../b2b/b2b-proof'
import B2BOffer from '../b2b/b2b-offer'
import B2BMarket from '../b2b/b2b-market'

// ----------------------------------------------------------------------

/** B2B page: WhatsApp payment infrastructure pitch for partner fintechs. */
export default function B2BView(): JSX.Element {
  const { scrollYProgress } = useScroll()

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        <B2BHero />

        <B2BProof />

        <B2BLoop />

        <B2BOffer />

        <B2BMarket />

        <B2BCta />
      </Box>
    </MainLayout>
  )
}
