import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

export default function HomeFaQ() {
  const { t } = useTranslate()

  const _faqs = Array.from({ length: 7 }, (_, index) => {
    const id = Math.random().toString(36).substr(2, 9)
    return {
      id,
      question: t(`home.faq.faqs.faq${index + 1}.question`) || '',
      answer: t(`home.faq.faqs.faq${index + 1}.answer`) || ''
    }
  })

  const renderDescription = (
    <Stack spacing={3} sx={{ mb: 10, textAlign: 'center' }}>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: false, margin: '-150px' }}
      >
        <Typography component='div' variant='overline' sx={{ mb: 2, color: 'text.disabled' }}>
          {t('home.faq.tag')}
        </Typography>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: false, margin: '-150px' }}
      >
        <Typography variant='h2'> {t('home.faq.title')}</Typography>
      </m.div>
    </Stack>
  )

  const renderFaQ = (
    <m.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: false, margin: '-150px' }}
    >
      {_faqs &&
        _faqs.map((accordion: any, index: number) => (
          <m.div
            key={accordion.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            viewport={{ once: false, margin: '-150px' }}
          >
            <Accordion>
              <AccordionSummary expandIcon={<Iconify icon='eva:arrow-ios-downward-fill' />}>
                <Typography variant='subtitle1'>{accordion.question}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Typography>{accordion.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          </m.div>
        ))}
    </m.div>
  )

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 }
      }}
    >
      <Container>
        {renderDescription}

        {renderFaQ}
      </Container>
    </Box>
  )
}
