import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'

import { useTranslate } from 'src/locales'
import { BOT_WAPP_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeFaQ() {
  const { t } = useTranslate()
  const contactUsUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('home.common.contact-us-wapp-msg'))

  const _faqs = Array.from({ length: 10 }, (_, index) => {
    const id = Math.random().toString(36).substr(2, 9)
    return {
      id,
      question: t(`home.faq.faqs.faq${index + 1}.question`) || '',
      answer: t(`home.faq.faqs.faq${index + 1}.answer`) || ''
    }
  })

  const renderDescription = (
    <Stack spacing={3} sx={{ mb: 10, textAlign: 'center' }}>
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ mb: 2, color: 'text.disabled' }}>
          {t('home.faq.tag')}
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography variant='h2'> {t('home.faq.title')}</Typography>
      </m.div>
    </Stack>
  )

  const renderFaQ = (
    <div>
      {_faqs &&
        _faqs.map((accordion: any) => (
          <Accordion key={accordion.id}>
            <AccordionSummary expandIcon={<Iconify icon='eva:arrow-ios-downward-fill' />}>
              <Typography variant='subtitle1'>{accordion.question}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography>{accordion.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
    </div>
  )

  const renderMoreQuestions = (
    <m.div variants={varFade().in}>
      <Box
        sx={{
          textAlign: 'center',
          mt: {
            xs: 5,
            md: 10
          }
        }}
      >
        <m.div variants={varFade().inDown}>
          <Typography variant='h4'>{t('home.faq.still-title')}</Typography>
        </m.div>

        <m.div variants={varFade().inDown}>
          <Typography sx={{ mt: 2, mb: 5, color: 'text.secondary' }}>
            {t('home.faq.still-description')}
          </Typography>
        </m.div>

        <m.div variants={varFade().inUp}>
          <Button
            color='inherit'
            size='large'
            variant='contained'
            target='_blank'
            rel='noopener'
            href={contactUsUrl}
          >
            {t('home.common.contact-us')}
          </Button>
        </m.div>
      </Box>
    </m.div>
  )

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 }
      }}
    >
      <Container component={MotionViewport}>
        {renderDescription}

        {renderFaQ}

        {renderMoreQuestions}
      </Container>
    </Box>
  )
}
