'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

import { _mapContact } from 'src/app/api/_data/_mock'

import ContactMap from '../contact-map'
import ContactHero from '../contact-hero'
import ContactForm from '../contact-form'

// ----------------------------------------------------------------------

export default function ContactView() {
  return (
    <>
      <ContactHero />

      <Container sx={{ py: 10 }}>
        <Box
          gap={10}
          display='grid'
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)'
          }}
        >
          <ContactForm />

          <ContactMap contacts={_mapContact} />
        </Box>
      </Container>
    </>
  )
}
