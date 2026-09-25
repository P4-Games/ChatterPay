'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

import FeesHero from '../fees-hero'
import FeesSection from '../fees-section'
import FeesNetworks from '../fees-networks'
import FeesDisclaimer from '../fees-disclaimer'
import FeesNetworksExtra from '../fees-networks-extra'
import { FEES_CONTENT } from '../fees-content'

// ----------------------------------------------------------------------

/**
 * Extra blocks a network panel renders under its fees, keyed by tab id. The bridge destinations
 * are reachable from the EVM balance, so they belong to that panel and to no other.
 */
const NETWORK_FOOTERS: Record<string, React.ReactNode> = {
  evm: <FeesNetworksExtra />
}

export default function FeesView() {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Container maxWidth='md' sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 12 } }}>
        <FeesHero />

        {FEES_CONTENT.sections.map((section) =>
          section.kind === 'networks' ? (
            <FeesNetworks key={section.id} section={section} footers={NETWORK_FOOTERS} />
          ) : (
            <FeesSection key={section.id} section={section} />
          )
        )}

        <FeesDisclaimer />
      </Container>
    </Box>
  )
}
