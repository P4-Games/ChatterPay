import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'

import { useTranslate } from 'src/locales'
import { CHATIZALO_PHONE_NUMBER } from 'src/config-global'
import { allCountries } from 'src/app/api/services/db/_data/countries-data'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

// Format the phone number from 5491164629653 to +54 9 11 6462 9653
const formatPhoneNumber = (phoneNumber: string) => {
  // Search for the country code that matches the beginning of the number
  let countryCode = '';
  let countryPhoneCode = '';
  
  // Find the longest matching country code
  allCountries.forEach((country) => {
    if (phoneNumber.startsWith(country.phone) && country.phone.length > countryPhoneCode.length) {
      countryPhoneCode = country.phone;
      countryCode = country.code;
    }
  });
  
  // If no code is found, return the number as is
  if (!countryPhoneCode) {
    return phoneNumber;
  }
  
  // Extract the rest of the number without the country code
  const rest = phoneNumber.substring(countryPhoneCode.length);
  
  // Special case for Argentina (format +54 9 11 6462 9653)
  if (countryCode === 'AR' && rest.startsWith('9')) {
    const areaCode = rest.substring(1, 3);
    const firstPart = rest.substring(3, 7);
    const secondPart = rest.substring(7);
    return `+${countryPhoneCode} 9 ${areaCode} ${firstPart} ${secondPart}`;
  }
  
  // Generic format: divide the rest into groups of 3-4 digits
  let formattedRest = '';
  let remainingDigits = rest;
  
  while (remainingDigits.length > 0) {
    const chunk = remainingDigits.substring(0, Math.min(4, remainingDigits.length));
    formattedRest += chunk + (remainingDigits.length > 4 ? ' ' : '');
    remainingDigits = remainingDigits.substring(Math.min(4, remainingDigits.length));
  }
  
  return `+${countryPhoneCode} ${formattedRest.trim()}`;
};

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
                <Typography>{accordion.answer.replace('{PHONE}', formatPhoneNumber(String(CHATIZALO_PHONE_NUMBER)))}</Typography>
              </AccordionDetails>
            </Accordion>
          </m.div>
        ))}
    </m.div>
  )

  return (
    <Box
      id='faq'
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
