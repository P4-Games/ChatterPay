'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

import FeesHero from '../fees-hero'
import FeesSection from '../fees-section'
import FeesDisclaimer from '../fees-disclaimer'
import FeesNetworksExtra from '../fees-networks-extra'
import { FEES_CONTENT } from '../fees-content'

// ----------------------------------------------------------------------

/** Extra blocks a section renders under its table, keyed by section id. */
const SECTION_FOOTERS: Record<string, React.ReactNode> = {
  networks: <FeesNetworksExtra />
}

export default function FeesView() {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Container maxWidth='md' sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 12 } }}>
        <FeesHero />

        {FEES_CONTENT.sections.map((section) => (
          <FeesSection key={section.id} section={section} footer={SECTION_FOOTERS[section.id]} />
        ))}

        <FeesDisclaimer />
      </Container>
    </Box>
  )
}
